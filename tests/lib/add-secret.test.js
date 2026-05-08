import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockEntry = vi.hoisted(() => ({
  storedPassword: null,
  getPassword: function () { return this.storedPassword; },
  setPassword: function (password) { this.storedPassword = password; },
  deletePassword: function () { this.storedPassword = null; return true; }
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

import { confirmAndSave } from '../../bin/add-secret.js';
import { maskPassword } from '../../lib/input.mjs';

describe('add-secret.js', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.PWDS_KEY;
    delete process.env.PWDS_SEPARATOR;
    delete process.env.PWDS_INPUT_MODE;
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('should add a password when none exist', async () => {
    process.env.PWDS_KEY = 'test-key';
    process.env.PWDS_SEPARATOR = ',';
    process.env.PWDS_INPUT_MODE = 'prompt';

    mockEntry.storedPassword = null;
    vi.mocked(maskPassword).mockReturnValue('****');
    mockAskQuestion.mockResolvedValueOnce('');  // reveal
    mockAskQuestion.mockResolvedValueOnce('y'); // confirm

    await confirmAndSave('test', 'prompt');

    expect(mockEntry.storedPassword).toBe('test');
    expect(mockLogger.log).toHaveBeenCalledWith({
      level: 'info',
      message: 'Password successfully added.'
    });
  });

  it('should add a password to existing list', async () => {
    process.env.PWDS_KEY = 'test-key';
    process.env.PWDS_SEPARATOR = ',';
    process.env.PWDS_INPUT_MODE = 'prompt';

    mockEntry.storedPassword = 'existing';
    vi.mocked(maskPassword).mockReturnValue('****');
    mockAskQuestion.mockResolvedValueOnce('');
    mockAskQuestion.mockResolvedValueOnce('y');

    await confirmAndSave('new', 'prompt');

    expect(mockEntry.storedPassword).toContain('existing');
    expect(mockEntry.storedPassword).toContain('new');
  });

  it('should reject duplicate password', async () => {
    process.env.PWDS_KEY = 'test-key';
    process.env.PWDS_SEPARATOR = ',';
    process.env.PWDS_INPUT_MODE = 'prompt';

    mockEntry.storedPassword = 'dup,other';
    vi.mocked(maskPassword).mockReturnValue('dup');
    mockAskQuestion.mockResolvedValueOnce('');
    mockAskQuestion.mockResolvedValueOnce('y');

    await confirmAndSave('dup', 'prompt');

    expect(mockLogger.log).toHaveBeenCalledWith({
      level: 'warn',
      message: 'Password already exists.'
    });
    expect(mockEntry.storedPassword).toBe('dup,other');
  });

  it('should cancel on user rejecting confirmation', async () => {
    process.env.PWDS_KEY = 'test-key';
    process.env.PWDS_SEPARATOR = ',';
    process.env.PWDS_INPUT_MODE = 'prompt';

    mockEntry.storedPassword = null;
    vi.mocked(maskPassword).mockReturnValue('****');
    mockAskQuestion.mockResolvedValueOnce('');
    mockAskQuestion.mockResolvedValueOnce('n');

    await confirmAndSave('test', 'prompt');

    expect(mockLogger.log).toHaveBeenCalledWith({
      level: 'info',
      message: 'Password not saved.'
    });
  });
});
