import { config as dotenvConfig } from 'dotenv';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { CONFIG_DIR } from './constants.mjs';
import { DEFAULT_PASSWORDS_KEY, DEFAULT_PASSWORDS_SEPARATOR, DEFAULT_INPUT_MODE } from './constants.mjs';

// Load .env from a single, global location in the user's home directory.
dotenvConfig({ path: join(homedir(), CONFIG_DIR, '.env') });

export function config() {
  return {
    passwordsKey: process.env.PWDS_KEY || DEFAULT_PASSWORDS_KEY,
    passwordsSeparator: process.env.PWDS_SEPARATOR || DEFAULT_PASSWORDS_SEPARATOR,
    inputMode: process.env.PWDS_INPUT_MODE || DEFAULT_INPUT_MODE
  };
}
