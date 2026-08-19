import bgImg from '@assets/login-bg.webp';
import { PantryShelfCard } from './PantryShelfCard';
import { useTranslation } from 'react-i18next';

export function BrandPanel() {
  const { t } = useTranslation('auth');

  return (
    <div className="hidden md:flex w-[55%] bg-primary relative overflow-hidden flex-col justify-between p-3 px-10 md:px-3 text-text-inverse">
      <img
        src={bgImg}
        alt="Background texture"
        className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blinset-e-multiply pointer-events-none"
        fetchPriority="high"
      />

      <div className="z-10 h-10"></div>

      <div className="z-10 max-w-xl mx-auto text-start flex flex-col items-start">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface/10 border border-surface/20 text-[13px] font-medium text-surface/80 mb-6 motion-safe:animate-[slideUp_0.6s_ease-out_both]">
          <span className="w-2 h-2 rounded-full bg-accent shrink-0"></span>
          {t('brandBadge')}
        </div>

        <h1 className="text-5xl font-bold leading-tight mb-5 tracking-tight text-surface motion-safe:animate-[slideUp_0.6s_ease-out_80ms_both]">
          {t('brandTitle')}
        </h1>

        <p className="text-lg text-surface/70 leading-relaxed motion-safe:animate-[slideUp_0.6s_ease-out_160ms_both]">
          {t('brandSubtitle')}
        </p>

        <PantryShelfCard />
      </div>

      <div className="z-10 flex items-center justify-between text-[13px] text-surface/50 w-full max-w-xl mx-auto">
        <span>{t('brandFooter', { year: new Date().getFullYear() })}</span>
      </div>
    </div>
  );
}
