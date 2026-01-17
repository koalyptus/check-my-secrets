#!/usr/bin/env node

import { Entry } from '@napi-rs/keyring';
import notifier from 'node-notifier';
import { checkPasswords } from '../lib/check-passwords.mjs';
import { logger } from '../lib/logger.mjs';
import { DEFAULT_PASSWORDS_KEY, DEFAULT_PASSWORDS_SEPARATOR, ERR_OSSL_BAD_DECRYPT, README_STORE_SECRETS, SERVICE } from '../lib/constants.mjs';

async function main() {
  const passwordsKey = process.env.PWDS_KEY || DEFAULT_PASSWORDS_KEY;
  // making the assumption commas are generally not allowed in passwords,
  // change the separator sequence if that not the case for you
  const passwordsSeparator = process.env.PWDS_SEPARATOR || DEFAULT_PASSWORDS_SEPARATOR;
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

      process.exit(1);
    }

    logger.log({ level: 'error', message: ex });

    process.exit(1);
  }

  if (passwords === null) {
    logger.log({
      level: 'warn',
      message: 'Provided key is not defined in keyring. ' + README_STORE_SECRETS
    });
  }

  if (typeof passwords !== 'string') {
    logger.log({
      level: 'warn',
      message: 'Provided value should only contain a string.'
    });
  }

  if (!passwords) {
    logger.log({
      level: 'warn',
      message: 'Could not find any value for provided key.'
    });
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
