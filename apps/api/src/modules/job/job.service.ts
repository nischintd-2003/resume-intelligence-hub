import * as jobRepo from './job.repository';
import { AppError } from '../../utils/AppError';
import { CreateJobInput, JobResponseDTO } from './job.dto';
import { toJobResponse } from './job.mapper';

export const createJobRole = async (
  userId: string,
  input: CreateJobInput,
): Promise<JobResponseDTO> => {
  const job = await jobRepo.createJobRecord(userId, input);
  return toJobResponse(job);
};

export const getUserJobs = async (userId: string): Promise<JobResponseDTO[]> => {
  const jobs = await jobRepo.findJobsByUser(userId);
  return jobs.map(toJobResponse);
};

export const getJobById = async (userId: string, jobId: string): Promise<JobResponseDTO> => {
  const job = await jobRepo.findJobByIdAndUser(jobId, userId);

  if (!job) {
    throw new AppError('Job role not found or access denied', 404);
  }

  return toJobResponse(job);
};
