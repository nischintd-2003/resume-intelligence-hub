import { JobRole, MatchResult, ParsedResume } from '@resume-hub/database';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '@resume-hub/config';
import { publicS3 } from '../../config/constants';

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

  async getPresignedUrl(minioPath: string): Promise<string> {
    const key = minioPath.replace(/^(files\/)?/, '');

    const command = new GetObjectCommand({
      Bucket: config.minio.bucket,
      Key: key,
    });
    return getSignedUrl(publicS3, command, { expiresIn: 300 });
  }
}

export const resumeRepository = new ResumeRepository();
