import { BarChart2, Briefcase, FileText, UploadCloud } from 'lucide-react';
import type { NavItem } from '../types/nav.types';

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  ANALYTICS: '/dashboard/analytics',
  RESUMES: '/dashboard/resumes',
  JOBS: '/dashboard/jobs',
  UPLOAD: '/dashboard/upload',
} as const;

export const NAV_ITEMS: NavItem[] = [
  {
    key: 'analytics',
    label: 'Analytics',
    path: ROUTES.ANALYTICS,
    icon: BarChart2,
  },
  {
    key: 'resumes',
    label: 'Resumes',
    path: ROUTES.RESUMES,
    icon: FileText,
  },
  {
    key: 'jobs',
    label: 'Jobs',
    path: ROUTES.JOBS,
    icon: Briefcase,
  },
  {
    key: 'upload',
    label: 'Upload',
    path: ROUTES.UPLOAD,
    icon: UploadCloud,
  },
];

export const LAYOUT_COPY = {
  APP_NAME: 'Resume Hub',
  LOGOUT: 'Sign out',
  COLLAPSE_SIDEBAR: 'Collapse sidebar',
  EXPAND_SIDEBAR: 'Expand sidebar',
  OPEN_MENU: 'Open menu',
  CLOSE_MENU: 'Close menu',
  PAGE_TITLES: {
    [ROUTES.ANALYTICS]: 'Analytics',
    [ROUTES.RESUMES]: 'Resumes',
    [ROUTES.JOBS]: 'Jobs',
    [ROUTES.UPLOAD]: 'Upload',
  } as Record<string, string>,
} as const;
