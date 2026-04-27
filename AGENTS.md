# AGENTS.md

## Project Type
Node.js CLI tool (ESM modules) that checks if stored passwords are compromised using the HaveIBeenPwned API.

## Commands
- **Run tests:** `npm test`
- **Run single test:** `npm test -- tests/lib/config.test.js`
- **Test coverage:** `npm run test:coverage`
- **Format code:** `npm run format:fix`
- **Lint code:** `npm run lint`
- **Setup config:** `npm run setup` (creates `~/.check-my-secrets/.env`)

## Secret Management Commands
- `npm run secrets:add` - Add a password (hidden input by default)
- `npm run secrets:list` - List all stored passwords
- `npm run secrets:delete` - Delete a password (hidden input by default)
- `npm run secrets:check` - Check all passwords (also `npm start`)

Use `PWDS_INPUT_MODE=cli` in `.env` to use visible CLI arguments instead.

## Important Notes
- Requires Node >= 17
- CLI loads config from global location: `~/.check-my-secrets/.env` (not `.env` in repo root)
- Uses vitest for testing (not jest)
- Code style: single quotes, 120 print width, LF line endings
- Entry points in `bin/` directory, library code in `lib/`