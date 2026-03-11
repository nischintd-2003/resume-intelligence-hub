import express from 'express';
import { register } from './metrics';
import { logger } from '@resume-hub/logger';

const METRICS_PORT = parseInt(process.env.METRICS_PORT ?? '9100', 10);

export const startMetricsServer = () => {
  const app = express();
  app.get('/metrics', async (_req, res) => {
    try {
      res.set('Content-Type', register.contentType);
      res.end(await register.metrics());
    } catch (err) {
      res.status(500).end(err);
    }
  });

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.listen(METRICS_PORT, () => {
    logger.info(`[Metrics] Server listening on port ${METRICS_PORT}`);
  });
};
