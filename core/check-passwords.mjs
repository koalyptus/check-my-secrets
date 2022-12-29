import fetch from 'node-fetch';
const { createHash } = await import('node:crypto');

export async function checkPasswords(passwords = []) {
  let nbCompromised = 0
  let outputDetails = []

  for (let password of passwords) {
    password = password.trim()

    // Hash the password using SHA-1
    const hash = createHash('sha1')
      .update(password)
      .digest('hex')
      .toUpperCase();

    const isCompromised = await checkHash(hash);

    if (isCompromised) {
      outputDetails = outputDetails.concat(`${password}\n`);
      nbCompromised++;
    }
  }

  if (nbCompromised > 0) {
    return {
      compromised: true,
      message: `Checked ${passwords.length} passwords, ${nbCompromised} compromised:
${outputDetails.join('')}`
    }
  }

  return {
    compromised: false,
    message: `Checked ${passwords.length} passwords, none is compromised.`
  }
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

    // Check if the suffix of the hash is in the response from the API
    return body.split('\n')
      .find(line => line.startsWith(suffix)) ? true : false;
  } catch(ex) {
    // TODO: check http status & return meaningful message to user
    return false
  }
}
