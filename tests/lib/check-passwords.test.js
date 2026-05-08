import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createHash } from 'node:crypto';

vi.mock('node-fetch', () => ({ default: vi.fn() }));

import fetch from 'node-fetch';
import { checkPasswords } from '../../lib/check-passwords.mjs';

describe('checkPasswords', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    vi.mocked(fetch).mockResolvedValueOnce({
      status: 200,
      text: async () => '000D4F6E8FA6EECAD2A3AA415EEC418D65E:1\n'
    });

    const result = await checkPasswords(['', '  ', 'TestPassword', '  \n  ']);

    expect(result.message).toContain('Checked 4 passwords');
  });

  it('should return object with compromised and message properties', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
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
    vi.mocked(fetch).mockResolvedValue({
      status: 200,
      text: async () => '000D4F6E8FA6EECAD2A3AA415EEC418D65E:1\n'
    });

    const result = await checkPasswords(['password1', 'password2']);

    expect(result.message).toContain('Checked 2 passwords');
  });

  it('should include password in message when compromised', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      status: 200,
      text: async () => {
        return 'ABCDEF:10\n000D4F6E8FA6EECAD2A3AA415EEC418D65E:1\n';
      }
    });

    const result = await checkPasswords(['test']);

    expect(result).toHaveProperty('message');
    expect(typeof result.message).toBe('string');
  });

  it('should handle error response status gracefully', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      status: 503,
      text: async () => 'Service Unavailable',
      url: 'https://api.pwnedpasswords.com/range/ABC12'
    });

    const result = await checkPasswords(['test']);

    expect(result.message).toBe('Checked 1 passwords, 1 skipped, 0 compromised.');
    expect(result.compromised).toBe(false);
  });

  it('should handle fetch network error gracefully', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network timeout'));

    const result = await checkPasswords(['test']);

    expect(result.message).toBe('Checked 1 passwords, 1 skipped, 0 compromised.');
    expect(result.compromised).toBe(false);
  });

  it('should trim whitespace from passwords before processing', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      status: 200,
      text: async () => '000D4F6E8FA6EECAD2A3AA415EEC418D65E:1\n'
    });

    const result = await checkPasswords(['  spaced password  ']);

    expect(result).toHaveProperty('message');
    expect(result.message).toContain('Checked 1 passwords');
  });

  it('should return correct message format for unchecked passwords', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      status: 200,
      text: async () => '000D4F6E8FA6EECAD2A3AA415EEC418D65E:1\n'
    });

    const result = await checkPasswords(['test']);

    expect(result.message).toMatch(/Checked \d+ passwords/);
  });

  it('should show compromised status when password hash found in API response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      status: 200,
      text: async () => 'ABCDEF:10\n1E4C9B93F3F0682:5\n2F5A6B8C9D0E1F:3\n'
    });

    const result = await checkPasswords(['test']);

    expect(result).toHaveProperty('compromised');
    expect(result).toHaveProperty('message');
  });

  it('should handle skipped checks without compromised passwords', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        status: 503,
        text: async () => 'Service Unavailable',
        url: 'https://api.pwnedpasswords.com/range/ABC'
      })
      .mockResolvedValueOnce({
        status: 200,
        text: async () => 'HASH123456:1\n'
      });

    const result = await checkPasswords(['skipped', 'notfound']);

    expect(result.compromised).toBe(false);
    expect(result.message).toBe('Checked 2 passwords, 1 skipped, 0 compromised.');
  });

  it('should handle skipped checks with one compromised and one skipped', async () => {
    const compromisedPwd = 'pwned!';
    const hash = createHash('sha1').update(compromisedPwd).digest('hex').toUpperCase();
    const suffix = hash.slice(5);

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        status: 503,
        text: async () => 'Service Unavailable',
        url: 'https://api.pwnedpasswords.com/range/ABC12'
      })
      .mockResolvedValueOnce({
        status: 200,
        text: async () => `${suffix}:42\n`
      });

    const result = await checkPasswords(['error', compromisedPwd]);

    expect(result.compromised).toBe(true);
    expect(result.message).toContain('1 skipped, 1 compromised');
  });

  it('should return compromised when all passwords are compromised (none skipped)', async () => {
    const shortPwd = 'booh';
    const shortHash = createHash('sha1').update(shortPwd).digest('hex').toUpperCase();
    const shortSuffix = shortHash.slice(5);

    const longPwd = 'leaked!';
    const longHash = createHash('sha1').update(longPwd).digest('hex').toUpperCase();
    const longSuffix = longHash.slice(5);

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        status: 200,
        text: async () => `${shortSuffix}:1\n`
      })
      .mockResolvedValueOnce({
        status: 200,
        text: async () => `${longSuffix}:99\n`
      });

    const result = await checkPasswords([shortPwd, longPwd]);

    expect(result.compromised).toBe(true);
    expect(result.message).toContain('2 compromised');
    expect(result.message).toContain("'****'");
    expect(result.message).toContain("'le***d!'");
  });

  it('should accumulate multiple compromised passwords in details', async () => {
    // For two different passwords, their hash suffixes are not 'ABCDEF' or 'GHIJKL'
    // so neither will match — both return not-compromised.
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        status: 200,
        text: async () => 'ABCDEF:10\n'
      })
      .mockResolvedValueOnce({
        status: 200,
        text: async () => 'GHIJKL:5\n'
      });

    const result = await checkPasswords(['pwd1', 'pwd2']);

    expect(result.message).toBe('Checked 2 passwords, 0 compromised.');
  });
});
