import type { ComponentType } from 'react';

export interface NavItem {
  key: string;
  label: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
}
