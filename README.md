# Check My Secrets

> NodeJS script checking whether any of the passwords used online are compromised.

It uses the `';--have i been pwned?` V3 API, specifically the `GET` `https://api.pwnedpasswords.com/range/{first 5 hash chars}` to determine if a password is compromised.

## Requirements
- Node >= `v17`

## Getting started

1. Clone the repo :point_up:, for example:
```bash
git clone https://github.com/koalyptus/check-my-secrets.git
```

2. Install all the requirements:
```bash
npm install
```

3. Create a `.env` file at same location of this README with following definitions:
```bash
# Replace the curly brackets too!

# Encryption key used by Keyring
ENCRYPTION_KEY={your-encryption-key-here}

# Symbol used to separate passwords, defaults to `,`
PWDS_SEPARATOR={separator_here}

# Key used by Keyring to store the comma (or symbol of your choice) separated passwords
PWDS_KEY=checkmysecrets.{your-key-for-passwords}
```
:warning: If env file is not present the script will default to following values in same order of appearance in `.env` file:
```bash
hello-world-123
,
checkmysecrets.pwds
```
Please note that failing to provide a `.env` poses obvious security risks as the encryption key is publicly disclosed here.

4. In command line use following command to set the comma (or any symbol of your choice) separated passwords in Keyring:
```bash
keyring store -k checkmysecrets.{PWDS_KEY HERE} -v 'my-password,another-password' -e -p {ENCRYPTION_KEY HERE}
```
:warning: the command even when executed successfully outputs some warnings related to deprecated dependencies. Disregard these for the time being.

To list the passwords use the following command:
```bash
keyring retrieve -k 'checkmysecrets.{PWDS_KEY HERE}' -d -p '{ENCRYPTION_KEY HERE}'
```
5. Finally use `npm start` command to check the integrity of your passwords, alternatively `node bin/check-my-secrets`. Depending on the OS a notification similar to below should pop-out:

![Check My Secrets notification](https://raw.githubusercontent.com/koalyptus/check-my-secrets/v0.0.1/assets/success-screenshot.png)

