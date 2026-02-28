import { JobRole } from '@resume-hub/database';
import { JobResponseDTO } from './job.dto';

export const toJobResponse = (job: JobRole): JobResponseDTO => {
  return {
    id: job.id,
    title: job.title,
    requiredSkills: job.requiredSkills,
    createdAt: job.createdAt,
  };
};
