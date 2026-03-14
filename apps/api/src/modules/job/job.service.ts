import { JobRepository, jobRepository } from './job.repository';
import { AppError } from '../../utils/AppError';
import { CreateJobInput, JobResponseDTO, UpdateJobInput } from './job.dto';
import { toJobResponse } from './job.mapper';

export class JobService {
  constructor(private readonly repository: JobRepository) {}

  async createJobRole(userId: string, input: CreateJobInput): Promise<JobResponseDTO> {
    const job = await this.repository.createJobRecord(userId, input);
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
    return toJobResponse(updatedJob);
  }

  async deleteJobRole(userId: string, jobId: string) {
    const deletedCount = await this.repository.deleteJobRecord(userId, jobId);
    if (deletedCount === 0) throw new AppError('Job not found or access denied', 404);
    return true;
  }
}

export const jobService = new JobService(jobRepository);
