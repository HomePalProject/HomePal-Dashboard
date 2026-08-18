import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@store/authStore';
import { PAGE_LABELS } from '@constants/navigation';
import { Button } from '@components/ui/Button';

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
    <header className="h-13 flex items-center justify-between px-4 md:px-8 bg-background border-b border-border sticky top-0 z-30 shrink-0">
      <div className="flex items-center gap-3">
        <Button
          onClick={onMenuClick}
          variant="ghost"
          size="icon"
          className="lg:hidden -ml-2 text-text-secondary"
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
        </Button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-text-primary">{pageLabel}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <Button
            onClick={() => setProfileMenuOpen((v) => !v)}
            variant="outline"
            className="rounded-full py-1 px-1 sm:px-2.5 min-h-0 h-auto gap-2 bg-surface hover:bg-surface-variant border-border"
          >
            <span className="text-xs font-medium text-text-primary hidden sm:block">
              {user?.roles?.[0] || 'Admin'} Profile
            </span>
            <span className="w-6.5 h-6.5 rounded-full bg-primary-active text-white flex items-center justify-center text-[10px] font-bold">
              {initials}
            </span>
          </Button>

          {profileMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setProfileMenuOpen(false)} />
              <div className="absolute right-0 top-4 mt-6 min-w-40 bg-surface border border-border rounded-[10px] shadow-[0_8px_24px_rgba(45,42,38,0.1)] z-20 overflow-hidden py-1">
                <NavLink
                  to="/dashboard/profile"
                  onClick={() => setProfileMenuOpen(false)}
                  className="block px-3 py-2.5 text-[13px] text-text-primary no-underline hover:bg-surface-variant"
                >
                  View Profile
                </NavLink>
                <div className="border-t border-border my-1" />
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  className="w-full justify-start rounded-none px-3 py-2.5 text-[13px] text-status-error hover:bg-status-error-container/30 h-auto min-h-0 font-medium"
                >
                  Sign Out
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
