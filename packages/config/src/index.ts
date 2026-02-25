import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  database: {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    user: process.env.POSTGRES_USER || 'admin',
    password: process.env.POSTGRES_PASSWORD || 'local_password',
    database: process.env.POSTGRES_DB || 'resume_hub',
    poolMax: parseInt(process.env.DB_POOL_MAX || '20', 10),
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  tus: {
    endpoint: process.env.TUS_ENDPOINT || 'http://localhost:1080/files/',
  },
  queue: {
    concurrency: parseInt(process.env.QUEUE_CONCURRENCY || '5', 10),
    attempts: parseInt(process.env.QUEUE_ATTEMPTS || '3', 10),
    backoffDelay: parseInt(process.env.QUEUE_BACKOFF_DELAY || '5000', 10),
  },
};

export default config;
