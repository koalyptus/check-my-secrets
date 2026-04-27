import { describe, it, expect, vi, beforeEach } from 'vitest';
import { maskPassword } from '../../lib/input.mjs';

describe('input', () => {
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
