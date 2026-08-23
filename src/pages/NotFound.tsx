import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { t } = useTranslation('common');

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center overflow-hidden">
      <div className="max-w-xl w-full flex flex-col items-center motion-safe:animate-[slideUp_0.6s_ease-out_both]">
        {/* Signature Graphic: Abstract Door / Keyhole */}
        <div className="relative w-28 h-36 mb-12 group">
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 transition-colors duration-700 group-hover:bg-primary/30" />

          {/* SVG Door */}
          <svg
            viewBox="0 0 100 120"
            className="w-full h-full relative z-10 text-primary"
            fill="currentColor"
          >
            <path
              d="M50 2 C23.5 2 2 23.5 2 50 L2 118 L98 118 L98 50 C98 23.5 76.5 2 50 2 Z"
              fill="var(--sys-surface)"
              stroke="currentColor"
              strokeWidth="4"
            />
            {/* Keyhole */}
            <circle cx="50" cy="55" r="7" fill="currentColor" />
            <path d="M45 60 L55 60 L58 80 L42 80 Z" fill="currentColor" />
          </svg>
        </div>

        {/* Semantic Typography */}
        <div className="relative">
          <h1 className="absolute -top-16 left-1/2 -translate-x-1/2 text-[140px] leading-none font-extrabold text-text-primary tracking-tighter opacity-5 select-none pointer-events-none">
            404
          </h1>
          <h2 className="text-typography-h2 text-text-primary mb-4 relative z-10">
            {t('pageNotFound')}
          </h2>
        </div>

        <p className="text-typography-bodylarge text-text-secondary mb-10 max-w-md relative z-10">
          {t('pageNotFoundDesc')}
        </p>

        <Link
          to="/login"
          className="relative z-10 inline-flex items-center justify-center h-12 px-8 rounded-full text-typography-label bg-primary text-text-inverse hover:bg-primary-active transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          {t('returnToLogin')}
        </Link>
      </div>
    </div>
  );
}
