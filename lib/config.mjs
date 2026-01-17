import 'dotenv/config.js';
import { DEFAULT_PASSWORDS_KEY, DEFAULT_PASSWORDS_SEPARATOR } from './constants.mjs';

export function config() {
  return {
    passwordsKey: process.env.PWDS_KEY || DEFAULT_PASSWORDS_KEY,
    passwordsSeparator: process.env.PWDS_SEPARATOR || DEFAULT_PASSWORDS_SEPARATOR
  };
}
