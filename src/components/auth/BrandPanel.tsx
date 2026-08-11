import bgImg from '@assets/login-bg.webp';
import { MockDashboardCard } from './MockDashboardCard';

export function BrandPanel() {
  return (
    <div className="hidden md:flex w-[55%] bg-primary relative overflow-hidden flex-col justify-between p-12 px-40 md:px-12 text-text-inverse">
      <img
        src={bgImg}
        alt="Background texture"
        className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-multiply pointer-events-none"
        fetchPriority="high"
      />

      <div className="z-10 h-10"></div>

      <div className="z-10 max-w-xl mx-auto text-left flex flex-col items-start">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface/10 border border-surface/20 text-[13px] font-medium text-surface/80 mb-6">
          <span className="w-2 h-2 rounded-full bg-accent shrink-0"></span>
          Household Management, Simplified
        </div>

        <h1 className="text-48 font-bold leading-tight mb-5 tracking-tight text-surface">
          Manage every household, effortlessly.
        </h1>

        <p className="text-18 text-surface/70 leading-relaxed">
          Track inventory, plan meals, and manage household members and budgets from a single admin
          dashboard.
        </p>

        <MockDashboardCard />
      </div>

      <div className="z-10 flex items-center justify-between text-[13px] text-surface/50 w-full max-w-xl mx-auto">
        <span>&copy; {new Date().getFullYear()} HomePal Inc.</span>
        <span className="flex items-center gap-2 font-medium">
          <span className="w-2 h-2 rounded-full bg-status-success"></span>
          System Operational
        </span>
      </div>
    </div>
  );
}
