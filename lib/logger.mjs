import { createLogger, transports, format } from 'winston';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { CONFIG_DIR, SERVICE } from './constants.mjs';

const { combine, timestamp, label, printf } = format;

const customFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp}, [${label}] ${level}: ${message}`;
});

const isTest = process.env.NODE_ENV === 'test';

const logDir = join(homedir(), CONFIG_DIR);
if (!isTest) {
  mkdirSync(logDir, { recursive: true });
}

const logPath = join(logDir, `${SERVICE}.log`);

const loggerTransports = [
  new transports.Console({
    format: format.printf(({ message }) => message)
  })
];

if (!isTest) {
  loggerTransports.push(
    new transports.File({
      filename: logPath
    })
  );
}

export const logger = createLogger({
  format: combine(label({ label: SERVICE }), timestamp(), customFormat),
  transports: loggerTransports
});
