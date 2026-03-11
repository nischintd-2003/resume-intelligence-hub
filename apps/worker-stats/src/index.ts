import express from 'express';
import { Queue } from 'bullmq';
import { redisConnection, QUEUES } from '@resume-hub/queue-lib';
import { initDatabase, ParsedResume } from '@resume-hub/database';
import { logger } from '@resume-hub/logger';
import { register, queueLength, activeJobs } from './metrics';

const PORT = parseInt(process.env.STATS_PORT ?? '3002', 10);
const POLL_INTERVAL_MS = 10_000;

const ocrQueue = new Queue(QUEUES.OCR, { connection: redisConnection });

const pollQueueStats = async () => {
  try {
    const counts = await ocrQueue.getJobCounts('waiting', 'active', 'completed', 'failed');
    queueLength.set(counts.waiting ?? 0);
    activeJobs.set(counts.active ?? 0);

    logger.debug(`[Stats] Queue poll — waiting: ${counts.waiting}, active: ${counts.active}`);
  } catch (err) {
    logger.error('[Stats] Failed to poll queue counts:', err);
  }
};

const getStats = async () => {
  const [queueCounts, totalResumes] = await Promise.all([
    ocrQueue.getJobCounts('waiting', 'active', 'completed', 'failed'),
    ParsedResume.count(),
  ]);

  const completedCount = await ParsedResume.count({ where: { status: 'parsed' } });
  const failedCount = await ParsedResume.count({ where: { status: 'failed' } });

  return {
    queue: {
      waiting: queueCounts.waiting ?? 0,
      active: queueCounts.active ?? 0,
      completed: queueCounts.completed ?? 0,
      failed: queueCounts.failed ?? 0,
    },
    database: {
      totalResumes,
      completedResumes: completedCount,
      failedResumes: failedCount,
    },
    timestamp: new Date().toISOString(),
  };
};

const start = async () => {
  await initDatabase();

  await pollQueueStats();
  setInterval(pollQueueStats, POLL_INTERVAL_MS);

  const app = express();

  app.get('/stats', async (_req, res) => {
    try {
      const stats = await getStats();
      res.json({ status: 'success', data: stats });
    } catch (err) {
      logger.error('[Stats] /stats error:', err);
      res.status(500).json({ status: 'error', message: 'Failed to retrieve stats' });
    }
  });

  app.get('/metrics', async (_req, res) => {
    try {
      res.set('Content-Type', register.contentType);
      res.end(await register.metrics());
    } catch (err) {
      res.status(500).end(err);
    }
  });

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.listen(PORT, () => {
    logger.info(`[worker-stats] Service listening on port ${PORT}`);
  });
};

start().catch((err) => {
  logger.error('Failed to start worker-stats:', err);
  process.exit(1);
});
