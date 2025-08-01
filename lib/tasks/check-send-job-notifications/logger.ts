import pino from 'pino';

export const logger = pino({
  name: 'check-send-job-notifications',
  level: 'info',
  serializers: {
    err: pino.stdSerializers.err
  }
});
