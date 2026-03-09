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

export interface ResumeResponseDTO {
  id: string;
  minioPath: string;
  status: string;
  createdAt: string;
}
