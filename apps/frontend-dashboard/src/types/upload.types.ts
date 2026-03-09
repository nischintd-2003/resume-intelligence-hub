export type UploadStatus =
  | 'idle' // queued, not yet started
  | 'uploading' // TUS transfer in progress
  | 'registering' // TUS done, calling POST /api/resumes
  | 'done' // fully complete, resumeId available
  | 'error'; // any stage failed

export interface UploadFileItem {
  id: string;
  file: File;
  status: UploadStatus;
  progress: number;
  error?: string;
  minioPath?: string;
  resumeId?: string;
}
