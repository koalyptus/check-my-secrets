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
  return String(argv._[0] || '').trim();
}

async function getPasswordFromPrompt() {
  console.log('Enter password to delete (input will be hidden):');
  return hiddenInput('');
}

async function getPassword() {
  const { inputMode } = config();

  let passwordToDelete;

  if (inputMode === 'cli') {
    passwordToDelete = await getPasswordFromCli();
  } else {
    passwordToDelete = await getPasswordFromPrompt();
  }

  if (!passwordToDelete) {
    logger.log({ level: 'error', message: 'Please provide a password to delete.' });
    return;
  }

  return { passwordToDelete, inputMode };
}

async function confirmAndDelete(passwordToDelete, inputMode) {
  const { passwordsKey, passwordsSeparator } = config();

  try {
    const entry = new Entry(SERVICE, passwordsKey);
    let passwords = entry.getPassword();
    let passwordList = [];

    if (passwords) {
      passwordList = passwords.split(passwordsSeparator);
    }

    const storedPassword = passwordList.find((p) => p.trim() === passwordToDelete);

    if (!storedPassword) {
      logger.log({ level: 'warn', message: 'Password not found.' });
      return;
    }

    const masked = maskPassword(storedPassword);
    console.log(`Stored password: ${masked}`);

    if (inputMode === 'prompt') {
      console.log('Type any character and press Enter to reveal, or press Enter to delete');
      const reveal = await askQuestion('');
      if (reveal.trim() !== '') {
        console.log(`Stored password: ${storedPassword}`);
      }
    }

    const confirmMsg = `Delete password ${masked}? (y/n)`;
    const answer = await askQuestion(confirmMsg);

    if (answer.toLowerCase() !== 'y') {
      logger.log({ level: 'info', message: 'Deletion cancelled.' });
      return;
    }

    const initialLength = passwordList.length;
    passwordList = passwordList.filter((p) => p.trim() !== passwordToDelete);

    if (passwordList.length === initialLength) {
      logger.log({ level: 'warn', message: 'Password not found.' });
    } else {
      passwords = passwordList.join(passwordsSeparator);
      entry.setPassword(passwords);
      logger.log({ level: 'info', message: 'Password successfully deleted.' });
    }
  } catch (error) {
    logger.log({ level: 'error', message: `Error deleting password: ${error}` });
  }
}

async function main() {
  const result = await getPassword();

  if (!result) {
    return;
  }

  await confirmAndDelete(result.passwordToDelete, result.inputMode);
}

main();
