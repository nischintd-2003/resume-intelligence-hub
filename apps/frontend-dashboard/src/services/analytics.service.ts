import { api } from './api';
import { API_ENDPOINTS } from '../constants/api.constants';
import type { ApiResponse } from '../types/response.types';
import type { DashboardAnalyticsDTO } from '../types/analytics.types';

export const analyticsService = {
  getDashboard: async (): Promise<DashboardAnalyticsDTO> => {
    const response = await api.get<ApiResponse<DashboardAnalyticsDTO>>(
      API_ENDPOINTS.ANALYTICS.DASHBOARD,
    );
    return response.data.data;
  },
};
