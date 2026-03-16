import { JobRole } from '@resume-hub/database';
import { CreateJobInput, UpdateJobInput } from './job.dto';

export class JobRepository {
  async createJobRecord(userId: string, data: CreateJobInput) {
    return JobRole.create({
      userId,
      title: data.title,
      requiredSkills: data.requiredSkills,
    });
  }

  async findJobsByUser(userId: string) {
    return JobRole.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });
  }

  async findJobByIdAndUser(id: string, userId: string) {
    return JobRole.findOne({ where: { id, userId } });
  }

  async updateJobRecord(userId: string, jobId: string, updateData: UpdateJobInput) {
    const [_affectedCount, [updatedJob]] = await JobRole.update(updateData, {
      where: { id: jobId, userId },
      returning: true,
    });
    return updatedJob || null;
  }

  async deleteJobRecord(userId: string, jobId: string) {
    return JobRole.destroy({ where: { id: jobId, userId } });
  }
}

export const jobRepository = new JobRepository();
