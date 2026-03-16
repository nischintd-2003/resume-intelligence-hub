import type { NavItem } from './nav.types';

export interface HeaderProps {
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
}

export interface SidebarNavItemProps {
  item: NavItem;
  collapsed: boolean;
}
