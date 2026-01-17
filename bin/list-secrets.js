#!/usr/bin/env node

import { Entry } from '@napi-rs/keyring';
import { SERVICE, README_STORE_SECRETS } from '../lib/constants.mjs';
import { config } from '../lib/config.mjs';
import { logger } from '../lib/logger.mjs';
import readline from 'readline';

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }))
}

async function main() {
  const { passwordsKey, passwordsSeparator } = config();

  try {
    const entry = new Entry(SERVICE, passwordsKey);
    const passwords = entry.getPassword();

    if (passwords === null) {
      logger.log({
        level: 'warn',
        message: 'Provided key is not defined in keyring. ' + README_STORE_SECRETS
      });

      return;
    }

    if (passwords) {
      const answer = await askQuestion('Are you sure you want to display the list of passwords? (y/n) ');
      if (answer.toLowerCase() === 'y') {
        const uniquePasswords = [...new Set(passwords.split(passwordsSeparator))];
        console.table(uniquePasswords);

        return;
      }

      logger.log({ level: 'info', message: 'List passwords action cancelled.' });
    } else {
      logger.log({ level: 'warn', message: 'There are no passwords.' });
    }
  } catch (error) {
    logger.log({ level: 'error', message: error });
  }
}

main();
