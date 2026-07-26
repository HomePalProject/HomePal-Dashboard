import React, { useState } from 'react';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { mutate: login, isPending, isError } = useAuth();

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <div className="hidden md:flex flex-1 bg-primary items-center justify-center p-48 text-text-inverse relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-active rounded-full opacity-50 blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-primary-active rounded-full opacity-50 blur-3xl"></div>

        <div className="z-10 max-w-md">
          <h1 className="text-48 font-bold mb-16">HomePal Admin</h1>
          <p className="text-20 text-primary-container leading-relaxed">
            Manage your smart home ecosystem efficiently. Access analytics, manage users, and
            configure settings from one centralized dashboard.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-24 md:p-48">
        <div className="w-full max-w-sm bg-surface p-32 rounded-xl shadow-sm border border-border transition-all">
          <div className="mb-32 text-center md:text-left">
            <h2 className="text-32 font-bold text-text-primary mb-8">Welcome Back</h2>
            <p className="text-16 text-text-secondary">Please sign in to your admin account.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-24">
            <InputField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@homepal.com"
              required
              fullWidth
            />

            <InputField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              fullWidth
            />

            {isError && (
              <div className="p-12 bg-status-error-container text-status-error rounded-md text-14 font-medium border border-status-error/20">
                Login failed. Please check your credentials and try again.
              </div>
            )}

            <div className="pt-8">
              <Button type="submit" fullWidth isLoading={isPending}>
                Sign In
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
