import { createLogger, transports, format } from 'winston';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { CONFIG_DIR, SERVICE } from './constants.mjs';

const { combine, timestamp, label, printf } = format;

const customFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp}, [${label}] ${level}: ${message}`;
});

const logDir = join(homedir(), CONFIG_DIR);
mkdirSync(logDir, { recursive: true });

const logPath = join(logDir, `${SERVICE}.log`);

export const logger = createLogger({
  format: combine(label({ label: SERVICE }), timestamp(), customFormat),
  transports: [
    new transports.File({
      filename: logPath
    }),
    new transports.Console({
      format: format.printf(({ message }) => message)
    })
  ]
});
