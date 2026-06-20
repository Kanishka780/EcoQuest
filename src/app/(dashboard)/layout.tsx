'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ProtectedRoute } from '../../components/shared/ProtectedRoute';
import { Navigation } from '../../components/layout/Navigation';
import { SkipToContent } from '../../components/layout/SkipToContent';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  // Focus management on route change: Shift focus to page H1 for accessibility
  useEffect(() => {
    // Add small delay to ensure page rendering completes
    const timer = setTimeout(() => {
      const h1 = document.querySelector('h1');
      if (h1) {
        h1.setAttribute('tabindex', '-1');
        h1.focus();
        // Remove outline styling to avoid visual distraction but keep accessibility
        h1.style.outline = 'none';
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
        {/* Skip navigation link for keyboard screen readers */}
        <SkipToContent />

        {/* Global Navigation Layout */}
        <Navigation />

        {/* Main Content Area */}
        <main 
          id="main-content" 
          className="flex-1 md:pl-64 min-h-screen pb-20 md:pb-6 pt-16 md:pt-6 px-4 md:px-8 max-w-[1600px] w-full mx-auto"
          tabIndex={-1}
        >
          <div className="h-full w-full py-4 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
