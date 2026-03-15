import { api } from './api';
import { API_ENDPOINTS } from '../constants/api.constants';
import type { ApiResponse } from '../types/response.types';
import type { DashboardAnalyticsDTO } from '../types/analytics.types';

export const analyticsService = {
  getDashboard: async ({
    signal,
  }: { signal?: AbortSignal } = {}): Promise<DashboardAnalyticsDTO> => {
    const response = await api.get<ApiResponse<DashboardAnalyticsDTO>>(
      API_ENDPOINTS.ANALYTICS.DASHBOARD,
      { signal },
    );
    return response.data.data;
  },
};
