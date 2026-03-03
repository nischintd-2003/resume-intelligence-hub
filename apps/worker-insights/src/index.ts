import { createWorker, QUEUES, GenerateInsightsJob } from '@resume-hub/queue-lib';
import { initDatabase, DashboardAnalytics, ParsedResume, sequelize } from '@resume-hub/database';
import { logger } from '@resume-hub/logger';
import { QueryTypes } from 'sequelize';

const startInsightsWorker = async () => {
  try {
    await initDatabase();

    createWorker<GenerateInsightsJob>(QUEUES.INSIGHTS, async (job) => {
      const { userId } = job.data;
      logger.info(`[Job ${job.id}] Pre-computing analytics for User: ${userId}`);

      // Total Resumes
      const totalResumes = await ParsedResume.count({ where: { userId, status: 'parsed' } });

      // Top Skills
      const topSkills = await sequelize.query(
        `
        SELECT skill, COUNT(*) as count
        FROM "parsed_resumes",
        jsonb_array_elements_text(COALESCE("extractedData"->'skills', '[]'::jsonb)) as skill
        WHERE "userId" = :userId AND "status" = 'parsed'
        GROUP BY skill
        ORDER BY count DESC
        LIMIT 10;
      `,
        { replacements: { userId }, type: QueryTypes.SELECT },
      );

      // Top Universities / Education
      const topUniversities = await sequelize.query(
        `
        SELECT university, COUNT(*) as count
        FROM "parsed_resumes",
        jsonb_array_elements_text(COALESCE("extractedData"->'education', '[]'::jsonb)) as university
        WHERE "userId" = :userId AND "status" = 'parsed'
        GROUP BY university
        ORDER BY count DESC
        LIMIT 5;
      `,
        { replacements: { userId }, type: QueryTypes.SELECT },
      );

      // Average Match Scores per Job Role
      const matchAverages = await sequelize.query(
        `
        SELECT j.title as "jobTitle", ROUND(AVG(m.score)) as "averageScore"
        FROM "MatchResults" m
        JOIN "job_roles" j ON m."jobId" = j.id
        WHERE j."userId" = :userId
        GROUP BY j.title
        ORDER BY "averageScore" DESC;
      `,
        { replacements: { userId }, type: QueryTypes.SELECT },
      );

      // Upsert the Materialized Row
      await DashboardAnalytics.upsert({
        userId,
        totalResumes,
        topSkills: topSkills as any[],
        topUniversities: topUniversities as any[],
        matchAverages: matchAverages as any[],
      });

      logger.info(`[Job ${job.id}]  Analytics dashboard updated successfully.`);
    });

    logger.info(' Insights Engine started and listening to "insights-queue"');
  } catch (error) {
    logger.error('Failed to start Insights worker:', error);
    process.exit(1);
  }
};

startInsightsWorker();
