'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { PrivacyModal } from './PrivacyModal';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-6"
        data-testid="auth-skeleton"
      >
        <div className="w-full max-w-md p-6 space-y-4">
          {/* Logo skeleton */}
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse mx-auto"></div>
          {/* Title skeleton */}
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse mx-auto"></div>
          {/* Body card skeleton */}
          <div className="h-48 w-full bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse w-3/4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse w-1/2"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md animate-pulse w-5/6"></div>
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse w-full mt-6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // redirecting
  }

  // Enforce Privacy Policy Consent
  if (user && !user.privacyConsent?.accepted) {
    return <PrivacyModal />;
  }

  return <>{children}</>;
}
