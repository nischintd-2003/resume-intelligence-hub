import * as resumeRepo from './resume.repository';
import { AppError } from '../../utils/AppError';
import { CreateResumeInput, ResumeResponseDTO } from './resume.dto';
import { toResumeResponse } from './resume.mapper';

export const uploadResumeRecord = async (
  userId: string,
  input: CreateResumeInput,
): Promise<ResumeResponseDTO> => {
  const resume = await resumeRepo.createResumeRecord(userId, input.minioPath);

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
