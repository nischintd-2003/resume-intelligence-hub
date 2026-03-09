import type { ResumeDTO } from './resume.types';
import type { UploadFileItem } from './upload.types';

export interface DropZoneProps {
  onFilesSelected: (files: FileList | File[]) => void;
  disabled?: boolean;
}

export interface FileRowProps {
  item: UploadFileItem;
  onRemove: () => void;
}

// Resume

export interface ResumeRowProps {
  resume: ResumeDTO;
  isSelected: boolean;
  onClick: () => void;
}

export interface MatchesPanelProps {
  resumeId: string;
  onClose: () => void;
}

export interface SkillGroupProps {
  label: string;
  skills: string[];
  variant: 'matched' | 'missing';
}

export interface PaginationProps {
  meta: { currentPage: number; totalPages: number; totalItems: number; itemsPerPage: number };
  onPrev: () => void;
  onNext: () => void;
  isFetching: boolean;
}
