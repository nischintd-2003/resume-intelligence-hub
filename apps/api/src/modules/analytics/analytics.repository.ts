import { DashboardAnalytics } from '@resume-hub/database';

export class AnalyticsRepository {
  async findDashboardByUserId(userId: string) {
    return DashboardAnalytics.findOne({ where: { userId } });
  }
}

export const analyticsRepository = new AnalyticsRepository();
