import { useState, useEffect } from 'react';
import { authService } from '@services/authService';

export default function Profile() {
  const [meData, setMeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await authService.getMe();
        if (res.success) {
          setMeData(res.data);
        } else {
          setError(res.message || 'Failed to load profile data.');
        }
      } catch (err: any) {
        setError(err.message || 'Error communicating with server.');
      } finally {
        setLoading(false);
      }
    }
    fetchMe();
  }, []);

  return (
    <div className="w-full flex flex-col gap-7 font-sans pb-10">
      {/* ── Page Title ── */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight m-0">
            Admin Profile
          </h1>
          <p className="text-sm text-text-secondary mt-1.5 mb-0">
            View your personal administrative account details and activity.
          </p>
        </div>
      </div>

      {/* ── Profile Card ── */}
      <div className="bg-surface rounded-2xl border border-border shadow-xs p-6 md:p-10 flex flex-col md:flex-row gap-10 items-start min-h-[300px]">
        {loading ? (
          <div className="flex-1 flex justify-center items-center h-48 w-full text-xs font-bold text-text-secondary">
            Loading profile data...
          </div>
        ) : error ? (
          <div className="flex-1 flex justify-center items-center h-48 w-full text-xs font-bold text-status-error bg-status-error-container rounded-xl border border-status-error/20">
            {error}
          </div>
        ) : meData ? (
          <>
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4 shrink-0">
              <div className="w-32 h-32 rounded-full bg-surface-variant flex items-center justify-center border border-border shadow-sm overflow-hidden text-4xl font-extrabold text-text-disabled">
                {meData?.username?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <span className="px-4 py-1.5 bg-primary-container text-primary text-sm font-extrabold tracking-wide uppercase rounded-full border border-primary/20">
                {meData?.isActive ? 'Active Status' : 'Inactive Account'}
              </span>
            </div>

            {/* Details Section */}
            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-8">
              <div>
                <label className="text-sm font-bold text-text-disabled uppercase tracking-wider block mb-1.5">
                  Full Name / Username
                </label>
                <div className="text-base font-extrabold text-text-primary">
                  {meData?.username || 'Pal Admin'}
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-text-disabled uppercase tracking-wider block mb-1.5">
                  Email Address
                </label>
                <div className="text-base font-extrabold text-text-primary">
                  {meData?.email || 'admin@homepal.com'}
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-text-disabled uppercase tracking-wider block mb-1.5">
                  System Roles
                </label>
                <div className="flex gap-2 flex-wrap">
                  {meData?.roles && meData.roles.length > 0 ? (
                    meData.roles.map((role: string) => (
                      <span
                        key={role}
                        className="px-2 py-1 bg-surface-variant text-text-primary text-xs font-bold rounded-md border border-border"
                      >
                        {role}
                      </span>
                    ))
                  ) : (
                    <span className="text-base font-extrabold text-text-primary">
                      Administrator
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-text-disabled uppercase tracking-wider block mb-1.5">
                  Account ID
                </label>
                <div className="text-base font-extrabold text-text-primary text-xs">
                  {meData?.id || '—'}
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-text-disabled uppercase tracking-wider block mb-1.5">
                  Gender
                </label>
                <div className="text-base font-extrabold text-text-primary capitalize">
                  {meData?.gender || '—'}
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-text-disabled uppercase tracking-wider block mb-1.5">
                  Account Created
                </label>
                <div className="text-base font-extrabold text-text-primary">
                  {meData?.createdAt ? new Date(meData.createdAt).toLocaleDateString() : '—'}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
