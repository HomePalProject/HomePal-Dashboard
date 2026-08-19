import React from 'react';
import { BrandPanel } from './BrandPanel';
import { Button } from '@components/ui/Button';
import { useTranslation } from 'react-i18next';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t, i18n } = useTranslation('auth');

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface">
      <BrandPanel />

      <div className="flex-1 flex flex-col p-7 sm:p-10 md:p-4 relative">
        <div className="absolute top-5 inset-e-5 z-50">
          <Button
            onClick={() => i18n.changeLanguage(i18n.resolvedLanguage === 'en' ? 'ar' : 'en')}
            variant="outline"
            className="rounded-full py-1.5 px-3 min-h-0 h-auto bg-surface hover:bg-surface-variant border-border text-xs font-semibold text-text-primary shadow-xs"
          >
            {i18n.resolvedLanguage === 'en' ? 'العربية' : 'EN'}
          </Button>
        </div>

        <div className="flex-1 flex flex-col justify-center items-center w-full">
          <div className="w-full max-w-sm flex flex-col justify-center">{children}</div>
        </div>

        <div className="hidden md:block w-full text-center mt-2">
          <p className="text-[13px] text-text-disabled">
            {t('copyright', { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </div>
  );
}
