import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockEntry = vi.hoisted(() => ({
  storedPassword: null,
  getPassword: function () { return this.storedPassword; },
  setPassword: function (password) { this.storedPassword = password; },
  deletePassword: function () { this.storedPassword = null; return true; }
}));

vi.mock('@napi-rs/keyring', () => ({
  Entry: vi.fn(function () {
    return mockEntry;
  })
}));

vi.mock('node-notifier', () => ({
  default: { notify: vi.fn() }
}));

const mockLogger = vi.hoisted(() => ({ log: vi.fn() }));

vi.mock('../../lib/logger.mjs', () => ({
  logger: mockLogger
}));

vi.mock('../../lib/check-passwords.mjs', () => ({
  checkPasswords: vi.fn()
}));

import { checkSecrets } from '../../bin/check-my-secrets.js';
import { checkPasswords } from '../../lib/check-passwords.mjs';
import notifier from 'node-notifier';

describe('check-my-secrets.js', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.PWDS_KEY;
    delete process.env.PWDS_SEPARATOR;
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should report compromised passwords', async () => {
    process.env.PWDS_KEY = 'test-key';
    process.env.PWDS_SEPARATOR = ',';

    mockEntry.storedPassword = 'pwned1,pwned2';
    vi.mocked(checkPasswords).mockResolvedValueOnce({
      compromised: true,
      message: 'Checked 2 passwords, 2 compromised:\n\'pw***d1\'\n\'pw***d2\'\n'
    });

    await checkSecrets();

    expect(mockLogger.log).toHaveBeenCalledWith({
      level: 'warn',
      message: expect.stringContaining('2 compromised')
    });
    expect(notifier.notify).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Scan result' })
    );
  });

  it('should report no compromised passwords', async () => {
    process.env.PWDS_KEY = 'test-key';
    process.env.PWDS_SEPARATOR = ',';

    mockEntry.storedPassword = 'safe1,safe2';
    vi.mocked(checkPasswords).mockResolvedValueOnce({
      compromised: false,
      message: 'Checked 2 passwords, 0 compromised.'
    });

    await checkSecrets();

    expect(mockLogger.log).toHaveBeenCalledWith({
      level: 'info',
      message: expect.stringContaining('0 compromised')
    });
  });

  it('should handle null passwords (key not defined)', async () => {
    process.env.PWDS_KEY = 'missing-key';
    process.env.PWDS_SEPARATOR = ',';

    mockEntry.storedPassword = null;

    await checkSecrets();

    expect(mockLogger.log).toHaveBeenCalledWith({
      level: 'warn',
      message: expect.stringContaining('Provided key is not defined')
    });
  });

  it('should handle empty string passwords', async () => {
    process.env.PWDS_KEY = 'test-key';
    process.env.PWDS_SEPARATOR = ',';

    mockEntry.storedPassword = '';

    await checkSecrets();

    expect(mockLogger.log).toHaveBeenCalledWith({
      level: 'warn',
      message: expect.stringContaining('Could not find any value')
    });
  });

  it('should handle bad decrypt error', async () => {
    process.env.PWDS_KEY = 'test-key';
    process.env.PWDS_SEPARATOR = ',';

    const origGetPassword = mockEntry.getPassword;
    mockEntry.getPassword = function () {
      const err = new Error('bad decrypt');
      err.code = 'ERR_OSSL_BAD_DECRYPT';
      throw err;
    };

    await checkSecrets();

    expect(mockLogger.log).toHaveBeenCalledWith({
      level: 'warn',
      message: expect.stringContaining('Unable to decrypt')
    });

    mockEntry.getPassword = origGetPassword;
  });

  it('should handle generic getPassword error', async () => {
    process.env.PWDS_KEY = 'test-key';
    process.env.PWDS_SEPARATOR = ',';

    const origGetPassword = mockEntry.getPassword;
    mockEntry.getPassword = function () {
      throw new Error('keyring unavailable');
    };

    await checkSecrets();

    expect(mockLogger.log).toHaveBeenCalledWith({
      level: 'error',
      message: expect.any(Error)
    });

    mockEntry.getPassword = origGetPassword;
  });

  it('should handle non-string password value', async () => {
    process.env.PWDS_KEY = 'test-key';
    process.env.PWDS_SEPARATOR = ',';

    const origGetPassword = mockEntry.getPassword;
    mockEntry.getPassword = function () { return 12345; };

    await checkSecrets();

    expect(mockLogger.log).toHaveBeenCalledWith({
      level: 'warn',
      message: expect.stringContaining('should only contain a string')
    });

    mockEntry.getPassword = origGetPassword;
  });
});
