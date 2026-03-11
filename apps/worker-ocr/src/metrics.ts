import { Registry, Counter, Histogram, collectDefaultMetrics } from 'prom-client';

export const register = new Registry();

collectDefaultMetrics({ register });

export const jobsProcessedTotal = new Counter({
  name: 'ocr_jobs_processed_total',
  help: 'Total number of OCR jobs successfully processed',
  labelNames: ['file_type'],
  registers: [register],
});

export const jobErrorsTotal = new Counter({
  name: 'ocr_job_errors_total',
  help: 'Total number of OCR jobs that failed',
  labelNames: ['reason'],
  registers: [register],
});

export const jobProcessingTime = new Histogram({
  name: 'ocr_job_processing_time_seconds',
  help: 'Time taken to process each OCR job, in seconds',
  labelNames: ['file_type'],
  buckets: [0.5, 1, 2, 5, 10, 20, 30, 60],
  registers: [register],
});
