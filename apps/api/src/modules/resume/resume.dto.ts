import { z } from 'zod';

export const CreateResumeSchema = z.object({
  body: z.object({
    minioPath: z.string().min(1, 'MinIO path is required'),
  }),
});

export type CreateResumeInput = z.infer<typeof CreateResumeSchema>['body'];

export type ResumeResponseDTO = {
  id: string;
  minioPath: string;
  status: string;
  createdAt: Date;
};
