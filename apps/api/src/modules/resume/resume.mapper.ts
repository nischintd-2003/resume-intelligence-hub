import { ParsedResume } from '@resume-hub/database';
import { ResumeResponseDTO } from './resume.dto';

export const toResumeResponse = (resume: ParsedResume): ResumeResponseDTO => {
  return {
    id: resume.id,
    minioPath: resume.minioPath,
    status: resume.status,
    createdAt: resume.createdAt,
  };
};
