#!/usr/bin/env node

import { homedir } from 'node:os';
import { join } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';
import { DEFAULT_PASSWORDS_KEY, DEFAULT_PASSWORDS_SEPARATOR, CONFIG_DIR } from '../lib/constants.mjs';

const configDir = join(homedir(), CONFIG_DIR);
const envFilePath = join(configDir, '.env');

try {
  mkdirSync(configDir, { recursive: true });
  console.log(`Config directory ensured: ${configDir}`);

  const envContent = `# Key used by Keyring to store the label for your passwords\n` +
    `# This is an identifier stored in your keyring; do NOT store encryption keys here.\n` +
    `PWDS_KEY=${DEFAULT_PASSWORDS_KEY}\n\n` +
    `# Symbol used to separate passwords\n` +
    `PWDS_SEPARATOR=${DEFAULT_PASSWORDS_SEPARATOR}\n`;

  writeFileSync(envFilePath, envContent, { flag: 'wx' }); // 'wx' to create and write, error if exists
  console.log(`Default .env file created: ${envFilePath}`);
  console.log('Please open this file in your preferred text editor to customize your settings.');
} catch (err) {
  if (err.code === 'EEXIST') {
    console.log(`.env file already exists at: ${envFilePath}`);
    console.log('You can open this file in your preferred text editor to customize your settings.');
  } else {
    console.error('Failed to setup config:', err);
    process.exit(1);
  }
}

process.exit(0);