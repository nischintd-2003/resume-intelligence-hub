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
    logger.error(`Failed to queue resume ${resume.id}:`, error);
  }

  return toResumeResponse(resume);
};

export const getUserResumes = async (userId: string): Promise<ResumeResponseDTO[]> => {
  const resumes = await resumeRepo.findResumesByUser(userId);
  return resumes.map(toResumeResponse);
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
