import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export function isMain(importMetaUrl) {
  return resolve(process.argv[1] || '') === fileURLToPath(importMetaUrl);
}
