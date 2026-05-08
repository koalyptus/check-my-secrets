import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { homedir } from 'node:os';
import { join } from 'node:path';

vi.mock('node:fs', () => ({
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
  existsSync: vi.fn(),
  readFileSync: vi.fn()
}));

import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { runSetup } from '../../bin/setup.js';

const CONFIG_DIR = '.check-my-secrets';
const configDir = join(homedir(), CONFIG_DIR);
const envFilePath = join(configDir, '.env');

describe('setup.js', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create config directory and default .env when none exists', () => {
    vi.mocked(existsSync).mockReturnValue(false);

    runSetup();

    expect(mkdirSync).toHaveBeenCalledWith(configDir, { recursive: true });
    expect(writeFileSync).toHaveBeenCalledWith(
      envFilePath,
      expect.stringContaining('PWDS_KEY=checkmysecrets.pwds')
    );
    expect(writeFileSync).toHaveBeenCalledWith(
      envFilePath,
      expect.stringContaining('PWDS_SEPARATOR=')
    );
  });

  it('should add missing keys to existing .env', () => {
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue('PWDS_KEY=my-key\n');

    runSetup();

    expect(writeFileSync).toHaveBeenCalledWith(
      envFilePath,
      expect.stringContaining('PWDS_KEY=my-key')
    );
    expect(writeFileSync).toHaveBeenCalledWith(
      envFilePath,
      expect.stringContaining('PWDS_SEPARATOR')
    );
  });

  it('should not modify up-to-date .env', () => {
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(
      'PWDS_KEY=my-key\nPWDS_SEPARATOR=;\nPWDS_INPUT_MODE=cli\n'
    );

    runSetup();

    expect(writeFileSync).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('already up to date')
    );
  });

  it('should throw on filesystem error', () => {
    vi.mocked(mkdirSync).mockImplementation(() => {
      throw new Error('permission denied');
    });

    expect(() => runSetup()).toThrow('permission denied');
    expect(console.error).toHaveBeenCalledWith(
      'Failed to setup config:',
      expect.any(Error)
    );
  });
});
