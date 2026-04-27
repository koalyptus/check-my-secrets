import { config as dotenvConfig } from 'dotenv';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { DEFAULT_PASSWORDS_KEY, DEFAULT_PASSWORDS_SEPARATOR, DEFAULT_INPUT_MODE, CONFIG_DIR } from './constants.mjs';

dotenvConfig({ path: join(homedir(), CONFIG_DIR, '.env') });

export const DEFAULT_OPTIONS = [
  {
    key: 'PWDS_KEY',
    value: DEFAULT_PASSWORDS_KEY,
    comment:
      'Key used by Keyring to store the label for your passwords. This is an identifier stored in your keyring; do NOT store encryption keys here.'
  },
  {
    key: 'PWDS_SEPARATOR',
    value: DEFAULT_PASSWORDS_SEPARATOR,
    comment: 'Symbol used to separate passwords'
  },
  {
    key: 'PWDS_INPUT_MODE',
    value: DEFAULT_INPUT_MODE,
    comment: "Input mode for adding/deleting passwords: 'prompt' (hidden) or 'cli' (visible arguments)"
  }
];

export function config() {
  return {
    passwordsKey: process.env.PWDS_KEY || DEFAULT_PASSWORDS_KEY,
    passwordsSeparator: process.env.PWDS_SEPARATOR || DEFAULT_PASSWORDS_SEPARATOR,
    inputMode: process.env.PWDS_INPUT_MODE || DEFAULT_INPUT_MODE
  };
}
