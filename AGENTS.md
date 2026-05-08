# AGENTS.md

## Project Type
Node.js CLI tool (ESM modules) that checks if stored passwords are compromised using the HaveIBeenPwned API.

## Critical Configuration
- CLI loads config from GLOBAL location: `~/.check-my-secrets/.env` (NOT repo `.env`)
- Setup creates global config: `npm run setup`
- Requires `PWDS_KEY` and `PWDS_SEPARATOR` in `~/.check-my-secrets/.env`
- For visible password input: set `PWDS_INPUT_MODE=cli` in `~/.check-my-secrets/.env`

## Core Commands
- **Setup:** `npm run setup` (creates global config)
- **Test (with coverage):** `npm test`
- **Test single:** `npm test -- tests/lib/config.test.js`
- **Format:** `npm run format:fix`
- **Lint:** `npm run lint`
- **Secrets:**
  - Add: `npm run secrets:add`
  - List: `npm run secrets:list`
  - Delete: `npm run secrets:delete`
  - Check: `npm run secrets:check` (alias: `npm start`)

## Development Workflow
- Link for global dev access: `npm link`
- Unlink when done: `npm unlink -g check-my-secrets`
- Entrypoints: `bin/` directory
- Library: `lib/` directory

## Requirements & Notes
- Node >= 17 required
- Uses vitest (not jest) for testing
- Code style: single quotes, 120 print width, LF line endings
- Uses `@napi-rs/keyring` with service name "check-my-secrets"; key identifier defaults to "checkmysecrets.pwds" but is configurable via PWDS_KEY