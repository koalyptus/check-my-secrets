#!/usr/bin/env node

import { Entry } from '@napi-rs/keyring';
import { DEFAULT_PASSWORDS_KEY, DEFAULT_PASSWORDS_SEPARATOR, SERVICE } from '../lib/constants.mjs';
import { logger } from '../lib/logger.mjs';

async function listSecrets() {
  const passwordsKey = process.env.PWDS_KEY || DEFAULT_PASSWORDS_KEY;
  const passwordsSeparator = process.env.PWDS_SEPARATOR || DEFAULT_PASSWORDS_SEPARATOR;

  try {
    const entry = new Entry(SERVICE, passwordsKey);
    const passwords = entry.getPassword();
    if (passwords) {
      const uniquePasswords = [...new Set(passwords.split(passwordsSeparator))];
      console.table(passwords);
      console.table(uniquePasswords);
    } else {
      logger.log({ level: 'warn', message: 'Provided key is not defined in keyring. ' + README_STORE_SECRETS });
    }
  } catch (error) {
    logger.log({ level: 'error', message: error });
    process.exit(1);
  }
}

listSecrets();
