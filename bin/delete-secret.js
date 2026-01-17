#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { Entry } from '@napi-rs/keyring';
import { SERVICE } from '../lib/constants.mjs';
import { config } from '../lib/config.mjs';
import { logger } from '../lib/logger.mjs';

function main() {
  const argv = yargs(hideBin(process.argv)).argv;
  const passwordToDelete = argv._[0];

  if (!passwordToDelete) {
    logger.log({ level: 'error', message: 'Please provide a password to delete.' });
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

    const initialLength = passwordList.length;
    passwordList = passwordList.filter((p) => p !== passwordToDelete);

    if (passwordList.length === initialLength) {
      logger.log({ level: 'warn', message: `Password not found.` });
    } else {
      passwords = passwordList.join(passwordsSeparator);
      entry.setPassword(passwords);
      logger.log({ level: 'info', message: 'Password successfully deleted.' });
    }
  } catch (error) {
    logger.log({ level: 'error', message: `Error deleting password: ${error}` });
  }
}

main();
