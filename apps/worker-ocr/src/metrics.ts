import client from 'prom-client';
import express from 'express';
import { logger } from '@resume-hub/logger';

client.collectDefaultMetrics();

export const jobsProcessedTotal = new client.Counter({
  name: 'job_processed_total',
  help: 'Total number of OCR jobs processed successfully',
});

export const jobErrorsTotal = new client.Counter({
  name: 'job_errors_total',
  help: 'Total number of OCR jobs that failed',
});

export const jobProcessingTime = new client.Histogram({
  name: 'job_processing_time_seconds',
  help: 'Time taken to process an OCR job in seconds',
  buckets: [0.1, 0.5, 1, 2, 5, 10, 20, 30],
});

export const startMetricsServer = (port: number = 3001) => {
  const app = express();

  app.get('/metrics', async (req, res) => {
    try {
      res.set('Content-Type', client.register.contentType);
      res.end(await client.register.metrics());
    } catch (ex) {
      res.status(500).end(ex);
    }
  });

  app.listen(port, () => {
    logger.info(`OCR Worker Metrics server listening on port ${port}`);
  });
};
