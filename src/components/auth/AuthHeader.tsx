interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="mb-2 motion-safe:animate-[slideUp_0.6s_ease-out_both]">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 md:w-13 md:h-13 rounded-3xl flex items-center justify-center">
          <img
            src="/logo.svg"
            alt="HomePal Logo"
            className="w-full h-full object-contain"
            fetchPriority="high"
          />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-2xl font-bold text-text-primary tracking-tight">HomePal</span>
          <span className="text-xs font-medium text-text-secondary tracking-widest uppercase mt-[2px] hidden md:block">
            Admin Dashboard
          </span>
        </div>
      </div>

      <h2 className="text-typography-h2 text-text-primary mb-1.5">{title}</h2>
      <p className="text-typography-body text-text-secondary">{subtitle}</p>
    </div>
  );
}
