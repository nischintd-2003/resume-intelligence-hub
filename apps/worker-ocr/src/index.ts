import { createWorker, QUEUES, ExtractTextJob, nlpQueue } from '@resume-hub/queue-lib';
import { initDatabase } from '@resume-hub/database';
import { logger } from '@resume-hub/logger';
import { downloadResumeBuffer } from './utils/storage';
import { detectFileType } from './utils/inspector';
import { extractTextFromBuffer } from './utils/extractor';
import {
  startMetricsServer,
  jobsProcessedTotal,
  jobErrorsTotal,
  jobProcessingTime,
} from './metrics';

startMetricsServer(3001);

const startOcrWorker = async () => {
  const endTimer = jobProcessingTime.startTimer();
  try {
    await initDatabase();

    createWorker<ExtractTextJob>(QUEUES.OCR, async (job) => {
      const jobId = job.id!;
      logger.info(`[Job ${jobId}] Caught OCR Job for Resume: ${job.data.resumeId}`);

      // Download
      const fileBuffer = await downloadResumeBuffer(job.data.minioPath);

      // Inspect
      const fileType = await detectFileType(fileBuffer);
      logger.info(`[Job ${jobId}] File Type Detected: ${fileType}`);

      if (fileType === 'unsupported') {
        throw new Error('Unsupported file format. Cannot parse text.');
      }

      // Extract Text
      const extractedText = await extractTextFromBuffer(fileBuffer, fileType, jobId);

      const cleanText = extractedText.replace(/\s+/g, ' ').trim();
      logger.info(`[Job ${jobId}] Extraction Complete. Total length: ${cleanText.length} chars.`);

      // Push to NLP Queue
      await nlpQueue.add('structure-data', {
        resumeId: job.data.resumeId,
        userId: job.data.userId,
        rawText: cleanText,
      });

      jobsProcessedTotal.inc();

      endTimer();

      logger.info(`[Job ${jobId}] Pushed raw text to NLP Queue`);
    });

    logger.info('OCR/Extraction Worker started and listening to "ocr-queue"');
  } catch (error) {
    logger.error('Failed to start OCR worker:', error);
    jobErrorsTotal.inc();
    endTimer();
    process.exit(1);
  }
};

startOcrWorker();
