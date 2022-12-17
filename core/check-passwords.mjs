import fetch from 'node-fetch';
const { createHash } = await import('node:crypto');

export async function checkPasswords(passwords = []) {
  let nbCompromised = 0
  let outputDetails = []

  for (let [idx, password] of passwords.entries()) {
    password = password.trim()

    // Hash the password using SHA-1
    const hash = createHash('sha1')
      .update(password)
      .digest('hex')
      .toUpperCase();

    const isCompromised = await checkHash(hash);
    outputDetails = outputDetails.concat(`[${idx}] ${hash} compromised? --> ${isCompromised}\n`);

    if (isCompromised) {
      nbCompromised++;
    }
  }

  if (nbCompromised > 0) {
    console.warn(
      `Checked ${passwords.length} passwords, ${nbCompromised} compromised!
${outputDetails.join('')}`
    )
    return
  }

  console.log(`Checked ${passwords.length} passwords, none is compromised.`);
}

async function checkHash(hash = '') {
  // Get the first 5 characters of the hash
  const prefix = hash.slice(0, 5);

  // Get the rest of the hash
  const suffix = hash.slice(5);

  // Send a GET request to the Pwned Passwords API
  const res = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
  const body = await res.text();

  // Check if the suffix of the hash is in the response from the API
  return body.split('\n')
    .find(line => line.startsWith(suffix)) ? true : false;
}
