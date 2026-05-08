import { describe, it, expect } from 'vitest';
import { assetsPath, errorIconPath, successIconPath, iconPath } from '../../lib/assets.mjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const expectedAssetsDir = path.resolve(__dirname, '..', '..', 'assets');

describe('assets', () => {
  it('should export assetsPath pointing to assets directory', () => {
    expect(assetsPath).toBe(expectedAssetsDir);
  });

  it('should export errorIconPath pointing to Error.png', () => {
    expect(errorIconPath).toBe(path.join(expectedAssetsDir, 'Error.png'));
  });

  it('should export successIconPath pointing to CompleteCheckmark.png', () => {
    expect(successIconPath).toBe(path.join(expectedAssetsDir, 'CompleteCheckmark.png'));
  });

  it('should return errorIconPath when compromised is true', () => {
    expect(iconPath(true)).toBe(errorIconPath);
  });

  it('should return successIconPath when compromised is false', () => {
    expect(iconPath(false)).toBe(successIconPath);
  });
});
