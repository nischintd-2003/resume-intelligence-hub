import { AnalyticsRepository, analyticsRepository } from './analytics.repository';
import { DashboardResponseDTO } from './analytics.dto';
import { toDashboardResponse } from './analytics.mapper';

export class AnalyticsService {
  constructor(private readonly repository: AnalyticsRepository) {}

  async getUserDashboard(userId: string): Promise<DashboardResponseDTO> {
    const analytics = await this.repository.findDashboardByUserId(userId);
    return toDashboardResponse(analytics);
  }
}

export const analyticsService = new AnalyticsService(analyticsRepository);
