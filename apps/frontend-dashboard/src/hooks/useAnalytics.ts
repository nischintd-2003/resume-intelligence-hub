import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analytics.service';

export const ANALYTICS_QUERY_KEYS = {
  dashboard: () => ['analytics', 'dashboard'] as const,
};

export function useAnalytics() {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.dashboard(),
    queryFn: analyticsService.getDashboard,
    staleTime: 2 * 60 * 1000,
  });
}
