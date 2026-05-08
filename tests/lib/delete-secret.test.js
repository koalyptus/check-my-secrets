import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockEntry = vi.hoisted(() => ({
  storedPassword: null,
  getPassword: function () { return this.storedPassword; },
  setPassword: function (password) {
    if (password === '') {
      throw new Error('Attribute secret is invalid: cannot be empty');
    }
    this.storedPassword = password;
  },
  deletePassword: function () {
    this.storedPassword = null;
    return true;
  }
}));

vi.mock('@napi-rs/keyring', () => ({
  Entry: vi.fn(() => mockEntry)
}));

const mockAskQuestion = vi.hoisted(() => vi.fn());
const mockHiddenInput = vi.hoisted(() => vi.fn());
const mockLogger = vi.hoisted(() => ({ log: vi.fn() }));

vi.mock('../../lib/input.mjs', () => ({
  askQuestion: mockAskQuestion,
  hiddenInput: mockHiddenInput,
  maskPassword: vi.fn()
}));

vi.mock('../../lib/logger.mjs', () => ({
  logger: mockLogger
}));

import { confirmAndDelete } from '../../bin/delete-secret.js';
import { maskPassword } from '../../lib/input.mjs';

describe('delete-secret.js', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.PWDS_KEY;
    delete process.env.PWDS_SEPARATOR;
    delete process.env.PWDS_INPUT_MODE;
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should delete the entry when removing the last password (<=4 chars)', async () => {
    process.env.PWDS_KEY = 'test-key';
    process.env.PWDS_SEPARATOR = ',';
    process.env.PWDS_INPUT_MODE = 'prompt';

    mockEntry.storedPassword = 'test';
    vi.mocked(maskPassword).mockReturnValue('****');
    mockAskQuestion.mockResolvedValueOnce('');
    mockAskQuestion.mockResolvedValueOnce('y');

    await confirmAndDelete('test', 'prompt');

    expect(mockEntry.storedPassword).toBeNull();
    expect(mockLogger.log).toHaveBeenCalledWith({
      level: 'info',
      message: 'Password successfully deleted.'
    });
  });

  it('should succeed when deleting one of multiple passwords', async () => {
    process.env.PWDS_KEY = 'test-key';
    process.env.PWDS_SEPARATOR = ',';
    process.env.PWDS_INPUT_MODE = 'prompt';

    mockEntry.storedPassword = 'test,test2';
    vi.mocked(maskPassword).mockReturnValue('t**t');
    mockAskQuestion.mockResolvedValueOnce('');
    mockAskQuestion.mockResolvedValueOnce('y');

    await confirmAndDelete('test', 'prompt');

    expect(mockEntry.storedPassword).toBe('test2');
  });

  it('should succeed when deleting a non-last password with <=4 chars', async () => {
    process.env.PWDS_KEY = 'test-key';
    process.env.PWDS_SEPARATOR = ',';
    process.env.PWDS_INPUT_MODE = 'prompt';

    mockEntry.storedPassword = 'test,longerPassword';
    vi.mocked(maskPassword).mockReturnValue('****');
    mockAskQuestion.mockResolvedValueOnce('');
    mockAskQuestion.mockResolvedValueOnce('y');

    await confirmAndDelete('test', 'prompt');

    expect(mockEntry.storedPassword).toBe('longerPassword');
  });
});
