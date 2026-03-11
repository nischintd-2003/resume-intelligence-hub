import { Registry, Counter, Gauge, collectDefaultMetrics } from 'prom-client';

export const register = new Registry();
collectDefaultMetrics({ register });

export const totalJobsSubmitted = new Counter({
  name: 'stats_total_jobs_submitted',
  help: 'Total number of OCR jobs ever submitted',
  registers: [register],
});

export const totalJobsCompleted = new Counter({
  name: 'stats_total_jobs_completed',
  help: 'Total number of OCR jobs completed successfully',
  registers: [register],
});

export const queueLength = new Gauge({
  name: 'stats_ocr_queue_length',
  help: 'Current number of jobs waiting in the OCR queue',
  registers: [register],
});

export const activeJobs = new Gauge({
  name: 'stats_ocr_active_jobs',
  help: 'Current number of OCR jobs being actively processed',
  registers: [register],
});
