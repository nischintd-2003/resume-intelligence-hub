// Job DTO
export interface JobDTO {
  id: string;
  title: string;
  requiredSkills: string[];
  isActive: boolean;
  createdAt: string;
}

// Form input

export interface CreateJobFormValues {
  title: string;
  requiredSkills: string[];
}

export type CreateJobFormErrors = Partial<Record<keyof CreateJobFormValues, string>>;

// Toggle input

export interface ToggleJobInput {
  id: string;
  isActive: boolean;
}

// Props

export interface SkillTagInputProps {
  skills: string[];
  onChange: (skills: string[]) => void;
  disabled?: boolean;
  hasError?: boolean;
}
