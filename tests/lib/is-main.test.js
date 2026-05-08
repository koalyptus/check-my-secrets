import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { pathToFileURL } from 'node:url';
import { mkdtempSync, writeFileSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { isMain } from '../../lib/is-main.mjs';

function symlinksSupported() {
  const dir = mkdtempSync(join(tmpdir(), 'symlink-check-'));
  try {
    symlinkSync(join(dir, 'a'), join(dir, 'b'));
    return true;
  } catch {
    return false;
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const hasSymlinks = symlinksSupported();

describe('isMain', () => {
  let tmpDir;
  let argv1Backup;

  beforeEach(() => {
    argv1Backup = process.argv[1];
    tmpDir = mkdtempSync(join(tmpdir(), 'is-main-test-'));
  });

  afterEach(() => {
    process.argv[1] = argv1Backup;
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should return true when argv[1] resolves to the same path', () => {
    const file = join(tmpDir, 'file.js');
    writeFileSync(file, '');
    process.argv[1] = file;
    expect(isMain(pathToFileURL(file).href)).toBe(true);
  });

  it.skipIf(!hasSymlinks)('should return true when argv[1] is a symlink to the file', () => {
    const realFile = join(tmpDir, 'real.js');
    const linkFile = join(tmpDir, 'link.js');
    writeFileSync(realFile, '');
    symlinkSync(realFile, linkFile);
    process.argv[1] = linkFile;
    expect(isMain(pathToFileURL(realFile).href)).toBe(true);
  });

  it('should return false when argv[1] resolves to a different path', () => {
    const a = join(tmpDir, 'a.js');
    const b = join(tmpDir, 'b.js');
    writeFileSync(a, '');
    writeFileSync(b, '');
    process.argv[1] = a;
    expect(isMain(pathToFileURL(b).href)).toBe(false);
  });

  it('should return false when argv[1] is undefined', () => {
    delete process.argv[1];
    expect(isMain(pathToFileURL(join(tmpDir, 'x.js')).href)).toBe(false);
  });

  it('should return false when argv[1] does not exist', () => {
    process.argv[1] = join(tmpDir, 'nonexistent.js');
    expect(isMain(pathToFileURL(join(tmpDir, 'x.js')).href)).toBe(false);
  });
});
