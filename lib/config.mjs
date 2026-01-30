import { config as dotenvConfig } from 'dotenv';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { DEFAULT_PASSWORDS_KEY, DEFAULT_PASSWORDS_SEPARATOR } from './constants.mjs';

// Load .env from a single, global location in the user's home directory.
dotenvConfig({ path: join(homedir(), '.check-my-secrets', '.env') });

export function config() {
  return {
    passwordsKey: process.env.PWDS_KEY || DEFAULT_PASSWORDS_KEY,
    passwordsSeparator: process.env.PWDS_SEPARATOR || DEFAULT_PASSWORDS_SEPARATOR
  };
}
