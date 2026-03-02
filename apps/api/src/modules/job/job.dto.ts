import { z } from 'zod';

export const CreateJobSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Job title must be at least 3 characters'),
    requiredSkills: z.array(z.string()).min(1, 'At least one required skill is needed'),
  }),
});

export type CreateJobInput = z.infer<typeof CreateJobSchema>['body'];

export type JobResponseDTO = {
  id: string;
  title: string;
  requiredSkills: string[];
  createdAt: Date;
};
