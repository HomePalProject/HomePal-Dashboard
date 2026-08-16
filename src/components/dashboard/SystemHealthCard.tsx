import { useState, useEffect } from 'react';
import { useAuthStore } from '@store/authStore';
import { Card } from '@components/ui/Card';
import { api } from '@services/api';

interface SystemHealthCardProps {
  delay?: number;
}

export function SystemHealthCard({ delay = 0 }: SystemHealthCardProps) {
  const [vis, setVis] = useState(false);
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    const t = setTimeout(() => setVis(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    const token = useAuthStore.getState().token;
    if (!token) {
      setStatus('offline');
      return;
    }
    api
      .get('/preferences/categories')
      .then((res) => setStatus(res.status === 200 ? 'online' : 'offline'))
      .catch((err) => {
        const isOnlineStatus = err.response?.status === 401 || err.response?.status === 403;
        setStatus(isOnlineStatus ? 'online' : 'offline');
      });
  }, []);

  const isChecking = status === 'checking';
  const isOnline = status === 'online';

  return (
    <Card
      className={`h-full flex flex-col items-center justify-center text-center bg-primary border-none shadow-none transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        vis ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-40'
      }`}
    >
      <div className="text-[10px] font-bold tracking-[0.12em] text-white/55 uppercase mb-16">
        System Health
      </div>

      <div className="relative w-72 h-72 mb-16 flex items-center justify-center">
        <div
          className={`absolute w-full h-full rounded-full border-4 box-border transition-colors duration-400 ${
            isChecking
              ? 'border-white/20 border-t-white/80 animate-spin'
              : isOnline
                ? 'border-status-success/30 border-t-status-success animate-spin'
                : 'border-status-error/70 border-t-transparent'
          }`}
        />
        <span
          className={`absolute w-40 h-40 rounded-full transition-all duration-400 ${
            isChecking
              ? 'bg-white/50 shadow-[0_0_0_3px_rgba(255,255,255,0.15)]'
              : isOnline
                ? 'bg-status-success shadow-[0_0_0_4px_rgba(110,220,140,0.2)] animate-[hp-pulse_2s_ease-in-out_infinite]'
                : 'bg-status-error shadow-[0_0_0_4px_rgba(248,113,113,0.25)]'
          }`}
        />
      </div>

      <div className="text-18 font-bold text-white mb-4">
        {isChecking ? 'Checking…' : isOnline ? 'Stable & Online' : 'Service Offline'}
      </div>
      <div className="text-12 text-white/55 mb-20">
        {isChecking
          ? 'Pinging API server…'
          : isOnline
            ? 'All services reporting.'
            : 'Cannot reach the API.'}
      </div>

      <button className="bg-white/15 border-none rounded-md text-white text-[11px] font-bold tracking-[0.08em] px-20 py-8 cursor-pointer uppercase transition-colors hover:bg-white/25">
        Details
      </button>
    </Card>
  );
}
