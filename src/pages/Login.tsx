import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { InputField } from '@components/ui/InputField';
import { Button } from '@components/ui/Button';
import { useAuth } from '@hooks/useAuth';
import { AuthLayout } from '@components/auth/AuthLayout';
import { AuthHeader } from '@components/auth/AuthHeader';

import { isAxiosError } from 'axios';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, isPending, isError, error } = useAuth();

  const getErrorMessage = () => {
    if (!error) return 'Login failed. Please try again.';
    if (!navigator.onLine || (isAxiosError(error) && error.code === 'ERR_NETWORK')) {
      return 'Network Error: Unable to connect to the server. Please check your internet connection.';
    }
    if (isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 401 || status === 400) {
        return 'Invalid credentials. Please check your email/username and password.';
      }
      return (
        error.response?.data?.message ||
        error.response?.data?.title ||
        'Login failed. Please check your credentials and try again.'
      );
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'Login failed. Please check your credentials and try again.';
  };

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    login({ emailOrUsername: identifier, password });
  };

  return (
    <AuthLayout>
      <AuthHeader title="Hi, Welcome Back!" subtitle="Sign in to your admin account." />

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 motion-safe:animate-[slideUp_0.6s_ease-out_80ms_both]"
      >
        <InputField
          label="Email or Username"
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="admin@homepal.com or admin123"
          required
          fullWidth
        />

        <div className="flex flex-col gap-1.5">
          <InputField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            fullWidth
            rightElement={
              <Button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                variant="ghost"
                size="icon"
                className="text-text-secondary hover:text-text-primary transition-colors h-auto w-auto min-h-0 p-0"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a19.83 19.83 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a19.79 19.79 0 0 1-4.22 5.9" />
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </Button>
            }
          />
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-[13px] font-medium text-primary hover:text-primary-active transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {isError && (
          <div className="p-3 bg-status-error-container text-status-error rounded-3xl text-sm font-medium border border-status-error/20">
            {getErrorMessage()}
          </div>
        )}

        <div className="pt-[8px]">
          <Button type="submit" fullWidth isLoading={isPending}>
            Sign In
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
