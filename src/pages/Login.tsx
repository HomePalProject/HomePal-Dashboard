import React, { useState } from 'react';
import { InputField } from '../components/InputField';
import { Button } from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import logoImg from '../assets/logo.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { mutate: login, isPending, isError, error } = useAuth();

  const getErrorMessage = () => {
    if (!error) return 'Login failed. Please try again.';
    // Check if network is offline or axios network error
    if (!navigator.onLine || (error as any)?.code === 'ERR_NETWORK' || !(error as any)?.response) {
      return 'Network Error: Unable to connect to the server. Please check your internet connection.';
    }
    const status = (error as any)?.response?.status;
    if (status === 401 || status === 400) {
      return 'Invalid credentials. Please check your email/username and password.';
    }
    return (
      (error as any)?.response?.data?.message ||
      (error as any)?.response?.data?.title ||
      'Login failed. Please check your credentials and try again.'
    );
  };

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    login({ emailOrUsername: email, password });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Brand Hero Panel (Left Column) */}
      <div className="hidden md:flex flex-1 bg-primary relative overflow-hidden flex-col justify-between p-48 text-text-inverse border-r border-border/10">
        {/* Dynamic ambient glassmorphic background elements */}
        <div className="absolute top-[-15%] left-[-15%] w-[500px] h-[500px] bg-primary-active rounded-full opacity-60 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-15%] right-[-15%] w-[600px] h-[600px] bg-accent/20 rounded-full opacity-40 blur-3xl pointer-events-none"></div>
        <div className="absolute top-[40%] right-[10%] w-[300px] h-[300px] bg-primary-active/40 rounded-full opacity-30 blur-2xl pointer-events-none"></div>

        {/* Top Header Logo */}
        <div className="z-10 flex items-center gap-8">
          <div className="w-52 h-52 rounded-xl bg-surface/90 backdrop-blur-md flex items-center justify-center border border-surface/30 shadow-md p-8 shrink-0">
            <img src={logoImg} alt="HomePal Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-36 font-extrabold tracking-tight text-surface leading-none">
              HomePal
            </span>
            <span className="text-10 font-bold text-primary-container tracking-widest uppercase opacity-90 mt-4">
              Admin Dashboard
            </span>
          </div>
        </div>

        {/* Middle Hero Showcase */}
        <div className="z-10 max-w-lg my-auto py-32">
          <div className="inline-flex items-center gap-8 px-12 py-6 rounded-full bg-surface/10 backdrop-blur-md border border-surface/20 text-13 font-medium text-primary-container mb-24">
            <span className="w-8 h-8 rounded-full bg-accent animate-pulse"></span>
            Smart Home Management Platform
          </div>

          <h1 className="text-48 font-bold leading-tight mb-20 tracking-tight text-surface">
            Control your entire smart ecosystem from one place.
          </h1>

          <p className="text-18 text-primary-container leading-relaxed opacity-95">
            Monitor real-time device analytics, configure automation rules, and manage user access
            with maximum security.
          </p>
        </div>

        {/* Footer info */}
        <div className="z-10 pt-24 border-t border-surface/15 flex items-center justify-between text-13 text-primary-container/80">
          <span>&copy; {new Date().getFullYear()} HomePal Inc.</span>
          <span className="flex items-center gap-8 font-medium">
            <span className="w-8 h-8 rounded-full bg-status-success animate-pulse"></span>
            System Operational
          </span>
        </div>
      </div>

      {/* Original Form Container (Right Column) */}
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
                {getErrorMessage()}
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
