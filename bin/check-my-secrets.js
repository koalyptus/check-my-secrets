#!/usr/bin/env node

import { Entry } from '@napi-rs/keyring';
import notifier from 'node-notifier';
import { checkPasswords } from '../lib/check-passwords.mjs';
import { logger } from '../lib/logger.mjs';
import { ERR_OSSL_BAD_DECRYPT, README_STORE_SECRETS, SERVICE } from '../lib/constants.mjs';
import { config } from '../lib/config.mjs';

async function main() {
  const { passwordsKey, passwordsSeparator } = config();

  let passwords;

  try {
    const entry = new Entry(SERVICE, passwordsKey);
    passwords = entry.getPassword();
  } catch (ex) {
    if (ex.code === ERR_OSSL_BAD_DECRYPT) {
      logger.log({
        level: 'warn',
        message: 'Unable to decrypt secrets with provided encryption key. ' + README_STORE_SECRETS
      });

      return;
    }

    logger.log({ level: 'error', message: ex });

    return;
  }

  if (passwords === null) {
    logger.log({
      level: 'warn',
      message: 'Provided key is not defined in keyring. ' + README_STORE_SECRETS
    });

    return;
  }

  if (typeof passwords !== 'string') {
    logger.log({
      level: 'warn',
      message: 'Provided value should only contain a string.'
    });

    return;
  }

  if (!passwords) {
    logger.log({
      level: 'warn',
      message: 'Could not find any value for provided key.'
    });

    return;
  }

  const uniquePasswords = [...new Set(passwords.split(passwordsSeparator))];
  const { compromised, message } = await checkPasswords(uniquePasswords);

  logger.log({
    level: compromised ? 'warn' : 'info',
    message
  });

  notifier.notify({
    appID: 'Check My Secrets',
    title: 'Scan result',
    icon: compromised ? 'assets/Error.png' : 'assets/CompleteCheckmark.png',
    message
  });
}

main();
