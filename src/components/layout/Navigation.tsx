'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { logoutUser } from '../../services/firebase/auth';
import { useUserStore } from '../../stores/useUserStore';
import { useFootprintStore } from '../../stores/useFootprintStore';
import { 
  Leaf, LayoutDashboard, Calculator, Flame, Sliders, Map, 
  MapPin, CheckSquare, Trophy, MessageSquare, LogOut, Sparkles
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isMock } = useAuth();
  const setUser = useUserStore(state => state.setUser);

  const handleLogout = async () => {
    try {
      await logoutUser();
      if (isMock) {
        localStorage.removeItem('eq_user');
        localStorage.removeItem('eq_habits');
        localStorage.removeItem('eq_challenges');
        localStorage.removeItem('eq_footprints_mock-user-123'); // Clear mock footprints from storage
        setUser(null);
        // Clear footprint store
        useFootprintStore.setState({ records: [], activeRecord: null });
      } else {
        setUser(null);
        useFootprintStore.setState({ records: [], activeRecord: null });
      }
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Calculator', path: '/calculator', icon: Calculator },
    { name: 'Hotspots', path: '/hotspots', icon: Flame },
    { name: 'Simulator', path: '/simulator', icon: Sliders },
    { name: 'Eco POIs', path: '/maps', icon: MapPin },
    { name: 'AI Coach', path: '/coach', icon: MessageSquare },
    { name: 'Visualizer', path: '/visualizer', icon: Sparkles },
    { name: 'Habits', path: '/habits', icon: CheckSquare },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Roadmap', path: '/roadmap', icon: Map },
    { name: 'About', path: '/about', icon: Leaf },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-400 h-screen fixed top-0 left-0 z-30"
        aria-label="Sidebar navigation"
      >
        {/* Brand */}
        <div className="p-6 flex items-center space-x-2.5 border-b border-slate-800/80">
          <Leaf className="h-6 w-6 text-emerald-400 animate-float" />
          <span className="text-xl font-bold text-white tracking-tight">
            Eco<span className="text-emerald-400">Quest</span>
          </span>
        </div>

        {/* User Card */}
        {user && (
          <div className="p-4 mx-4 my-4 bg-slate-950/40 border border-slate-800/60 rounded-xl flex items-center space-x-3">
            <div className="h-9 w-9 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/20 uppercase text-sm">
              {user.displayName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{user.displayName}</p>
              <p className="text-[10px] text-emerald-400 font-medium">Level {user.sustainability?.level || 1} Planner</p>
            </div>
          </div>
        )}

        {/* Navigation List */}
        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto" role="list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                  isActive 
                    ? 'bg-emerald-600/10 border border-emerald-500/20 text-emerald-400' 
                    : 'hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Utilities */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs text-slate-500 font-medium">Theme Mode</span>
            <ThemeToggle />
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors focus:outline-none focus:ring-1 focus:ring-red-500"
            aria-label="Sign out of account"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 fixed top-0 left-0 right-0 z-30">
        <div className="flex items-center space-x-2">
          <Leaf className="h-5 w-5 text-emerald-400" />
          <span className="text-md font-bold text-white tracking-tight">EcoQuest</span>
        </div>
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg focus:outline-none"
            aria-label="Sign out"
          >
            <LogOut className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav 
        className="md:hidden flex justify-around items-center bg-slate-900 border-t border-slate-800 fixed bottom-0 left-0 right-0 h-16 px-2 z-30"
        aria-label="Bottom mobile navigation"
      >
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center justify-center w-12 py-1 rounded-xl text-[10px] font-medium transition-all ${
                isActive ? 'text-emerald-400' : 'text-slate-500'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-4.5 w-4.5 mb-1 shrink-0" />
              <span className="truncate max-w-full">{item.name.split(' ')[0]}</span>
            </Link>
          );
        })}
        {/* Toggle remaining links trigger */}
        <Link
          href="/coach"
          className={`flex flex-col items-center justify-center w-12 py-1 rounded-xl text-[10px] font-medium transition-all ${
            pathname === '/coach' || pathname === '/habits' || pathname === '/leaderboard' || pathname === '/roadmap'
              ? 'text-emerald-400' 
              : 'text-slate-500'
          }`}
        >
          <MessageSquare className="h-4.5 w-4.5 mb-1 shrink-0" />
          <span>More</span>
        </Link>
      </nav>
    </>
  );
}
