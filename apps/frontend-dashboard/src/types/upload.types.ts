export type UploadStatus = 'idle' | 'uploading' | 'registering' | 'done' | 'error';

export interface UploadFileItem {
  id: string;
  file: File;
  status: UploadStatus;
  progress: number;
  error?: string;
  minioPath?: string;
  resumeId?: string;
}

export interface TusUploadCallbacks {
  onProgress: (percent: number) => void;
  onSuccess: (minioPath: string) => void;
  onError: (message: string) => void;
}

// Props

export interface DropZoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
  disabled?: boolean;
}

export interface FileRowProps {
  item: UploadFileItem;
  onRemove: () => void;
  onRetry: () => void;
}
