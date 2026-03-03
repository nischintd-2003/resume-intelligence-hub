export type SkillCount = { skill: string; count: number };
export type UniversityCount = { university: string; count: number };
export type MatchAverage = { jobTitle: string; averageScore: number };

export type DashboardResponseDTO = {
  totalResumes: number;
  topSkills: SkillCount[];
  topUniversities: UniversityCount[];
  matchAverages: MatchAverage[];
  updatedAt: Date | null;
};
