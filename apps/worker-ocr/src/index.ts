import { createWorker, QUEUES, ExtractTextJob } from '@resume-hub/queue-lib';
import { initDatabase } from '@resume-hub/database';
import { logger } from '@resume-hub/logger';

const startOcrWorker = async () => {
  try {
    await initDatabase();

    createWorker<ExtractTextJob>(QUEUES.OCR, async (job) => {
      logger.info(`[Job ${job.id}] Caught OCR Job for Resume: ${job.data.resumeId}`);
      logger.info(`[Job ${job.id}] Target MinIO Path: ${job.data.minioPath}`);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      logger.info(`[Job ${job.id}] Successfully processed dummy job`);
    });

    logger.info('OCR Worker started and listening to "ocr-queue"');
  } catch (error) {
    logger.error('Failed to start OCR worker:', error);
    process.exit(1);
  }
};

startOcrWorker();
