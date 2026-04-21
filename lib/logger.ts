import pino from 'pino';

const isProd = process.env.NODE_ENV === 'production';

// Only use pretty transport if running in Node.js (not Bun, not serverless)
const logger = pino({
  level: isProd ? 'info' : 'debug',
});

export default logger;