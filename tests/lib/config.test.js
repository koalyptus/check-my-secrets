import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { config } from '../../lib/config.mjs';

describe('config()', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset process.env to avoid contamination between tests
    process.env = { ...originalEnv };
    delete process.env.PWDS_KEY;
    delete process.env.PWDS_SEPARATOR;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return default values when env vars are not set', () => {
    const result = config();

    expect(result.passwordsKey).toBe('checkmysecrets.pwds');
    expect(result.passwordsSeparator).toBe(',');
  });

  it('should use PWDS_KEY from environment when set', () => {
    process.env.PWDS_KEY = 'custom-key';

    const result = config();

    expect(result.passwordsKey).toBe('custom-key');
    expect(result.passwordsSeparator).toBe(',');
  });

  it('should use PWDS_SEPARATOR from environment when set', () => {
    process.env.PWDS_SEPARATOR = '|';

    const result = config();

    expect(result.passwordsKey).toBe('checkmysecrets.pwds');
    expect(result.passwordsSeparator).toBe('|');
  });

  it('should use both custom env vars when both are set', () => {
    process.env.PWDS_KEY = 'my-key';
    process.env.PWDS_SEPARATOR = ';';

    const result = config();

    expect(result.passwordsKey).toBe('my-key');
    expect(result.passwordsSeparator).toBe(';');
  });
});
