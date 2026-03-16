import { createWorker, QUEUES, CalculateMatchJob, insightsQueue } from '@resume-hub/queue-lib';
import { initDatabase, ParsedResume, JobRole, MatchResult } from '@resume-hub/database';
import { logger } from '@resume-hub/logger';
import { calculateScore } from './utils/scorer';

const startMatchWorker = async () => {
  try {
    await initDatabase();

    createWorker<CalculateMatchJob>(QUEUES.MATCH, async (job) => {
      const { resumeId, jobId, userId } = job.data;
      logger.info(
        `[Job ${job.id}] Match job — resumeId=${resumeId ?? 'n/a'} jobId=${jobId ?? 'n/a'}`,
      );

      if (resumeId && !jobId) {
        await matchResumeAgainstAllJobs(job.id!, resumeId, userId);
        await insightsQueue.add(
          'generate-insights',
          { resumeId, userId },
          { jobId: `insights-${userId}`, removeOnComplete: true, removeOnFail: true },
        );
        logger.info(`[Job ${job.id}] Fired Insights event`);
      } else if (jobId && !resumeId) {
        await matchJobAgainstAllResumes(job.id!, jobId, userId);
      } else {
        throw new Error(
          'Invalid CalculateMatchJob payload: supply either resumeId OR jobId, not both or neither.',
        );
      }
    });

    logger.info('Match Engine started — listening on "match-queue"');
  } catch (error) {
    logger.error('Failed to start Match worker:', error);
    process.exit(1);
  }
};

// one resume vs all active jobs for this user
const matchResumeAgainstAllJobs = async (
  workerId: string,
  resumeId: string,
  userId: string,
): Promise<void> => {
  const resume = await ParsedResume.findOne({ where: { id: resumeId, userId } });

  if (!resume?.extractedData?.skills?.length) {
    throw new Error(`Resume ${resumeId} has no parsed skills — cannot match.`);
  }

  const candidateSkills: string[] = resume.extractedData.skills;
  const activeJobs = await JobRole.findAll({ where: { userId, isActive: true } });

  logger.info(
    `[Job ${workerId}] Evaluating resume ${resumeId} against ${activeJobs.length} active roles`,
  );

  for (const role of activeJobs) {
    const { score, matchedSkills, missingSkills } = calculateScore(
      candidateSkills,
      role.requiredSkills,
    );

    await MatchResult.upsert({
      resumeId,
      jobId: role.id,
      score,
      details: { matchedSkills, missingSkills },
    });
  }

  logger.info(`[Job ${workerId}] Matched resume ${resumeId} against ${activeJobs.length} roles`);
};

// one job vs all parsed resumes for this user
const matchJobAgainstAllResumes = async (
  workerId: string,
  jobId: string,
  userId: string,
): Promise<void> => {
  const jobRole = await JobRole.findOne({ where: { id: jobId, userId } });

  if (!jobRole) {
    throw new Error(`Job ${jobId} not found for user ${userId}`);
  }

  if (!jobRole.isActive) {
    logger.info(`[Job ${workerId}] Job ${jobId} is inactive — skipping`);
    return;
  }

  const parsedResumes = await ParsedResume.findAll({ where: { userId, status: 'parsed' } });

  logger.info(
    `[Job ${workerId}] Evaluating job ${jobId} against ${parsedResumes.length} parsed resumes`,
  );

  for (const resume of parsedResumes) {
    const candidateSkills: string[] = resume.extractedData?.skills ?? [];

    const { score, matchedSkills, missingSkills } = calculateScore(
      candidateSkills,
      jobRole.requiredSkills,
    );

    await MatchResult.upsert({
      resumeId: resume.id,
      jobId,
      score,
      details: { matchedSkills, missingSkills },
    });
  }

  logger.info(`[Job ${workerId}] Matched job ${jobId} against ${parsedResumes.length} resumes`);
};

startMatchWorker();
