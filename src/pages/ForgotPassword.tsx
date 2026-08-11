import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';
import { api } from '../services/api';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthHeader } from '../components/auth/AuthHeader';

import { isAxiosError } from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const {
    mutate: requestReset,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: async (email: string) => {
      const response = await api.post('/api/auth/forgot-password', { email });
      return response.data;
    },
    onSuccess: () => {
      setSubmitted(true);
    },
  });

  const getErrorMessage = () => {
    if (!error) return 'Something went wrong. Please try again.';
    if (!navigator.onLine || (isAxiosError(error) && error.code === 'ERR_NETWORK')) {
      return 'Network Error: Unable to connect to the server. Please check your internet connection.';
    }
    if (isAxiosError(error)) {
      return (
        error.response?.data?.message ||
        error.response?.data?.title ||
        'Failed to send reset email. Please try again.'
      );
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'Failed to send reset email. Please try again.';
  };

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    requestReset(email);
  };

  return (
    <AuthLayout>
      {submitted ? (
        <div className="text-center mt-8">
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
          <h2 className="text-typography-h2 text-text-primary mb-2">Check your inbox</h2>
          <p className="text-typography-body text-text-secondary mb-8">
            We've sent a password reset link to{' '}
            <strong className="text-text-primary">{email}</strong>. Check your spam folder if you
            don't see it within a few minutes.
          </p>
          <Link
            to="/login"
            className="text-14 font-medium text-primary hover:text-primary-active transition-colors inline-flex items-center gap-1.5"
          >
            <svg
              className="w-16 h-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Sign In
          </Link>
        </div>
      ) : (
        <>
          <AuthHeader
            title="Forgot password?"
            subtitle="Enter your admin email and we'll send you a link to reset your password."
          />

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <InputField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@homepal.com"
              required
              fullWidth
            />

            {isError && (
              <div className="p-3 bg-status-error-container text-status-error rounded-lg text-14 font-medium border border-status-error/20">
                {getErrorMessage()}
              </div>
            )}

            <div className="pt-2">
              <Button type="submit" fullWidth isLoading={isPending}>
                Send Reset Link
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-14 font-medium text-text-secondary hover:text-primary transition-colors inline-flex items-center gap-1.5"
            >
              <svg
                className="w-16 h-16"
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
              Back to Sign In
            </Link>
          </div>
        </>
      )}
    </AuthLayout>
  );
}
