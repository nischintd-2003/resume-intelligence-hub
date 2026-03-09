import { MatchResult, ParsedResume } from '@resume-hub/database';
import { MatchResultDTO, ResumeResponseDTO } from './resume.dto';

export const toResumeResponse = (resume: ParsedResume): ResumeResponseDTO => {
  return {
    id: resume.id,
    minioPath: resume.minioPath,
    status: resume.status,
    extractedData: resume.extractedData,
    createdAt: resume.createdAt,
  };
};

export const toMatchResultResponse = (match: MatchResult): MatchResultDTO => {
  const jobRole = match.jobRole
    ? {
        id: match.jobRole.id,
        title: match.jobRole.title,
        isActive: match.jobRole.isActive,
      }
    : null;

  return {
    id: match.id,
    resumeId: match.resumeId,
    jobId: match.jobId,
    score: match.score,
    details: match.details,
    jobRole,
  };
};
