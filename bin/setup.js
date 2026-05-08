#!/usr/bin/env node

import { isMain } from '../lib/is-main.mjs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { CONFIG_DIR } from '../lib/constants.mjs';
import { DEFAULT_OPTIONS } from '../lib/config.mjs';

const configDir = join(homedir(), CONFIG_DIR);
const envFilePath = join(configDir, '.env');

export function runSetup() {
  try {
    mkdirSync(configDir, { recursive: true });
    console.log(`Config directory ensured: ${configDir}`);

    if (!existsSync(envFilePath)) {
      let envContent = '';
      for (const option of DEFAULT_OPTIONS) {
        envContent += `# ${option.comment}\n${option.key}=${option.value}\n\n`;
      }
      envContent = envContent.trimEnd();

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
      const addedKeys = [];

      for (const option of DEFAULT_OPTIONS) {
        if (!existingKeys.has(option.key)) {
          mergedContent += `\n\n# ${option.comment}\n${option.key}=${option.value}\n`;
          addedKeys.push(option.key);
        }
      }

      if (addedKeys.length > 0) {
        writeFileSync(envFilePath, mergedContent + '\n');
        console.log(`.env file updated with: ${addedKeys.join(', ')}`);
      } else {
        console.log(`.env file already up to date: ${envFilePath}`);
      }

      console.log('Please open this file in your preferred text editor to customize your settings.');
    }
  } catch (err) {
    console.error('Failed to setup config:', err);
    throw err;
  }
}

if (isMain(import.meta.url)) {
  runSetup();
}
