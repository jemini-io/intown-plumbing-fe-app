import pino from 'pino';

export const logger = pino({
  name: 'check-send-job-notifications',
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      singleLine: true,
    },
  },
});