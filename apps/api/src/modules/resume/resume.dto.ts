import { z } from 'zod';

export const CreateResumeSchema = z.object({
  body: z.object({
    minioPath: z.string().min(1, 'MinIO path is required'),
  }),
});

export const GetResumesQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
  }),
});

export type GetResumesQuery = z.infer<typeof GetResumesQuerySchema>['query'];
export type CreateResumeInput = z.infer<typeof CreateResumeSchema>['body'];

export type ResumeResponseDTO = {
  id: string;
  minioPath: string;
  status: string;
  extractedData?: any;
  createdAt: Date;
};
