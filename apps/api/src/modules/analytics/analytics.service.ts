import * as analyticsRepo from './analytics.repository';
import { DashboardResponseDTO } from './analytics.dto';
import { toDashboardResponse } from './analytics.mapper';

export const getUserDashboard = async (userId: string): Promise<DashboardResponseDTO> => {
  const analytics = await analyticsRepo.findDashboardByUserId(userId);
  return toDashboardResponse(analytics);
};
