import { ocrQueue } from '@resume-hub/queue-lib';
import { config } from '@resume-hub/config';
import { logger } from '@resume-hub/logger';
import * as resumeRepo from './resume.repository';
import { AppError } from '../../utils/AppError';
import { CreateResumeInput, ResumeResponseDTO } from './resume.dto';
import { toResumeResponse } from './resume.mapper';

export const uploadResumeRecord = async (
  userId: string,
  input: CreateResumeInput,
): Promise<ResumeResponseDTO> => {
  const resume = await resumeRepo.createResumeRecord(userId, input.minioPath);

  try {
    await ocrQueue.add(
      'extract-text',
      {
        resumeId: resume.id,
        userId: userId,
        minioPath: resume.minioPath,
      },
      {
        attempts: config.queue.attempts,
        backoff: { type: 'exponential', delay: config.queue.backoffDelay },
      },
    );

    logger.info(`Successfully queued resume ${resume.id} to ocr-queue`);
  } catch (error) {
    await resumeRepo.updateResumeStatus(resume.id, 'failed').catch((updateErr) => {
      logger.error(`Failed to mark resume ${resume.id} as failed:`, updateErr);
    });
    logger.error(`Failed to queue resume ${resume.id} to ocr-queue:`, error);
    throw new AppError(
      'Resume was saved but could not be queued for processing. Please try again.',
      500,
    );
  }
  return toResumeResponse(resume);
};

export const getUserResumes = async (userId: string, page: number, limit: number) => {
  const offset = (page - 1) * limit;
  const { rows, count } = await resumeRepo.findResumesByUser(userId, limit, offset);
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
};

export const getResumeById = async (
  userId: string,
  resumeId: string,
): Promise<ResumeResponseDTO> => {
  const resume = await resumeRepo.findResumeByIdAndUser(resumeId, userId);

  if (!resume) {
    throw new AppError('Resume not found or access denied', 404);
  }

  return toResumeResponse(resume);
};

export const getResumeMatches = async (userId: string, resumeId: string) => {
  const resume = await resumeRepo.findResumeByIdAndUser(resumeId, userId);
  if (!resume) {
    throw new AppError('Resume not found or access denied', 404);
  }

  const matches = await resumeRepo.findMatchesByResumeId(resumeId);
  return matches;
};
