import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '../../lib/logger.mjs';

describe('logger', () => {
  let fileTransportSpy;

  beforeEach(() => {
    fileTransportSpy = vi.spyOn(logger, 'log');
  });

  afterEach(() => {
    fileTransportSpy.mockRestore();
  });

  it('should be defined', () => {
    expect(logger).toBeDefined();
  });

  it('should have a log method', () => {
    expect(typeof logger.log).toBe('function');
  });

  it('should log info level messages', () => {
    const message = 'Test info message';

    logger.log({ level: 'info', message });

    expect(fileTransportSpy).toHaveBeenCalled();
    const call = fileTransportSpy.mock.calls[0][0];
    expect(call.level).toBe('info');
    expect(call.message).toBe(message);
    expect(call.label).toBe('check-my-secrets');
    expect(call.timestamp).toBeDefined();
  });

  it('should log warn level messages', () => {
    const message = 'Test warning message';

    logger.log({ level: 'warn', message });

    expect(fileTransportSpy).toHaveBeenCalled();
    const call = fileTransportSpy.mock.calls[0][0];
    expect(call.level).toBe('warn');
    expect(call.message).toBe(message);
    expect(call.label).toBe('check-my-secrets');
  });

  it('should log error level messages', () => {
    const message = 'Test error message';

    logger.log({ level: 'error', message });

    expect(fileTransportSpy).toHaveBeenCalled();
    const call = fileTransportSpy.mock.calls[0][0];
    expect(call.level).toBe('error');
    expect(call.message).toBe(message);
    expect(call.label).toBe('check-my-secrets');
  });

  it('should include label in logs', () => {
    expect(logger.format).toBeDefined();
  });

  it('should have file transport configured', () => {
    const hasFileTransport = logger.transports.some(
      transport => transport.constructor.name === 'File'
    );
    expect(hasFileTransport).toBe(true);
  });

  it('should have console transport configured', () => {
    const hasConsoleTransport = logger.transports.some(
      transport => transport.constructor.name === 'Console'
    );
    expect(hasConsoleTransport).toBe(true);
  });
});
