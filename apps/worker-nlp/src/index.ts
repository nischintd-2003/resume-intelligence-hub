import { createWorker, QUEUES, StructureDataJob } from '@resume-hub/queue-lib';
import { initDatabase, ParsedResume } from '@resume-hub/database';
import { logger } from '@resume-hub/logger';
import { extractStructuredData } from './utils/nlp';
import { matchQueue } from '@resume-hub/queue-lib';

const startNlpWorker = async () => {
  try {
    await initDatabase();

    createWorker<StructureDataJob>(QUEUES.NLP, async (job) => {
      const jobId = job.id!;
      logger.info(`[Job ${jobId}] Caught NLP Job for Resume: ${job.data.resumeId}`);

      // Structure the Data via Local NLP
      const structuredData = await extractStructuredData(job.data.rawText, jobId);

      logger.info(
        `[Job ${jobId}] NLP Complete. Found ${structuredData.skills.length} skills and ${structuredData.experience.length} orgs.`,
      );

      // Persist to Database
      const updatedRecord = await ParsedResume.update(
        {
          status: 'parsed',
          extractedData: structuredData,
        },
        {
          where: { id: job.data.resumeId, userId: job.data.userId },
          returning: true,
        },
      );

      if (updatedRecord[0] === 0) {
        throw new Error(`Failed to update resume ${job.data.resumeId} in database.`);
      }

      logger.info(
        `[Job ${jobId}] Database updated. Resume ${job.data.resumeId} status is now 'parsed'.`,
      );

      await matchQueue.add('calculate-math', {
        resumeId: job.data.resumeId,
        userId: job.data.userId,
      });

      logger.info(`[Job ${jobId}] Fired Match event for Resume ${job.data.resumeId}`);
    });

    logger.info(' NLP Worker started (using compromise+chrono) and listening to "nlp-queue"');
  } catch (error) {
    logger.error('Failed to start NLP worker:', error);
    process.exit(1);
  }
};

startNlpWorker();
