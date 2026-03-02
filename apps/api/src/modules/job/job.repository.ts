import { JobRole } from '@resume-hub/database';
import { CreateJobInput } from './job.dto';

export const createJobRecord = async (userId: string, data: CreateJobInput) => {
  return await JobRole.create({
    userId,
    title: data.title,
    requiredSkills: data.requiredSkills,
  });
};

export const findJobsByUser = async (userId: string) => {
  return await JobRole.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
  });
};

export const findJobByIdAndUser = async (id: string, userId: string) => {
  return await JobRole.findOne({
    where: { id, userId },
  });
};
