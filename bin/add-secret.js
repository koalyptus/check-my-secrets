#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { Entry } from '@napi-rs/keyring';
import { askQuestion, hiddenInput, maskPassword } from '../lib/input.mjs';
import { SERVICE } from '../lib/constants.mjs';
import { config } from '../lib/config.mjs';
import { logger } from '../lib/logger.mjs';

async function getPasswordFromCli() {
  const argv = yargs(hideBin(process.argv)).argv;
  return argv._[0];
}

async function getPasswordFromPrompt() {
  console.log('Enter password (input will be hidden):');
  const password = await hiddenInput('');
  return password;
}

async function getPassword() {
  const { inputMode } = config();

  let newPassword;

  if (inputMode === 'cli') {
    newPassword = await getPasswordFromCli();
  } else {
    newPassword = await getPasswordFromPrompt();
  }

  if (!newPassword || newPassword.trim() === '') {
    logger.log({ level: 'error', message: 'Please provide a non-empty password to add.' });
    return;
  }

  return { newPassword, inputMode };
}

async function confirmAndSave(newPassword, inputMode) {
  const { passwordsKey, passwordsSeparator } = config();

  const masked = maskPassword(newPassword);
  const confirmMsg = `Save password ${masked}? (y/n)`;

  if (inputMode === 'prompt') {
    console.log(`Password: ${masked}`);
    console.log('Type any character and press Enter to reveal, or press Enter to save');
    const reveal = await askQuestion('');
    if (reveal.trim() !== '') {
      console.log(`Password: ${newPassword}`);
    }
  }

  const answer = await askQuestion(confirmMsg);

  if (answer.toLowerCase() !== 'y') {
    logger.log({ level: 'info', message: 'Password not saved.' });
    return;
  }

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

async function main() {
  const result = await getPassword();

  if (!result) {
    return;
  }

  await confirmAndSave(result.newPassword, result.inputMode);
}

main();
