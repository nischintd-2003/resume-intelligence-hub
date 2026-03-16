import { matchQueue } from '@resume-hub/queue-lib';
import { logger } from '@resume-hub/logger';
import { JobRepository, jobRepository } from './job.repository';
import { AppError } from '../../utils/AppError';
import { CreateJobInput, JobResponseDTO, UpdateJobInput } from './job.dto';
import { toJobResponse } from './job.mapper';

export class JobService {
  constructor(private readonly repository: JobRepository) {}

  async createJobRole(userId: string, input: CreateJobInput): Promise<JobResponseDTO> {
    const job = await this.repository.createJobRecord(userId, input);

    matchQueue
      .add('calculate-match', { jobId: job.id, userId })
      .catch((err) =>
        logger.error(`Failed to enqueue match job after creating job ${job.id}:`, err),
      );

    return toJobResponse(job);
  }

  async getUserJobs(userId: string): Promise<JobResponseDTO[]> {
    const jobs = await this.repository.findJobsByUser(userId);
    return jobs.map(toJobResponse);
  }

  async getJobById(userId: string, jobId: string): Promise<JobResponseDTO> {
    const job = await this.repository.findJobByIdAndUser(jobId, userId);
    if (!job) throw new AppError('Job role not found or access denied', 404);
    return toJobResponse(job);
  }

  async updateJobRole(userId: string, jobId: string, data: UpdateJobInput) {
    const updatedJob = await this.repository.updateJobRecord(userId, jobId, data);
    if (!updatedJob) throw new AppError('Job not found or access denied', 404);

    const scoringFieldsChanged = 'requiredSkills' in data || 'isActive' in data;

    if (scoringFieldsChanged) {
      matchQueue
        .add('calculate-match', { jobId, userId })
        .catch((err) =>
          logger.error(`Failed to enqueue match job after updating job ${jobId}:`, err),
        );
    }

    return toJobResponse(updatedJob);
  }

  async deleteJobRole(userId: string, jobId: string) {
    const deletedCount = await this.repository.deleteJobRecord(userId, jobId);
    if (deletedCount === 0) throw new AppError('Job not found or access denied', 404);
    return true;
  }
}

export const jobService = new JobService(jobRepository);
