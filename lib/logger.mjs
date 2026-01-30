import { createLogger, transports, format } from 'winston';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';

const { combine, timestamp, label, printf } = format;

const customFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp}, [${label}] ${level}: ${message}`;
});

const logDir = join(homedir(), '.check-my-secrets');
mkdirSync(logDir, { recursive: true });

const logPath = join(logDir, 'check-my-secrets.log');

export const logger = createLogger({
  format: combine(label({ label: 'check-my-secrets' }), timestamp(), customFormat),
  transports: [
    new transports.File({
      filename: logPath
    }),
    new transports.Console({
      format: format.printf(({ message }) => message)
    })
  ]
});
