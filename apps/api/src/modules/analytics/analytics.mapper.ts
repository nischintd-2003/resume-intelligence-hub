import { DashboardAnalytics } from '@resume-hub/database';
import { DashboardResponseDTO } from './analytics.dto';

export const toDashboardResponse = (analytics: DashboardAnalytics | null): DashboardResponseDTO => {
  if (!analytics) {
    return {
      totalResumes: 0,
      topSkills: [],
      topUniversities: [],
      matchAverages: [],
      updatedAt: null,
    };
  }

  return {
    totalResumes: analytics.totalResumes,
    topSkills: analytics.topSkills || [],
    topUniversities: analytics.topUniversities || [],
    matchAverages: analytics.matchAverages || [],
    updatedAt: analytics.updatedAt,
  };
};
