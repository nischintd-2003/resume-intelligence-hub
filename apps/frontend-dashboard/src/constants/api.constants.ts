export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  RESUMES: {
    BASE: '/resumes',
    MATCHES: (id: string) => `/resumes/${id}/matches`,
  },
  JOBS: {
    BASE: '/jobs',
    BY_ID: (id: string) => `/jobs/${id}`,
  },
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
  },
} as const;
