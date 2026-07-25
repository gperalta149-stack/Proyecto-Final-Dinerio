import pino from 'pino';

const level = process.env.LOG_LEVEL || (process.env.DEBUG === 'true' ? 'debug' : 'info');

const transport = process.env.NODE_ENV !== 'production' ? {
  target: 'pino-pretty',
  options: { colorize: true }
} : undefined;

const logger = pino({ level, transport });

export default logger;
