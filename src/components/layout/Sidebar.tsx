import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@store/authStore';
import { NAV_ITEMS } from '@constants/navigation';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { t, i18n } = useTranslation(['common', 'sidebar']);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-[rgba(45,42,38,0.4)] z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 inset-s-0 z-50 w-50 shrink-0 bg-[#2a4a3e] flex flex-col transform transition-transform duration-300 lg:relative lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : i18n.dir() === 'rtl' ? 'translate-x-full' : '-translate-x-full'
        }`}
      >
        <div className="p-5 pb-4 border-b border-white/10 flex items-center justify-between">
          <Link
            to="/dashboard"
            onClick={() => onClose()}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity no-underline select-none"
          >
            <img src="/logo-light.svg" alt="HomePal" className="w-8 h-8 object-contain" />
            <div>
              <div className="text-white font-extrabold text-sm leading-none tracking-tight">
                {t('homepal')}
              </div>
              <div className="text-white/40 font-bold text-[9px] tracking-[0.12em] uppercase mt-1">
                {t('executivePanel', 'Executive Panel')}
              </div>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-white/50 hover:text-white -me-2 p-2 rounded-xl hover:bg-white/10 flex items-center justify-center shrink-0"
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => onClose()}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-sm transition-all duration-150 ${
                  isActive
                    ? 'font-semibold text-white bg-white/10'
                    : 'font-normal text-white/55 hover:bg-white/5 hover:text-white/80'
                }`
              }
            >
              {item.icon}
              {t(item.label)}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 flex flex-col gap-4">
          {/* <NavLink
            to="/dashboard/profile"
            onClick={() => onClose()}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-sm transition-all duration-150 ${
                isActive
                  ? 'font-semibold text-white bg-white/10'
                  : 'font-normal text-white/55 hover:bg-white/5 hover:text-white/80'
              }`
            }
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            Settings
          </NavLink> */}

          <button
            onClick={handleLogout}
            className="flex items-center justify-start gap-2.5 px-3 py-2.5 rounded-2xl text-sm text-white/45 hover:text-red-400 hover:bg-red-400/10 transition-all duration-150 w-full text-start"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {t('common:logout', 'Logout')}
          </button>
        </div>
      </aside>
    </>
  );
}
