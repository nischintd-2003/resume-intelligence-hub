export interface SkillCount {
  skill: string;
  count: number;
}

export interface UniversityCount {
  university: string;
  count: number;
}

export interface MatchAverage {
  jobTitle: string;
  averageScore: number;
}

export interface DashboardAnalyticsDTO {
  totalResumes: number;
  topSkills: SkillCount[];
  topUniversities: UniversityCount[];
  matchAverages: MatchAverage[];
  updatedAt: string | null;
}

// Props
export interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  sub?: string;
  truncate?: boolean;
}
