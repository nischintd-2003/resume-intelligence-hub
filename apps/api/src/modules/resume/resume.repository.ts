import { JobRole, MatchResult, ParsedResume } from '@resume-hub/database';

export class ResumeRepository {
  async createResumeRecord(userId: string, minioPath: string) {
    return ParsedResume.create({ userId, minioPath, status: 'uploaded' });
  }

  async findResumesByUser(userId: string, limit: number, offset: number) {
    return ParsedResume.findAndCountAll({
      where: { userId },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
  }

  async findResumeByIdAndUser(id: string, userId: string) {
    return ParsedResume.findOne({ where: { id, userId } });
  }

  async updateResumeStatus(id: string, status: string) {
    return ParsedResume.update({ status }, { where: { id } });
  }

  async findMatchesByResumeId(resumeId: string) {
    return MatchResult.findAll({
      where: { resumeId },
      include: [{ model: JobRole, attributes: ['id', 'title', 'isActive'] }],
      order: [['score', 'DESC']],
    });
  }
}

export const resumeRepository = new ResumeRepository();
