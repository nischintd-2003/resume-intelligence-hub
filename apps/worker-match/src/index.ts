import { createWorker, QUEUES, CalculateMatchJob, insightsQueue } from '@resume-hub/queue-lib';
import { initDatabase, ParsedResume, JobRole, MatchResult } from '@resume-hub/database';
import { logger } from '@resume-hub/logger';

const calculateScore = (candidateSkills: string[], requiredSkills: string[]) => {
  if (requiredSkills.length === 0) return { score: 100, matched: [], missing: [] };

  const normalizedCandidate = new Set(candidateSkills.map((s) => s.toLowerCase().trim()));
  const matched: string[] = [];
  const missing: string[] = [];

  requiredSkills.forEach((req) => {
    const normalizedReq = req.toLowerCase().trim();
    if (normalizedCandidate.has(normalizedReq)) {
      matched.push(req);
    } else {
      missing.push(req);
    }
  });

  const score = Math.round((matched.length / requiredSkills.length) * 100);
  return { score, matched, missing };
};

const startMatchWorker = async () => {
  try {
    await initDatabase();

    createWorker<CalculateMatchJob>(QUEUES.MATCH, async (job) => {
      const { resumeId, userId } = job.data;
      logger.info(`[Job ${job.id}] Caught Match Job for Resume: ${resumeId}`);

      // Fetch the parsed resume
      const resume = await ParsedResume.findOne({ where: { id: resumeId, userId } });
      if (!resume || !resume.extractedData || !resume.extractedData.skills) {
        throw new Error(`Resume ${resumeId} lacks parsed skills data.`);
      }

      const candidateSkills = resume.extractedData.skills;

      // Fetch all active jobs
      const activeJobs = await JobRole.findAll({ where: { isActive: true } });
      logger.info(`[Job ${job.id}] Evaluating candidate against ${activeJobs.length} open roles.`);

      // Compute and store match scores
      for (const role of activeJobs) {
        const { score, matched, missing } = calculateScore(candidateSkills, role.requiredSkills);

        await MatchResult.upsert({
          resumeId,
          jobId: role.id,
          score,
          details: { matchedSkills: matched, missingSkills: missing },
        });
      }

      logger.info(`[Job ${job.id}] Successfully matched resume against all active jobs.`);

      await insightsQueue.add('generate-insights', {
        resumeId,
        userId,
      });

      logger.info(`[Job ${job.id}] Fired Insights event`);
    });

    logger.info('Match Engine started and listening to "match-queue"');
  } catch (error) {
    logger.error('Failed to start Match worker:', error);
    process.exit(1);
  }
};

startMatchWorker();
