import { Queue, Worker, WorkerOptions, Processor } from 'bullmq';
import IORedis from 'ioredis';
import { config } from '@resume-hub/config';
import { logger } from '@resume-hub/logger';
import { CalculateMatchJob, ExtractTextJob, GenerateInsightsJob, StructureDataJob } from './types';
import { QUEUES } from './constants';

export const redisConnection = new IORedis({
  host: config.redis.host,
  port: config.redis.port,
  maxRetriesPerRequest: null,
});

export const ocrQueue = new Queue<ExtractTextJob>(QUEUES.OCR, { connection: redisConnection });
export const nlpQueue = new Queue<StructureDataJob>(QUEUES.NLP, { connection: redisConnection });
export const matchQueue = new Queue<CalculateMatchJob>(QUEUES.MATCH, {
  connection: redisConnection,
});
export const insightsQueue = new Queue<GenerateInsightsJob>(QUEUES.INSIGHTS, {
  connection: redisConnection,
});

export const createWorker = <T>(
  queueName: string,
  processor: Processor<T>,
  options?: Omit<WorkerOptions, 'connection'>,
) => {
  const worker = new Worker<T>(queueName, processor, {
    connection: redisConnection,
    concurrency: config.queue.concurrency,
    ...options,
  });

  worker.on('failed', (job, err) => {
    logger.error(`[Queue: ${queueName}] Job ${job?.id} failed: ${err.message}`);
  });

  worker.on('error', (err) => {
    logger.error(`[Queue: ${queueName}] Worker error: ${err.message}`);
  });

  return worker;
};
