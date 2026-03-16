import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight, FileText, LogOut } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuthContext } from '../../contexts/AuthContext';
import { NAV_ITEMS, LAYOUT_COPY, ROUTES } from '../../constants/nav.constants';
import type { SidebarNavItemProps, SidebarProps } from '../../types/layout.props.types';

export function Sidebar({ collapsed, onToggleCollapse, mobileOpen }: SidebarProps) {
  const { user, logout } = useAuthContext();

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 h-screen z-30',
        'flex flex-col',
        'bg-brand-sidebar text-white',
        'border-r border-brand-sidebar-border',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-60',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}
    >
      {/*  Logo  */}
      <NavLink
        to={ROUTES.ANALYTICS}
        className={cn(
          'flex items-center gap-3 h-16 shrink-0 px-4',
          'border-b border-brand-sidebar-border',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-500',
          collapsed && 'justify-center px-0',
        )}
        aria-label={LAYOUT_COPY.APP_NAME}
      >
        <span className="shrink-0 w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
          <FileText className="w-4 h-4 text-white" aria-hidden="true" />
        </span>

        {!collapsed && (
          <span className="font-bold text-sm tracking-tight truncate">{LAYOUT_COPY.APP_NAME}</span>
        )}
      </NavLink>

      {/*  Nav Items  */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => (
          <SidebarNavItem key={item.key} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/*  Footer */}
      <div className="shrink-0 border-t border-brand-sidebar-border p-2 space-y-0.5">
        {/* User info */}
        {!collapsed && user && (
          <div className="px-3 py-2 mb-1">
            <p className="text-xs font-semibold text-white truncate">{user.username}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
        )}

        {/* Logout button */}
        <button
          onClick={logout}
          title={LAYOUT_COPY.LOGOUT}
          aria-label={LAYOUT_COPY.LOGOUT}
          className={cn(
            'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm',
            'text-slate-400 hover:text-white hover:bg-brand-sidebar-hover',
            'transition-colors duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500',
            collapsed && 'justify-center px-0',
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
          {!collapsed && <span>{LAYOUT_COPY.LOGOUT}</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={onToggleCollapse}
          title={collapsed ? LAYOUT_COPY.EXPAND_SIDEBAR : LAYOUT_COPY.COLLAPSE_SIDEBAR}
          aria-label={collapsed ? LAYOUT_COPY.EXPAND_SIDEBAR : LAYOUT_COPY.COLLAPSE_SIDEBAR}
          className={cn(
            'w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm',
            'text-slate-500 hover:text-white hover:bg-brand-sidebar-hover',
            'transition-colors duration-150',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500',
            collapsed && 'justify-center px-0',
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 shrink-0" aria-hidden="true" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

//  SidebarNavItem

function SidebarNavItem({ item, collapsed }: SidebarNavItemProps) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      aria-label={collapsed ? item.label : undefined}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
          'transition-colors duration-150',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500',
          isActive
            ? 'bg-white/10 text-white'
            : 'text-slate-400 hover:text-white hover:bg-brand-sidebar-hover/60',
          collapsed && 'justify-center px-0',
        )
      }
    >
      <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </NavLink>
  );
}
