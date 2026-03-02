import { createWorker, QUEUES, ExtractTextJob } from '@resume-hub/queue-lib';
import { initDatabase } from '@resume-hub/database';
import { logger } from '@resume-hub/logger';
import { downloadResumeBuffer } from './utils/storage';
import { detectFileType } from './utils/inspector';

const startOcrWorker = async () => {
  try {
    await initDatabase();

    createWorker<ExtractTextJob>(QUEUES.OCR, async (job) => {
      logger.info(`[Job ${job.id}] Caught OCR Job for Resume: ${job.data.resumeId}`);
      logger.info(`[Job ${job.id}] Target MinIO Path: ${job.data.minioPath}`);

      const fileBuffer = await downloadResumeBuffer(job.data.minioPath);

      logger.info(
        `[Job ${job.id}] Successfully downloaded file. Buffer Size: ${fileBuffer.length} bytes`,
      );

      const fileType = await detectFileType(fileBuffer);
      logger.info(`[Job ${job.id}] Cryptographic File Type Detected: ${fileType}`);

      if (fileType === 'unsupported') {
        throw new Error('Unsupported file format. Cannot parse text.');
      }
    });

    logger.info('OCR Worker started and listening to "ocr-queue"');
  } catch (error) {
    logger.error('Failed to start OCR worker:', error);
    process.exit(1);
  }
};

startOcrWorker();
