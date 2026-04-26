#!/usr/bin/env node

import { homedir } from 'node:os';
import { join } from 'node:path';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import {
  DEFAULT_PASSWORDS_KEY,
  DEFAULT_PASSWORDS_SEPARATOR,
  DEFAULT_INPUT_MODE,
  CONFIG_DIR
} from '../lib/constants.mjs';

const configDir = join(homedir(), CONFIG_DIR);
const envFilePath = join(configDir, '.env');

const newOptions = [
  {
    key: 'PWDS_INPUT_MODE',
    value: DEFAULT_INPUT_MODE,
    comment: "Input mode for adding/deleting passwords: 'prompt' (hidden) or 'cli' (visible arguments)"
  }
];

try {
  mkdirSync(configDir, { recursive: true });
  console.log(`Config directory ensured: ${configDir}`);

  if (!existsSync(envFilePath)) {
    const envContent =
      `# Key used by Keyring to store the label for your passwords\n` +
      `# This is an identifier stored in your keyring; do NOT store encryption keys here.\n` +
      `PWDS_KEY=${DEFAULT_PASSWORDS_KEY}\n\n` +
      `# Symbol used to separate passwords\n` +
      `PWDS_SEPARATOR=${DEFAULT_PASSWORDS_SEPARATOR}\n\n` +
      `# Input mode for adding/deleting passwords: 'prompt' (hidden) or 'cli' (visible arguments)\n` +
      `# PWDS_INPUT_MODE=${DEFAULT_INPUT_MODE}\n`;

    writeFileSync(envFilePath, envContent);
    console.log(`Default .env file created: ${envFilePath}`);
    console.log('Please open this file in your preferred text editor to customize your settings.');
  } else {
    const existingContent = readFileSync(envFilePath, 'utf-8');
    const existingKeys = new Set(
      existingContent
        .split('\n')
        .map((line) => line.split('=')[0].trim())
        .filter((key) => key && !key.startsWith('#'))
    );

    let mergedContent = existingContent.trim();

    for (const option of newOptions) {
      if (!existingKeys.has(option.key)) {
        mergedContent += `\n\n# ${option.comment}\n${option.key}=${option.value}\n`;
      }
    }

    if (mergedContent !== existingContent.trim()) {
      writeFileSync(envFilePath, mergedContent + '\n');
      console.log(`.env file updated with new options: ${envFilePath}`);
    } else {
      console.log(`.env file already up to date: ${envFilePath}`);
    }

    console.log('Please open this file in your preferred text editor to customize your settings.');
  }
} catch (err) {
  console.error('Failed to setup config:', err);
  process.exit(1);
}

process.exit(0);