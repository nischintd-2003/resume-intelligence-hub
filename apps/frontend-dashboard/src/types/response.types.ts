import type { PaginatedResult, ResumeDTO } from './resume.types';
import type { UploadFileItem } from './upload.types';

export interface ApiResponse<T> {
  status: string;
  data: T;
}

export interface UseUploadReturn {
  items: UploadFileItem[];
  isUploading: boolean;
  addFiles: (files: File[]) => void;
  removeFile: (id: string) => void;
  startAll: () => void;
  clearDone: () => void;
}

export interface PaginatedResumesResponse {
  status: string;
  data: ResumeDTO[];
  meta: PaginatedResult<ResumeDTO>['meta'];
}
