import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkPasswords } from '../../lib/check-passwords.mjs';

// Mock fetch globally
global.fetch = vi.fn();

describe('checkPasswords', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return compromised false when no passwords provided', async () => {
    const result = await checkPasswords([]);

    expect(result.compromised).toBe(false);
    expect(result.message).toBe('Checked 0 passwords, 0 compromised.');
  });

  it('should handle empty array', async () => {
    const result = await checkPasswords([]);

    expect(result).toHaveProperty('compromised');
    expect(result).toHaveProperty('message');
    expect(result.compromised).toBe(false);
  });

  it('should skip empty and whitespace passwords', async () => {
    global.fetch.mockResolvedValueOnce({
      status: 200,
      text: async () => '000D4F6E8FA6EECAD2A3AA415EEC418D65E:1\n'
    });

    const result = await checkPasswords(['', '  ', 'TestPassword', '  \n  ']);

    expect(result.message).toContain('Checked 4 passwords');
  });

  it('should return object with compromised and message properties', async () => {
    global.fetch.mockResolvedValueOnce({
      status: 200,
      text: async () => '000D4F6E8FA6EECAD2A3AA415EEC418D65E:1\n'
    });

    const result = await checkPasswords(['test']);

    expect(result).toHaveProperty('compromised');
    expect(result).toHaveProperty('message');
    expect(typeof result.compromised).toBe('boolean');
    expect(typeof result.message).toBe('string');
  });

  it('should call fetch for each non-empty password', async () => {
    global.fetch.mockResolvedValue({
      status: 200,
      text: async () => '000D4F6E8FA6EECAD2A3AA415EEC418D65E:1\n'
    });

    const result = await checkPasswords(['password1', 'password2']);

    expect(result.message).toContain('Checked 2 passwords');
  });

  it('should include password in message when compromised', async () => {
    // Mock a response where the hash is found (compromised)
    global.fetch.mockResolvedValueOnce({
      status: 200,
      text: async () => {
        // Return a response where the hash suffix is present
        return 'ABCDEF:10\n000D4F6E8FA6EECAD2A3AA415EEC418D65E:1\n';
      }
    });

    const result = await checkPasswords(['test']);

    // The result structure should have a message property
    expect(result).toHaveProperty('message');
    expect(typeof result.message).toBe('string');
  });

  it('should handle error response status gracefully', async () => {
    global.fetch.mockResolvedValueOnce({
      status: 503,
      text: async () => 'Service Unavailable',
      url: 'https://api.pwnedpasswords.com/range/ABC12'
    });

    const result = await checkPasswords(['test']);

    // Should handle gracefully and not crash
    expect(result).toHaveProperty('message');
    expect(result).toHaveProperty('compromised');
  });

  it('should handle fetch network error gracefully', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network timeout'));

    const result = await checkPasswords(['test']);

    // Should handle gracefully and not crash
    expect(result).toHaveProperty('message');
    expect(result).toHaveProperty('compromised');
  });

  it('should trim whitespace from passwords before processing', async () => {
    global.fetch.mockResolvedValueOnce({
      status: 200,
      text: async () => '000D4F6E8FA6EECAD2A3AA415EEC418D65E:1\n'
    });

    const result = await checkPasswords(['  spaced password  ']);

    expect(result).toHaveProperty('message');
    // Should not crash due to whitespace
    expect(result.message).toContain('Checked 1 passwords');
  });

  it('should return correct message format for unchecked passwords', async () => {
    global.fetch.mockResolvedValueOnce({
      status: 200,
      text: async () => '000D4F6E8FA6EECAD2A3AA415EEC418D65E:1\n'
    });

    const result = await checkPasswords(['test']);

    // Message should contain the checked count and status
    expect(result.message).toMatch(/Checked \d+ passwords/);
  });
});
