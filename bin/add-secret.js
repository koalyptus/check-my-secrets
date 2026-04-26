#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { Entry } from '@napi-rs/keyring';
import { SERVICE } from '../lib/constants.mjs';
import { config } from '../lib/config.mjs';
import { logger } from '../lib/logger.mjs';

function main() {
  const argv = yargs(hideBin(process.argv)).argv;
  const newPassword = argv._[0];

  if (!newPassword || newPassword.trim() === '') {
    logger.log({ level: 'error', message: 'Please provide a non-empty password to add.' });
    return;
  }

  const { passwordsKey, passwordsSeparator } = config();

  try {
    const entry = new Entry(SERVICE, passwordsKey);
    let passwords = entry.getPassword();
    let passwordList = [];

    if (passwords) {
      passwordList = passwords.split(passwordsSeparator);
    }

    if (passwordList.includes(newPassword)) {
      logger.log({ level: 'warn', message: 'Password already exists.' });

      return;
    }

    passwordList.push(newPassword);
    passwords = passwordList.join(passwordsSeparator);

    entry.setPassword(passwords);
    logger.log({ level: 'info', message: 'Password successfully added.' });
  } catch (error) {
    logger.log({ level: 'error', message: `Error adding password: ${error}` });

    return;
  }
}

main();
