import { z } from 'zod';

export const CreateJobSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Job title must be at least 3 characters'),
    requiredSkills: z.array(z.string()).min(1, 'At least one required skill is needed'),
  }),
});

export const UpdateJobSchema = z.object({
  body: z
    .object({
      title: z.string().min(1, 'Title cannot be empty').optional(),
      description: z.string().min(10, 'Description is too short').optional(),
      requirements: z.array(z.string()).optional(),
      isActive: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
  params: z.object({
    id: z.string().uuid('Invalid job ID format'),
  }),
});

export type UpdateJobInput = z.infer<typeof UpdateJobSchema>['body'];

export type CreateJobInput = z.infer<typeof CreateJobSchema>['body'];

export type JobResponseDTO = {
  id: string;
  title: string;
  requiredSkills: string[];
  isActive: boolean;
  createdAt: Date;
};
