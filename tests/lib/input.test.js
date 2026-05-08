import { describe, it, expect, vi, beforeEach } from 'vitest';
import readline from 'readline';

vi.mock('readline', () => ({
  default: { createInterface: vi.fn() },
  createInterface: vi.fn()
}));

import { askQuestion, hiddenInput, maskPassword } from '../../lib/input.mjs';

describe('input', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('askQuestion', () => {
    it('should create readline interface and resolve with the answer', async () => {
      const mockRl = {
        question: vi.fn((_query, cb) => cb('user answer')),
        close: vi.fn()
      };
      vi.mocked(readline.createInterface).mockReturnValue(mockRl);

      const result = await askQuestion('Enter value: ');

      expect(readline.createInterface).toHaveBeenCalledWith({
        input: process.stdin,
        output: process.stdout
      });
      expect(mockRl.question).toHaveBeenCalledWith('Enter value: ', expect.any(Function));
      expect(mockRl.close).toHaveBeenCalled();
      expect(result).toBe('user answer');
    });
  });

  describe('hiddenInput', () => {
    it('should create readline interface and resolve with the entered password', async () => {
      const mockOutput = { write: vi.fn() };
      const mockRl = {
        question: vi.fn((_prompt, cb) => cb('myPassword')),
        close: vi.fn(),
        stdoutMuted: false,
        output: mockOutput,
        _writeToOutput: null
      };
      vi.mocked(readline.createInterface).mockReturnValue(mockRl);

      const result = await hiddenInput('Enter password: ');

      expect(readline.createInterface).toHaveBeenCalledWith({
        input: process.stdin,
        output: process.stdout
      });
      expect(mockRl.stdoutMuted).toBe(true);
      expect(typeof mockRl._writeToOutput).toBe('function');
      expect(result).toBe('myPassword');
    });

    it('should mask output characters with asterisks when stdoutMuted', () => {
      const mockOutput = { write: vi.fn() };
      const mockRl = {
        question: vi.fn(),
        close: vi.fn(),
        stdoutMuted: false,
        output: mockOutput,
        _writeToOutput: null
      };
      vi.mocked(readline.createInterface).mockReturnValue(mockRl);

      // Call hiddenInput but capture the _writeToOutput before it resolves
      const promise = hiddenInput('prompt');

      // After constructor, _writeToOutput should be set
      expect(typeof mockRl._writeToOutput).toBe('function');

      // Test writing while muted
      mockRl.stdoutMuted = true;
      mockRl._writeToOutput('hello');
      expect(mockOutput.write).toHaveBeenCalledWith('*****');

      // Test writing while not muted
      mockOutput.write.mockClear();
      mockRl.stdoutMuted = false;
      mockRl._writeToOutput('visible');
      expect(mockOutput.write).toHaveBeenCalledWith('visible');
    });
  });

  describe('maskPassword', () => {
    it('should mask short passwords entirely', () => {
      expect(maskPassword('abc')).toBe('***');
      expect(maskPassword('ab')).toBe('**');
      expect(maskPassword('a')).toBe('*');
      expect(maskPassword('')).toBe('');
    });

    it('should show first 2 and last 2 characters for longer passwords', () => {
      expect(maskPassword('password')).toBe('pa****rd');
      expect(maskPassword('secret123')).toBe('se*****23');
      expect(maskPassword('abcd')).toBe('****');
      expect(maskPassword('abcde')).toBe('ab*de');
    });

    it('should handle very long passwords', () => {
      const longPassword = 'myVeryLongSecurePassword123';
      expect(longPassword.length).toBeGreaterThan(10);
      const masked = maskPassword(longPassword);
      expect(masked.startsWith('my')).toBe(true);
      expect(masked.endsWith('23')).toBe(true);
      expect(masked.includes('****')).toBe(true);
    });
  });
});
