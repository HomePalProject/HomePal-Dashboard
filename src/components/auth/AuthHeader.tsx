import { useTranslation } from 'react-i18next';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  const { t } = useTranslation('common');

  return (
    <div className="mb-2 motion-safe:animate-[slideUp_0.6s_ease-out_both]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-7 h-7 md:w-9 md:h-9 rounded-3xl flex items-center justify-center">
          <img
            src="/logo.svg"
            alt="HomePal Logo"
            className="w-full h-full object-contain"
            fetchPriority="high"
          />
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-2xl font-bold text-text-primary tracking-tight">
            {t('homepal')}
          </span>
          <span className="text-xs font-medium text-text-secondary tracking-widest uppercase mt-0.5 hidden md:block">
            {t('executivePanel')}
          </span>
        </div>
      </div>

      <h2 className="text-typography-h2 text-text-primary mb-1.5">{title}</h2>
      <p className="text-typography-body text-text-secondary">{subtitle}</p>
    </div>
  );
}
