'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../hooks/useAuth';
import { registerUser } from '../../../services/firebase/auth';
import { Leaf, UserPlus, Lock, Mail, User, MapPin, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { ThemeToggle } from '../../../components/layout/ThemeToggle';

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading, isMock } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('India');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !displayName || !city || !country) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await registerUser(email, password, displayName, city, country);
      if (isMock) {
        // Mock mode registers instantly and signs in
        router.push('/');
      } else {
        // Real mode triggers verification email
        setSuccess(true);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Registration failed.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen relative flex flex-col items-center justify-center p-4 bg-slate-900 overflow-hidden font-sans">
        <div className="animate-pulse space-y-4 text-center z-10">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400 mb-2">
            <Leaf className="h-8 w-8 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <h2 className="text-xl font-bold text-white">Loading EcoQuest...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 bg-slate-900 overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-500/10 blur-[120px] pointer-events-none animate-pulse-slow"></div>
      
      {/* Header Utilities */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400 mb-2 animate-float">
            <Leaf className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Eco<span className="text-emerald-400">Quest</span>
          </h1>
          <p className="text-sm text-slate-400">
            Join the journey towards sustainability
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card bg-slate-950/40 border-slate-800 p-8 shadow-2xl relative">
          
          {success ? (
            <div className="text-center space-y-4 py-4 animate-fade-in">
              <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 mb-2">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h2 className="text-xl font-bold text-white">Account Created!</h2>
              <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
                We sent a verification link to <strong className="text-slate-200">{email}</strong>. Please check your inbox and verify your email to log in.
              </p>
              <div className="pt-4">
                <Link href="/login" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors focus:outline-none">
                  Back to Login
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-5 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-start space-x-2.5 text-xs" role="alert">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Full Name */}
                <div className="space-y-1">
                  <label htmlFor="name" className="text-xs font-semibold text-slate-300">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                      <User className="h-4.5 w-4.5" />
                    </span>
                    <input
                      id="name"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2 bg-slate-900/60 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="Jane Doe"
                      required
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                  <label htmlFor="email" className="text-xs font-semibold text-slate-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                      <Mail className="h-4.5 w-4.5" />
                    </span>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2 bg-slate-900/60 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <label htmlFor="password" className="text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                      <Lock className="h-4.5 w-4.5" />
                    </span>
                    <input
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-4 py-2 bg-slate-900/60 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                {/* Location Fields (City and Country) */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="city" className="text-xs font-semibold text-slate-300">
                      City
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <input
                        id="city"
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="block w-full pl-9 pr-3 py-2 bg-slate-900/60 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        placeholder="Mumbai"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="country" className="text-xs font-semibold text-slate-300">
                      Country
                    </label>
                    <input
                      id="country"
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="block w-full px-3 py-2 bg-slate-900/60 border border-slate-800 focus:border-emerald-500 rounded-xl text-sm text-slate-100 placeholder-slate-500 transition-all focus:outline-none"
                      placeholder="India"
                      required
                    />
                  </div>
                </div>

                {/* Register Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-55 mt-4"
                >
                  <span>{loading ? 'Creating account...' : 'Create Account'}</span>
                  {!loading && <UserPlus className="h-4 w-4" />}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-500">
          <Link href="/login" className="font-semibold text-slate-400 hover:text-white inline-flex items-center space-x-1.5 focus:outline-none">
            <ArrowLeft className="h-3 w-3" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
