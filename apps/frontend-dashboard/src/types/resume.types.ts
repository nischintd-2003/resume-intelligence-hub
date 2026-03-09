// Pagination
export interface PaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

//  Resume

export type ResumeStatus = 'uploaded' | 'extracted' | 'parsed' | 'failed';

export interface ExtractedResumeData {
  skills: string[];
  experience: string[];
  education: string[];
  datesFound: string[];
}

export interface ResumeDTO {
  id: string;
  minioPath: string;
  status: ResumeStatus;
  extractedData: ExtractedResumeData | null;
  createdAt: string;
}

//  Match Result

export interface JobRoleRef {
  id: string;
  title: string;
  isActive: boolean;
}

export interface MatchDetails {
  matchedSkills: string[];
  missingSkills: string[];
}

export interface MatchResultDTO {
  id: string;
  resumeId: string;
  jobId: string;
  score: number;
  details: MatchDetails;
  JobRole: JobRoleRef;
}
