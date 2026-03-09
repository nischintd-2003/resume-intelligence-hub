import { JobRole, MatchResult, ParsedResume } from '@resume-hub/database';

export const createResumeRecord = async (userId: string, minioPath: string) => {
  return await ParsedResume.create({
    userId,
    minioPath,
    status: 'uploaded',
  });
};

export const findResumesByUser = async (userId: string, limit: number, offset: number) => {
  return await ParsedResume.findAndCountAll({
    where: { userId },
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });
};

export const findResumeByIdAndUser = async (id: string, userId: string) => {
  return await ParsedResume.findOne({
    where: { id, userId },
  });
};

export const findMatchesByResumeId = async (resumeId: string) => {
  return await MatchResult.findAll({
    where: { resumeId },
    include: [
      {
        model: JobRole,
        attributes: ['id', 'title', 'isActive'],
      },
    ],
    order: [['score', 'DESC']],
  });
};
