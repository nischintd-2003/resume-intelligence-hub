import { createWorker, QUEUES, GenerateInsightsJob, insightsQueue } from '@resume-hub/queue-lib';
import { initDatabase, DashboardAnalytics, ParsedResume, sequelize } from '@resume-hub/database';
import { logger } from '@resume-hub/logger';
import { QueryTypes } from 'sequelize';
import { User } from '@resume-hub/database';

const SWEEP_INTERVAL_MS = 60_000;

const computeAndPersistAnalytics = async (userId: string, jobId: string): Promise<void> => {
  await sequelize.transaction(async (t) => {
    await sequelize.query(
      `SELECT id FROM "dashboard_analytics" WHERE "userId" = :userId FOR UPDATE`,
      { replacements: { userId }, type: QueryTypes.SELECT, transaction: t },
    );

    // Total parsed resumes
    const totalResumes = await ParsedResume.count({
      where: { userId, status: 'parsed' },
      transaction: t,
    });

    //  Top 10 skills
    const topSkills = await sequelize.query(
      `
      SELECT skill, COUNT(*)::int AS count
      FROM "parsed_resumes",
      jsonb_array_elements_text(COALESCE("extractedData"->'skills', '[]'::jsonb)) AS skill
      WHERE "userId" = :userId AND "status" = 'parsed'
      GROUP BY skill
      ORDER BY count DESC
      LIMIT 10
      `,
      { replacements: { userId }, type: QueryTypes.SELECT, transaction: t },
    );

    // Top 5 universities
    const topUniversities = await sequelize.query(
      `
      SELECT university, COUNT(*)::int AS count
      FROM "parsed_resumes",
      jsonb_array_elements_text(COALESCE("extractedData"->'education', '[]'::jsonb)) AS university
      WHERE "userId" = :userId AND "status" = 'parsed'
      GROUP BY university
      ORDER BY count DESC
      LIMIT 5
      `,
      { replacements: { userId }, type: QueryTypes.SELECT, transaction: t },
    );

    //  Average match score per job role
    const matchAverages = await sequelize.query(
      `
      SELECT j.title AS "jobTitle", ROUND(AVG(m.score))::int AS "averageScore"
      FROM "MatchResults" m
      JOIN "job_roles" j ON m."jobId" = j.id
      WHERE j."userId" = :userId
      GROUP BY j.title
      ORDER BY "averageScore" DESC
      `,
      { replacements: { userId }, type: QueryTypes.SELECT, transaction: t },
    );

    await DashboardAnalytics.upsert(
      {
        userId,
        totalResumes,
        topSkills: topSkills as any[],
        topUniversities: topUniversities as any[],
        matchAverages: matchAverages as any[],
        updatedAt: new Date(),
      },
      { transaction: t },
    );
  });

  logger.info(`[Job ${jobId}] Analytics updated for user ${userId}`);
};

const enqueueForAllUsers = async (): Promise<void> => {
  try {
    const users = await User.findAll({ attributes: ['id'] });

    for (const user of users) {
      await insightsQueue.add(
        'generate-insights',
        { resumeId: '', userId: user.id },
        {
          jobId: `insights-${user.id}`,
          removeOnComplete: true,
          removeOnFail: true,
        },
      );
    }

    logger.debug(`[Sweep] Enqueued analytics refresh for ${users.length} users`);
  } catch (err) {
    logger.error('[Sweep] Failed to enqueue periodic analytics jobs:', err);
  }
};

const startInsightsWorker = async () => {
  try {
    await initDatabase();
    createWorker<GenerateInsightsJob>(QUEUES.INSIGHTS, async (job) => {
      const { userId } = job.data;
      logger.info(`[Job ${job.id}] Computing analytics for user ${userId}`);
      await computeAndPersistAnalytics(userId, job.id!);
    });

    await enqueueForAllUsers();
    setInterval(enqueueForAllUsers, SWEEP_INTERVAL_MS);

    logger.info(
      `Insights Engine started — listening on "insights-queue", sweeping every ${SWEEP_INTERVAL_MS / 1000}s`,
    );
  } catch (error) {
    logger.error('Failed to start Insights worker:', error);
    process.exit(1);
  }
};

startInsightsWorker();
