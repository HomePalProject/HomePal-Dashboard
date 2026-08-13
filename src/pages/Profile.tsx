import { useState } from 'react';
import { cn } from '@lib/utils';
import { Toggle } from '@components/ui/Toggle';

export default function Profile() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [strictAuditLogs, setStrictAuditLogs] = useState(true);

  return (
    <div className="w-full flex flex-col gap-7 font-sans">
      {/* ── Page Title & Action Header ── */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-24 sm:text-32 font-extrabold text-[#2d2a26] tracking-tight m-0">
            Admin & System Settings
          </h1>
          <p className="text-sm text-[#7a7571] mt-1.5 mb-0">
            Manage platform administrators, roles, security controls, and mobile application status.
          </p>
        </div>
      </div>

      {/* ── Section 2: Platform Controls & Maintenance Mode ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
        {/* Mobile App Maintenance Mode Control */}
        <div className="bg-white rounded-2xl border border-[#e4e0da] shadow-[0_2px_12px_rgba(45,42,38,0.04)] p-24 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center',
                    maintenanceMode
                      ? 'bg-status-error-container text-status-error'
                      : 'bg-[#dceee8] text-[#2a4a3e]'
                  )}
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
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#2d2a26] m-0">
                    Mobile App Maintenance Mode
                  </h3>
                  <div className="text-xs text-[#a8a39d] mt-0.5">
                    Target: HomePal Mobile Application (End-Users)
                  </div>
                </div>
              </div>

              {/* Maintenance Toggle */}
              <Toggle
                checked={maintenanceMode}
                onChange={setMaintenanceMode}
                title={maintenanceMode ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
              />
            </div>

            <p className="text-13 text-[#5a5652] mt-4 leading-relaxed">
              Enabling Maintenance Mode displays a{' '}
              <strong>"System under scheduled maintenance"</strong> screen on the Mobile Application
              for clients. The Admin Panel remains operational.
            </p>
          </div>

          <div className="pt-4 border-t border-[#f4f2ee] flex justify-between items-center mt-4">
            <span className="text-xs font-semibold text-[#7a7571]">Current Mobile App Status:</span>
            <span
              className={cn(
                'text-xs font-extrabold px-2.5 py-[4px] rounded-full',
                maintenanceMode
                  ? 'text-status-error bg-status-error-container'
                  : 'text-status-success bg-status-success-container'
              )}
            >
              {maintenanceMode ? '⚠️ Under Maintenance' : '🟢 Live & Operational'}
            </span>
          </div>
        </div>

        {/* Security Policies */}
        <div className="bg-white rounded-2xl border border-[#e4e0da] shadow-[0_2px_12px_rgba(45,42,38,0.04)] p-24 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[#f4f2ee] text-[#2a4a3e] flex items-center justify-center">
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
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-[#2d2a26] m-0">
                Security & Session Policies
              </h3>
            </div>

            {/* Session Timeout Selector */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#5a5652] mb-1.5">
                Admin Session Idle Timeout
              </label>
              <select
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#e4e0da] text-13 text-[#2d2a26] bg-[#fcfbf9] outline-none cursor-pointer"
              >
                <option value="15">15 Minutes (High Security)</option>
                <option value="30">30 Minutes (Recommended)</option>
                <option value="60">1 Hour</option>
                <option value="0">Never (Dev Mode)</option>
              </select>
            </div>

            {/* Strict Audit Logging */}
            <div className="flex justify-between items-center pt-2.5">
              <div>
                <div className="text-13 font-semibold text-[#2d2a26]">
                  Strict Security Audit Logs
                </div>
                <div className="text-[11px] text-[#a8a39d]">
                  Log every admin action with IP address and username
                </div>
              </div>
              <Toggle
                checked={strictAuditLogs}
                onChange={setStrictAuditLogs}
                title="Strict Security Audit Logs"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#f4f2ee] text-right mt-4">
            <span className="text-[11px] text-[#a8a39d]">
              All security policies enforced globally across admin accounts.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
