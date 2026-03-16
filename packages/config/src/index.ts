import * as dotenv from 'dotenv';
import * as path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database (Postgres)
  POSTGRES_HOST: z.string().default('localhost'),
  POSTGRES_PORT: z.coerce.number().default(5432),
  POSTGRES_USER: z.string().default('admin'),
  POSTGRES_PASSWORD: z.string().default('local_password'),
  POSTGRES_DB: z.string().default('resume_hub'),
  DB_POOL_MAX: z.coerce.number().default(20),

  // Redis
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),

  // TUS
  TUS_ENDPOINT: z.string().default('http://localhost:1080/files/'),

  // MinIO
  MINIO_ROOT_USER: z.string().default('admin'),
  MINIO_ROOT_PASSWORD: z.string().default('password'),
  MINIO_ENDPOINT: z.string().default('http://localhost:9000'),
  MINIO_BUCKET_NAME: z.string().default('resumes'),
  MINIO_PUBLIC_ENDPOINT: z.string().default('http://localhost:9000'),

  // Queue settings
  QUEUE_CONCURRENCY: z.coerce.number().default(5),
  QUEUE_ATTEMPTS: z.coerce.number().default(3),
  QUEUE_BACKOFF_DELAY: z.coerce.number().default(5000),

  // JWT
  JWT_SECRET: z.string().min(10, 'JWT_SECRET must be at least 10 characters long'),
  JWT_EXPIRES_IN: z.string().default('1d'),

  // PORT
  API_PORT: z.coerce.number().default(3000),
  METRICS_PORT: z.coerce.number().default(9100),
  STATS_PORT: z.coerce.number().default(3002),
});

const parsedEnv = EnvSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(' Invalid environment variables', z.flattenError(parsedEnv.error));
  process.exit(1);
}

const env = parsedEnv.data;

export const config = {
  env: env.NODE_ENV,
  database: {
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB,
    poolMax: env.DB_POOL_MAX,
  },
  redis: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  },
  tus: {
    endpoint: env.TUS_ENDPOINT,
  },
  minio: {
    accessKey: env.MINIO_ROOT_USER,
    secretKey: env.MINIO_ROOT_PASSWORD,
    endpoint: env.MINIO_ENDPOINT,
    bucket: env.MINIO_BUCKET_NAME,
    publicEndpoint: env.MINIO_PUBLIC_ENDPOINT,
  },
  queue: {
    concurrency: env.QUEUE_CONCURRENCY,
    attempts: env.QUEUE_ATTEMPTS,
    backoffDelay: env.QUEUE_BACKOFF_DELAY,
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  server: {
    apiPort: env.API_PORT,
    metricsPort: env.METRICS_PORT,
    statsPort: env.STATS_PORT,
  },
};

export default config;
