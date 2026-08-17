interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="mb-8 motion-safe:animate-[slideUp_0.6s_ease-out_both]">
      <div className="flex items-center gap-12 mb-24">
        <div className="w-40 h-40 md:w-52 md:h-52 rounded-lg flex items-center justify-center">
          <img
            src="/logo.svg"
            alt="HomePal Logo"
            className="w-full h-full object-contain"
            fetchPriority="high"
          />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-24 font-bold text-text-primary tracking-tight">HomePal</span>
          <span className="text-12 font-medium text-text-secondary tracking-widest uppercase mt-[2px] hidden md:block">
            Admin Dashboard
          </span>
        </div>
      </div>

      <h2 className="text-typography-h2 text-text-primary mb-1.5">{title}</h2>
      <p className="text-typography-body text-text-secondary">{subtitle}</p>
    </div>
  );
}
