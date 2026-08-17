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
          <h1 className="text-24 sm:text-32 font-extrabold text-[#2d2a26] tracking-tight m-0">
            Admin Profile
          </h1>
          <p className="text-sm text-[#7a7571] mt-1.5 mb-0">
            View your personal administrative account details and activity.
          </p>
        </div>
      </div>

      {/* ── Profile Card ── */}
      <div className="bg-white rounded-2xl border border-[#e4e0da] shadow-xs p-6 md:p-10 flex flex-col md:flex-row gap-10 items-start min-h-[300px]">
        {loading ? (
          <div className="flex-1 flex justify-center items-center h-48 w-full text-xs font-bold text-[#6d6862]">
            Loading profile data...
          </div>
        ) : error ? (
          <div className="flex-1 flex justify-center items-center h-48 w-full text-xs font-bold text-red-500 bg-red-50 rounded-xl border border-red-100">
            {error}
          </div>
        ) : meData ? (
          <>
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4 shrink-0">
              <div className="w-32 h-32 rounded-full bg-[#f4f2ee] flex items-center justify-center border border-[#e4e0da] shadow-sm overflow-hidden text-4xl font-extrabold text-[#a8a39d]">
                {meData?.username?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <span className="px-4 py-1.5 bg-[#eaf4ef] text-[#2a4a3e] text-[11px] font-extrabold tracking-wide uppercase rounded-full border border-[#dceee8]">
                {meData?.isActive ? 'Active Status' : 'Inactive Account'}
              </span>
            </div>

            {/* Details Section */}
            <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-8">
              <div>
                <label className="text-[11px] font-bold text-[#a8a39d] uppercase tracking-wider block mb-1.5">
                  Full Name / Username
                </label>
                <div className="text-base font-extrabold text-[#2d2a26]">
                  {meData?.username || 'Pal Admin'}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#a8a39d] uppercase tracking-wider block mb-1.5">
                  Email Address
                </label>
                <div className="text-base font-extrabold text-[#2d2a26]">
                  {meData?.email || 'admin@homepal.com'}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#a8a39d] uppercase tracking-wider block mb-1.5">
                  System Roles
                </label>
                <div className="flex gap-2 flex-wrap">
                  {meData?.roles && meData.roles.length > 0 ? (
                    meData.roles.map((role: string) => (
                      <span
                        key={role}
                        className="px-2 py-1 bg-[#f4f2ee] text-[#2d2a26] text-xs font-bold rounded-md border border-[#e4e0da]"
                      >
                        {role}
                      </span>
                    ))
                  ) : (
                    <span className="text-base font-extrabold text-[#2d2a26]">Administrator</span>
                  )}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#a8a39d] uppercase tracking-wider block mb-1.5">
                  Account ID
                </label>
                <div className="text-base font-extrabold text-[#2d2a26] text-xs">
                  {meData?.id || '—'}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#a8a39d] uppercase tracking-wider block mb-1.5">
                  Gender
                </label>
                <div className="text-base font-extrabold text-[#2d2a26] capitalize">
                  {meData?.gender || '—'}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#a8a39d] uppercase tracking-wider block mb-1.5">
                  Account Created
                </label>
                <div className="text-base font-extrabold text-[#2d2a26]">
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
