import { DashboardAnalytics } from '@resume-hub/database';

export const findDashboardByUserId = async (userId: string) => {
  return await DashboardAnalytics.findOne({ where: { userId } });
};
