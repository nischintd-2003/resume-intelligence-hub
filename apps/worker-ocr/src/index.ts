import fs from 'fs';
import { createWorker, QUEUES, ExtractTextJob, nlpQueue } from '@resume-hub/queue-lib';
import { initDatabase, ParsedResume } from '@resume-hub/database';
import { logger } from '@resume-hub/logger';
import { downloadResumeToFile } from './utils/storage';
import { detectFileType } from './utils/inspector';
import { extractTextFromFile } from './utils/extractor';
import { startMetricsServer } from './metricsServer';
import { jobsProcessedTotal, jobErrorsTotal, jobProcessingTime } from './metrics';

const JOB_TIMEOUT_MS = 60_000;

const withTimeout = <T>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`[Timeout] ${label} exceeded ${ms}ms`)), ms),
  );
  return Promise.race([promise, timeout]);
};

const startOcrWorker = async () => {
  try {
    await initDatabase();
    startMetricsServer();

    createWorker<ExtractTextJob>(
      QUEUES.OCR,
      async (job) => {
        const jobId = job.id!;
        const { resumeId, userId, minioPath } = job.data;

        logger.info(`[Job ${jobId}] Received OCR job for resume ${resumeId}`);

        const resume = await ParsedResume.findOne({ where: { id: resumeId, userId } });

        if (!resume) {
          logger.warn(`[Job ${jobId}] Resume ${resumeId} not found — skipping`);
          return;
        }

        if (resume.status !== 'uploaded') {
          logger.warn(
            `[Job ${jobId}] Resume ${resumeId} already in status "${resume.status}" — skipping (idempotency guard)`,
          );
          return;
        }

        await ParsedResume.update({ status: 'ocr_processing' }, { where: { id: resumeId } });

        const stopTimer = jobProcessingTime.startTimer();
        let fileType: string = 'unknown';
        let tmpFilePath: string | undefined;

        try {
          tmpFilePath = await withTimeout(
            downloadResumeToFile(minioPath),
            JOB_TIMEOUT_MS,
            'downloadResumeToFile',
          );

          // Inspect file type from disk
          const detectedType = await detectFileType(tmpFilePath);
          fileType = detectedType;
          logger.info(`[Job ${jobId}] File type detected: ${fileType}`);

          if (detectedType === 'unsupported') {
            throw new Error('Unsupported file format — cannot parse text');
          }

          const extractedText = await withTimeout(
            extractTextFromFile(tmpFilePath, detectedType, jobId),
            JOB_TIMEOUT_MS,
            'extractTextFromFile',
          );

          const cleanText = extractedText.replace(/\s+/g, ' ').trim();
          logger.info(`[Job ${jobId}] Extraction complete — ${cleanText.length} chars`);

          // Update status
          await ParsedResume.update({ status: 'extracted' }, { where: { id: resumeId } });

          await nlpQueue.add('structure-data', {
            resumeId,
            userId,
            rawText: cleanText,
          });

          logger.info(`[Job ${jobId}] Pushed to NLP queue`);

          jobsProcessedTotal.inc({ file_type: fileType });
          stopTimer({ file_type: fileType });
        } catch (err: any) {
          await ParsedResume.update({ status: 'failed' }, { where: { id: resumeId } }).catch(
            (dbErr) => logger.error(`[Job ${jobId}] Could not mark resume as failed:`, dbErr),
          );

          jobErrorsTotal.inc({ reason: err.message?.slice(0, 50) ?? 'unknown' });
          stopTimer({ file_type: fileType });
          throw err;
        } finally {
          if (tmpFilePath) {
            await fs.promises
              .unlink(tmpFilePath)
              .catch((e) =>
                logger.warn(
                  `[Job ${jobId}] Failed to delete temp file ${tmpFilePath}: ${e.message}`,
                ),
              );
          }
        }
      },
      {
        concurrency: 2,
        lockDuration: JOB_TIMEOUT_MS,
      },
    );

    logger.info('OCR worker started — listening on "ocr-queue" (concurrency: 2)');
  } catch (error) {
    logger.error('Failed to start OCR worker:', error);
    process.exit(1);
  }
};

startOcrWorker();
