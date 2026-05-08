import { fileURLToPath } from 'node:url';
import { realpathSync } from 'node:fs';

export function isMain(importMetaUrl) {
  try {
    return realpathSync(process.argv[1] || '') === realpathSync(fileURLToPath(importMetaUrl));
  } catch {
    return false;
  }
}
