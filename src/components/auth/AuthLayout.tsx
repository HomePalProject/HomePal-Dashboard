import React from 'react';
import { BrandPanel } from './BrandPanel';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface">
      <BrandPanel />

      <div className="flex-1 flex flex-col p-7 sm:p-40 md:p-16 relative">
        <div className="flex-1 flex flex-col justify-center items-center w-full">
          <div className="w-full max-w-sm flex flex-col justify-center">{children}</div>
        </div>

        <div className="hidden md:block w-full text-center mt-8">
          <p className="text-13 text-text-disabled">
            &copy; 2024-{new Date().getFullYear()} HomePal Inc. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
