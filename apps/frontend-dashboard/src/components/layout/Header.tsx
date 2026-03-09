import { useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuthContext } from '../../contexts/AuthContext';
import { LAYOUT_COPY } from '../../constants/nav.constants';
import type { HeaderProps } from '../../types/layout.props.types';

export function Header({ sidebarCollapsed, mobileMenuOpen, onToggleMobileMenu }: HeaderProps) {
  const location = useLocation();
  const { user } = useAuthContext();

  const pageTitle = LAYOUT_COPY.PAGE_TITLES[location.pathname] ?? 'Dashboard';

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-20 h-16',
        'flex items-center justify-between',
        'bg-white border-b border-slate-200',
        'px-4 sm:px-6',
        'transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'left-[68px]' : 'left-0 lg:left-60',
      )}
    >
      {/* Left: Mobile menu button + Page title  */}
      <div className="flex items-center gap-3">
        {/* Mobile hamburger  */}
        <button
          onClick={onToggleMobileMenu}
          aria-label={mobileMenuOpen ? LAYOUT_COPY.CLOSE_MENU : LAYOUT_COPY.OPEN_MENU}
          aria-expanded={mobileMenuOpen}
          className={cn(
            'lg:hidden p-2 rounded-lg text-slate-500',
            'hover:text-slate-700 hover:bg-slate-100',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400',
            'transition-colors',
          )}
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" aria-hidden="true" />
          ) : (
            <Menu className="w-5 h-5" aria-hidden="true" />
          )}
        </button>

        {/* Page title */}
        <h1 className="text-base font-semibold text-slate-800 tracking-tight">{pageTitle}</h1>
      </div>

      {/*  Right: User avatar */}
      {user && (
        <div className="flex items-center gap-2.5">
          {/* Avatar circle with initials */}
          <div
            aria-hidden="true"
            className={cn(
              'w-8 h-8 rounded-full',
              'bg-slate-800 text-white',
              'flex items-center justify-center',
              'text-xs font-bold uppercase select-none',
            )}
          >
            {user.username.charAt(0)}
          </div>

          {/* Username */}
          <span className="hidden sm:block text-sm font-medium text-slate-700 truncate max-w-[120px]">
            {user.username}
          </span>
        </div>
      )}
    </header>
  );
}
