import { createWorker, QUEUES, ExtractTextJob, nlpQueue } from '@resume-hub/queue-lib';
import { initDatabase } from '@resume-hub/database';
import { logger } from '@resume-hub/logger';
import { downloadResumeBuffer } from './utils/storage';
import { detectFileType } from './utils/inspector';
import { extractTextFromBuffer } from './utils/extractor';
import { startMetricsServer } from './metricsServer';
import { jobsProcessedTotal, jobErrorsTotal, jobProcessingTime } from './metrics';

const startOcrWorker = async () => {
  try {
    await initDatabase();
    startMetricsServer();

    createWorker<ExtractTextJob>(QUEUES.OCR, async (job) => {
      const jobId = job.id!;
      logger.info(`[Job ${jobId}] Caught OCR Job for Resume: ${job.data.resumeId}`);

      const stopTimer = jobProcessingTime.startTimer();

      let fileType: string = 'unknown';

      try {
        // Download
        const fileBuffer = await downloadResumeBuffer(job.data.minioPath);

        // Inspect
        const detectedType = await detectFileType(fileBuffer);
        fileType = detectedType;
        logger.info(`[Job ${jobId}] File Type Detected: ${fileType}`);

        if (detectedType === 'unsupported') {
          throw new Error('Unsupported file format. Cannot parse text.');
        }

        // Extract Text
        const extractedText = await extractTextFromBuffer(fileBuffer, detectedType, jobId);

        const cleanText = extractedText.replace(/\s+/g, ' ').trim();
        logger.info(`[Job ${jobId}] Extraction Complete. Total length: ${cleanText.length} chars.`);

        // Push to NLP Queue
        await nlpQueue.add('structure-data', {
          resumeId: job.data.resumeId,
          userId: job.data.userId,
          rawText: cleanText,
        });

        logger.info(`[Job ${jobId}] Pushed raw text to NLP Queue`);

        jobsProcessedTotal.inc({ file_type: fileType });

        stopTimer({ file_type: fileType });
      } catch (err: any) {
        jobErrorsTotal.inc({ reason: err.message?.slice(0, 50) ?? 'unknown' });
        stopTimer({ file_type: fileType });
        throw err;
      }
    });

    logger.info('OCR/Extraction Worker started and listening to "ocr-queue"');
  } catch (error) {
    logger.error('Failed to start OCR worker:', error);
    process.exit(1);
  }
};

startOcrWorker();
