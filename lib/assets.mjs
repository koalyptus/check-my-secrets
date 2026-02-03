import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const assetsPath = path.join(__dirname, '..', 'assets');
export const errorIconPath = path.join(assetsPath, 'Error.png');
export const successIconPath = path.join(assetsPath, 'CompleteCheckmark.png');

export function iconPath(compromised) {
  return compromised ? errorIconPath : successIconPath;
}
