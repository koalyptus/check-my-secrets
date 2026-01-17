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

# Key used by Keyring to store the comma (or symbol of your choice) separated passwords
PWDS_KEY=checkmysecrets.{your-key-for-passwords}

# Symbol used to separate passwords, defaults to `,`
PWDS_SEPARATOR={separator_here}
```
:warning: If env file is not present the script will default to following values in same order of appearance in `.env` file:
```bash
checkmysecrets.pwds
,
```
Please note that failing to provide a `.env` poses obvious security risks as the key is publicly disclosed here.

4. Manage your passwords using the following commands:

   - **Add a password:**
     ```bash
     npm run secrets:add <your-password>
     ```
     This will add `<your-password>` to your keyring. If the password already exists, it will not be added again.

   - **List all stored passwords:**
     ```bash
     npm run secrets:list
     ```
     This will display a table of your stored passwords after an interactive confirmation.

   - **Delete a password:**
     ```bash
     npm run secrets:delete <password-to-delete>
     ```
     This will remove `<password-to-delete>` from your keyring.

   - **Check all your passwords:**
     ```bash
     npm start
     ```
     or
      ```bash
     npm run secrets:check
     ```
     This command will check the integrity of all passwords stored in your keyring. Depending on your OS, a notification will pop up similar to below:

![Check My Secrets notification](https://raw.githubusercontent.com/koalyptus/check-my-secrets/v0.0.1/assets/success-screenshot.png)

