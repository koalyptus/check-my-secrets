import fetch from 'node-fetch';
import { logger } from '../lib/logger.mjs';
const { createHash } = await import('node:crypto');

export async function checkPasswords(passwords = []) {
  let nbCompromised = 0;
  let nbSkipped = 0;
  let detailsCollection = [];
  let details = '';

  for (let password of passwords) {
    password = password.trim();

    if (password === '') {
      continue;
    }

    // Hash the password using SHA-1
    const hash = createHash('sha1')
      .update(password)
      .digest('hex')
      .toUpperCase();

    const isCompromised = await checkHash(hash);

    if (isCompromised === null) {
      nbSkipped++;
    }

    if (isCompromised) {
      detailsCollection = detailsCollection.concat(`'${password}'\n`);
      details = detailsCollection.join('');
      nbCompromised++;
    }
  }

  if (nbSkipped > 0) {
    return {
      compromised: nbCompromised > 0,
      message: `Checked ${passwords.length} passwords, ${nbSkipped} skipped, ${nbCompromised} compromised` +
      (nbCompromised > 0  ? `:
${details}` : `.`)
    };
  }

  if (nbCompromised > 0) {
    return {
      compromised: true,
      message: `Checked ${passwords.length} passwords, ${nbCompromised} compromised:
${details}`
    };
  }

  return {
    compromised: false,
    message: `Checked ${passwords.length} passwords, 0 compromised.`
  };
}

async function checkHash(hash = '') {
  // Get the first 5 characters of the hash
  const prefix = hash.slice(0, 5);

  // Get the rest of the hash
  const suffix = hash.slice(5);

  try {
    // Send a GET request to the Pwned Passwords API
    const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    const body = await res.text();

    if (res.status !== 200) {
      logger.log({
        level: 'error',
        message: `GET ${res.url} returned "${body}"`
      });

      return null;
    }

    // Check if the suffix of the hash is in the response from the API
    return body.split('\n')
      .find(line => line.startsWith(suffix)) ? true : false;
  } catch(ex) {
    logger.log({
      level: 'error',
      message: JSON.stringify(ex, null, 2)
    });

    return null;
  }
}
