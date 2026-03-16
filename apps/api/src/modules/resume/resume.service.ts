import { ocrQueue } from '@resume-hub/queue-lib';
import { config } from '@resume-hub/config';
import { logger } from '@resume-hub/logger';
import { ResumeRepository, resumeRepository } from './resume.repository';
import { AppError } from '../../utils/AppError';
import { CreateResumeInput, MatchResultDTO, ResumeResponseDTO } from './resume.dto';
import { toMatchResultResponse, toResumeResponse } from './resume.mapper';

export class ResumeService {
  constructor(private readonly repository: ResumeRepository) {}

  async uploadResumeRecord(userId: string, input: CreateResumeInput): Promise<ResumeResponseDTO> {
    const resume = await this.repository.createResumeRecord(userId, input.minioPath);

    try {
      await ocrQueue.add(
        'extract-text',
        { resumeId: resume.id, userId, minioPath: resume.minioPath },
        {
          attempts: config.queue.attempts,
          backoff: { type: 'exponential', delay: config.queue.backoffDelay },
        },
      );
      logger.info(`Successfully queued resume ${resume.id} to ocr-queue`);
    } catch (error) {
      await this.repository.updateResumeStatus(resume.id, 'failed').catch((updateErr) => {
        logger.error(`Failed to mark resume ${resume.id} as failed:`, updateErr);
      });
      logger.error(`Failed to queue resume ${resume.id} to ocr-queue:`, error);
      throw new AppError(
        'Resume was saved but could not be queued for processing. Please try again.',
        500,
      );
    }

    return toResumeResponse(resume);
  }

  async getUserResumes(userId: string, page: number, limit: number) {
    const offset = (page - 1) * limit;
    const { rows, count } = await this.repository.findResumesByUser(userId, limit, offset);
    return {
      data: rows.map(toResumeResponse),
      meta: {
        totalItems: count,
        itemCount: rows.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      },
    };
  }

  async getResumeById(userId: string, resumeId: string): Promise<ResumeResponseDTO> {
    const resume = await this.repository.findResumeByIdAndUser(resumeId, userId);
    if (!resume) throw new AppError('Resume not found or access denied', 404);
    return toResumeResponse(resume);
  }

  async getResumeMatches(userId: string, resumeId: string): Promise<MatchResultDTO[]> {
    const resume = await this.repository.findResumeByIdAndUser(resumeId, userId);
    if (!resume) throw new AppError('Resume not found or access denied', 404);
    const matches = await this.repository.findMatchesByResumeId(resumeId);
    return matches.map(toMatchResultResponse);
  }

  async getResumePreviewUrl(userId: string, resumeId: string): Promise<string> {
    const resume = await this.repository.findResumeByIdAndUser(resumeId, userId);
    if (!resume) throw new AppError('Resume not found or access denied', 404);
    return this.repository.getPresignedUrl(resume.minioPath);
  }
}

export const resumeService = new ResumeService(resumeRepository);
