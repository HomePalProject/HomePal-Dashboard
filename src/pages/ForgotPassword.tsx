import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { InputField } from '@components/ui/InputField';
import { Button } from '@components/ui/Button';
import { api } from '@services/api';
import { AuthLayout } from '@components/auth/AuthLayout';
import { AuthHeader } from '@components/auth/AuthHeader';
import { getErrorMessage } from '@lib/utils';
import { useTranslation } from 'react-i18next';

export default function ForgotPassword() {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const {
    mutate: requestReset,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: async (email: string) => {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    },
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    requestReset(email);
  };

  return (
    <AuthLayout>
      {submitted ? (
        <div className="text-center mt-2">
          <div className="w-14 h-14 rounded-full bg-status-success-container flex items-center justify-center mx-auto mb-5">
            <svg
              className="w-7 h-7 text-status-success"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-typography-h2 text-text-primary mb-2">{t('checkInbox')}</h2>
          <p className="text-typography-body text-text-secondary mb-2">
            {t('resetSentDesc1')} <strong className="text-text-primary">{email}</strong>.{' '}
            {t('resetSentDesc2')}
          </p>
          <Link
            to="/login"
            className="text-sm font-medium text-primary hover:text-primary-active transition-colors inline-flex items-center gap-1.5"
          >
            <svg
              className="w-4 h-4 rtl:rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('backToSignIn')}
          </Link>
        </div>
      ) : (
        <>
          <AuthHeader title={t('forgotPasswordTitle')} subtitle={t('forgotPasswordSubtitle')} />

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-6">
            <InputField
              label={t('emailAddress')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('emailAddressPlaceholder')}
              required
              fullWidth
            />

            {isError && (
              <div className="p-3 bg-status-error-container text-status-error rounded-3xl text-sm font-medium border border-status-error/20">
                {getErrorMessage(error, t('failedSendReset'))}
              </div>
            )}

            <div className="pt-2">
              <Button type="submit" fullWidth isLoading={isPending}>
                {t('sendResetLink')}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-sm font-medium text-text-secondary hover:text-primary transition-colors inline-flex items-center gap-1.5"
            >
              <svg
                className="w-4 h-4 rtl:rotate-180"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              {t('backToSignIn')}
            </Link>
          </div>
        </>
      )}
    </AuthLayout>
  );
}
