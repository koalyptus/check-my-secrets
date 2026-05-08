import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockEntry = vi.hoisted(() => ({
  storedPassword: null,
  getPassword: function () { return this.storedPassword; },
  setPassword: function (password) { this.storedPassword = password; }
}));

vi.mock('@napi-rs/keyring', () => ({
  Entry: vi.fn(() => mockEntry)
}));

const mockAskQuestion = vi.hoisted(() => vi.fn());
const mockLogger = vi.hoisted(() => ({ log: vi.fn() }));

vi.mock('../../lib/input.mjs', () => ({
  askQuestion: mockAskQuestion,
  hiddenInput: vi.fn(),
  maskPassword: vi.fn()
}));

vi.mock('../../lib/logger.mjs', () => ({
  logger: mockLogger
}));

import { listSecrets } from '../../bin/list-secrets.js';

describe('list-secrets.js', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.PWDS_KEY;
    delete process.env.PWDS_SEPARATOR;
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'table').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('should list passwords when user confirms', async () => {
    process.env.PWDS_KEY = 'test-key';
    process.env.PWDS_SEPARATOR = ',';

    mockEntry.storedPassword = 'pwd1,pwd2,pwd3';
    mockAskQuestion.mockResolvedValueOnce('y');

    await listSecrets();

    expect(mockAskQuestion).toHaveBeenCalledWith(
      expect.stringContaining('Are you sure')
    );
    expect(console.table).toHaveBeenCalledWith(
      expect.arrayContaining(['pwd1', 'pwd2', 'pwd3'])
    );
  });

  it('should warn and return when passwords is null', async () => {
    process.env.PWDS_KEY = 'test-key';
    process.env.PWDS_SEPARATOR = ',';

    mockEntry.storedPassword = null;

    await listSecrets();

    expect(mockLogger.log).toHaveBeenCalledWith({
      level: 'warn',
      message: expect.stringContaining('Provided key is not defined')
    });
  });

  it('should warn and return when passwords are empty', async () => {
    process.env.PWDS_KEY = 'test-key';
    process.env.PWDS_SEPARATOR = ',';

    mockEntry.storedPassword = '';

    await listSecrets();

    expect(mockLogger.log).toHaveBeenCalledWith({
      level: 'warn',
      message: expect.stringContaining('There are no passwords')
    });
  });

  it('should cancel when user declines confirmation', async () => {
    process.env.PWDS_KEY = 'test-key';
    process.env.PWDS_SEPARATOR = ',';

    mockEntry.storedPassword = 'pwd1';
    mockAskQuestion.mockResolvedValueOnce('n');

    await listSecrets();

    expect(mockLogger.log).toHaveBeenCalledWith({
      level: 'info',
      message: expect.stringContaining('cancelled')
    });
  });
});
