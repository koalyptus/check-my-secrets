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

3. Run the setup command to create your global config folder and a default `.env` file:

```bash
npm run setup
```

This will create a folder at `~/.check-my-secrets` and place a default `.env` file inside it. You can then open this `.env` file in your preferred text editor to customize your `PWDS_KEY` and `PWDS_SEPARATOR`.

:warning: The CLI loads configuration from the single global location: `~/.check-my-secrets/.env`.
If this file is not present, or if `PWDS_KEY` or `PWDS_SEPARATOR` are not defined within it, the script will fall back to the built-in defaults:

```bash
checkmysecrets.pwds
,
```

Security notes:

- `PWDS_KEY` is only a keyring identifier (safe to store). Do NOT store the actual encryption key or plaintext secrets in this file.
- Restrict file permissions so only your user can read it (on Unix: `chmod 600 ~/.check-my-secrets/.env`).
- On Windows, ensure the file ACL only grants access to your user account.

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

## Development

### Setup for Local Development

To use the CLI commands globally while developing, link the package locally:

```bash
npm link
```

This creates symlinks for all CLI commands, making them available system-wide:
- `check-my-secrets` - Check all stored passwords
- `secrets-add` - Add a password
- `secrets-check` - Check all stored passwords
- `secrets-delete` - Delete a password
- `secrets-list` - List all passwords

Example:
```bash
check-my-secrets
secrets-add MyPassword123
secrets-list
secrets-delete MyPassword123
```

To unlink when done:
```bash
npm unlink -g check-my-secrets
```

### Running Tests

Run all tests:
```bash
npm test
```

Run specific test suite:
```bash
npm test -- tests/lib/config.test.js
```

Test coverage:
```bash
npm run test:coverage
```

### Code Quality

Format code:
```bash
npm run format:fix
```

Lint code:
```bash
npm run lint
```

