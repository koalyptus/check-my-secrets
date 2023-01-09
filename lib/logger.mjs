import { createLogger, transports, format } from 'winston';

const { combine, timestamp, label, printf } = format;

const customFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp}, [${label}] ${level}: ${message}`;
});

export const logger = createLogger({
  format: combine(label({ label: 'check-my-secrets' }), timestamp(), customFormat),
  transports: [
    new transports.File({
      filename: 'check-my-secrets.log'
    })
  ]
});
