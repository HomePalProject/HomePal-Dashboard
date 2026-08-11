import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';
import { PAGE_LABELS } from '@constants/navigation';

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const pageLabel = PAGE_LABELS[location.pathname] ?? 'Dashboard';

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'AD';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-52 flex items-center justify-between px-16 md:px-32 bg-background border-b border-border sticky top-0 z-30 shrink-0">
      <div className="flex items-center gap-12">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-8 -ml-8 text-text-secondary hover:text-text-primary rounded-md hover:bg-surface-variant transition-colors"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="flex items-center gap-8">
          <span className="text-14 font-medium text-text-primary">{pageLabel}</span>
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="relative">
          <button
            onClick={() => setProfileMenuOpen((v) => !v)}
            className="flex items-center gap-8 ps-12 pe-2.5 py-4 rounded-full border border-border bg-surface cursor-pointer hover:bg-surface-variant transition-colors"
          >
            <span className="text-12 font-medium text-text-primary hidden sm:block">
              {user?.roles?.[0] || 'Admin'} Profile
            </span>
            <span className="w-6.5 h-6.5 rounded-full bg-primary-active text-white flex items-center justify-center text-[10px] font-bold">
              {initials}
            </span>
          </button>

          {profileMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setProfileMenuOpen(false)} />
              <div className="absolute right-0 top-16 mt-24 min-w-[160px] bg-surface border border-border rounded-[10px] shadow-[0_8px_24px_rgba(45,42,38,0.1)] z-20 overflow-hidden py-4">
                <NavLink
                  to="/dashboard/profile"
                  onClick={() => setProfileMenuOpen(false)}
                  className="block px-12 py-2.5 text-13 text-text-primary no-underline hover:bg-surface-variant"
                >
                  View Profile
                </NavLink>
                <div className="border-t border-border my-4" />
                <button
                  onClick={handleLogout}
                  className="block w-full px-12 py-2.5 text-13 text-status-error bg-transparent border-none cursor-pointer text-left hover:bg-status-error-container/30"
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
