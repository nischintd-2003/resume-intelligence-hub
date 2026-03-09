import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const SIDEBAR_COLLAPSED_KEY = 'sidebar:collapsed';

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState<boolean>(readCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleToggleCollapse() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return next;
    });
  }

  function handleToggleMobile() {
    setMobileOpen((prev) => !prev);
  }

  function handleOverlayClick() {
    setMobileOpen(false);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/*  Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          aria-hidden="true"
          onClick={handleOverlayClick}
        />
      )}

      {/*  Sidebar */}
      <div
        className={cn(
          'lg:block transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <Sidebar collapsed={collapsed} onToggleCollapse={handleToggleCollapse} />
      </div>

      {/*  Main area */}
      <div
        className={cn(
          'flex flex-col min-h-screen',
          'transition-all duration-300 ease-in-out',
          collapsed ? 'lg:pl-[68px]' : 'lg:pl-60',
        )}
      >
        <Header
          sidebarCollapsed={collapsed}
          mobileMenuOpen={mobileOpen}
          onToggleMobileMenu={handleToggleMobile}
        />

        {/*  Page content  */}
        <main className="flex-1 pt-16">
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
