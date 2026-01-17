#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { Entry } from '@napi-rs/keyring';
import { DEFAULT_PASSWORDS_KEY, DEFAULT_PASSWORDS_SEPARATOR, SERVICE } from '../lib/constants.mjs';
import { logger } from '../lib/logger.mjs';

async function addSecret() {
  const argv = yargs(hideBin(process.argv)).argv;
  const newPassword = argv._[0];

  if (!newPassword) {
    logger.log({ level: 'error', message: 'Please provide a password to add.' });
    process.exit(1);
  }

  const passwordsKey = process.env.PWDS_KEY || DEFAULT_PASSWORDS_KEY;
  const passwordsSeparator = process.env.PWDS_SEPARATOR || DEFAULT_PASSWORDS_SEPARATOR;

  try {
    const entry = new Entry(SERVICE, passwordsKey);
    let passwords = entry.getPassword();
    let passwordList = [];

    if (passwords) {
      passwordList = passwords.split(passwordsSeparator);
    }

    if (passwordList.includes(newPassword)) {
      logger.log({ level: 'warn', message: 'Password already exists.' });
    } else {
      passwordList.push(newPassword);
      passwords = passwordList.join(passwordsSeparator);

      entry.setPassword(passwords);
      logger.log({ level: 'info', message: 'Password successfully added.' });
    }
  } catch (error) {
    logger.log({ level: 'error', message: `Error adding password: ${error}` });
    process.exit(1);
  }
}

addSecret();
