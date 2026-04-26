#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { Entry } from '@napi-rs/keyring';
import readline from 'readline';
import { SERVICE } from '../lib/constants.mjs';
import { config } from '../lib/config.mjs';
import { logger } from '../lib/logger.mjs';

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

async function hiddenInput(promptText) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(promptText, (answer) => {
      rl.close();
      resolve(answer);
    });

    rl.stdoutMuted = true;
    rl._writeToOutput = function (stringToWrite) {
      if (rl.stdoutMuted) {
        rl.output.write('*'.repeat(stringToWrite.length));
      } else {
        rl.output.write(stringToWrite);
      }
    };
  });
}

function maskPassword(password) {
  if (password.length <= 4) {
    return '*'.repeat(password.length);
  }
  return password.slice(0, 2) + '*'.repeat(password.length - 2);
}

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
      console.log('Press any key to reveal, or Enter to confirm deletion');
      const reveal = await askQuestion('');
      if (reveal !== '\n' && reveal !== '') {
        console.log(`Stored password: ${storedPassword}`);
        await askQuestion('Press Enter to continue');
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
