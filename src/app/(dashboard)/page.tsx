'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUserStore } from '../../stores/useUserStore';
import { useFootprintStore } from '../../stores/useFootprintStore';
import { 
  Leaf, Trophy, Flame, ArrowRight, 
  Download, Calendar, Sparkles, CheckCircle2 
} from 'lucide-react';

export default function DashboardHome() {
  const user = useUserStore(state => state.user);
  const activeRecord = useFootprintStore(state => state.activeRecord);
  const challengeProgress = useUserStore(state => state.challengeProgress);
  const habits = useUserStore(state => state.habits);

  const [carbonBudgetRemaining, setCarbonBudgetRemaining] = useState<number>(0);
  const [downloading, setDownloading] = useState(false);

  // Carbon Countdown Budget (Target: 1500kg per year, countdown calculated in real-time)
  useEffect(() => {
    // 2030 Target Countdown
    const targetDate = new Date('2030-01-01T00:00:00Z').getTime();
    
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = targetDate - now;
      
      if (diff <= 0) {
        setCarbonBudgetRemaining(0);
        clearInterval(interval);
        return;
      }
      
      // Calculate remaining budget in kg based on a budget rate (e.g. 1500kg target per capita per year)
      // Remaining years = diff / (365 * 24 * 60 * 60 * 1000)
      const remainingYears = diff / (365 * 24 * 60 * 60 * 1000);
      
      // Personalized countdown: budget rate is 1500kg target. We display remaining kg they are allowed to emit to hit target.
      const budgetRate = 1500 * remainingYears;
      setCarbonBudgetRemaining(parseFloat(budgetRate.toFixed(6)));
    }, 1000);

    return () => clearInterval(interval);
  }, [activeRecord]);

  const activeChallenges = Object.values(challengeProgress).filter(c => c.status === 'active');
  const loggedHabitsCount = Object.keys(habits).length;
  
  // Calculate average daily savings
  const totalSavings = Object.values(habits).reduce((sum, h) => sum + h.carbonSaved, 0);
  
  const handleExport = () => {
    setDownloading(true);
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
        userProfile: user,
        footprint: activeRecord,
        habits: habits,
        challenges: challengeProgress
      }, null, 2));
      
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `ecoquest_report_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setDownloading(false), 1000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center space-x-2">
            <span>Welcome back, {user?.displayName || 'Eco Commuter'}!</span>
            <Sparkles className="h-5 w-5 text-emerald-500 animate-float" />
          </h1>
          <p className="text-sm text-zinc-500">
            Monitor your carbon tracker metrics, streaks, and active reduction roadmap.
          </p>
        </div>

        <button
          onClick={handleExport}
          disabled={downloading}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs transition-colors focus:outline-none shadow-md shadow-emerald-950/20"
        >
          <Download className="h-4 w-4" />
          <span>{downloading ? 'Exporting...' : 'Export Sustainability Report'}</span>
        </button>
      </div>

      {/* Carbon Budget Countdown Card */}
      <div className="glass-card bg-slate-950/40 border-slate-800 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">2030 Safety Target Countdown</span>
          <h2 className="text-xl font-bold text-white leading-tight">Your Share of 2030 Carbon Budget Remaining</h2>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            The IPCC climate safety model targets a maximum limit of 1.5 tons (1,500 kg) CO₂ per capita annually by 2030. This live countdown represents your remaining allowed emissions.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl text-center min-w-[240px]">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Remaining kg CO₂</span>
          <div className="text-3xl font-extrabold text-white mt-1 tabular-nums font-mono">
            {carbonBudgetRemaining > 0 ? carbonBudgetRemaining.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 }) : 'Calculating...'}
          </div>
          <span className="text-[9px] text-emerald-450 font-semibold block mt-1.5">Target Cap: 1.5 Tons/Year</span>
        </div>
      </div>

      {/* Grid Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Scorecard */}
        <div className="glass-card bg-white dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-800 p-6 flex items-start space-x-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20">
            <Trophy className="h-5.5 w-5.5" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Plan Level</span>
            <div className="text-lg font-extrabold text-zinc-850 dark:text-zinc-150">
              Level {user?.sustainability?.level || 1} Planner
            </div>
            <p className="text-[11px] text-zinc-450 tabular-nums">
              Total Points: {user?.sustainability?.totalPoints || 0} pts
            </p>
          </div>
        </div>

        {/* Card 2: Habit Streak */}
        <div className="glass-card bg-white dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-800 p-6 flex items-start space-x-4">
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20">
            <Flame className="h-5.5 w-5.5" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Log Streak</span>
            <div className="text-lg font-extrabold text-zinc-850 dark:text-zinc-150">
              {user?.sustainability?.streak || 0} consecutive days
            </div>
            <p className="text-[11px] text-zinc-450">
              Last Log: {user?.sustainability?.lastHabitLog || 'No habits logged today'}
            </p>
          </div>
        </div>

        {/* Card 3: Footprint Status */}
        <div className="glass-card bg-white dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-800 p-6 flex items-start space-x-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl border border-blue-500/20">
            <Leaf className="h-5.5 w-5.5" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Carbon Footprint</span>
            <div className="text-lg font-extrabold text-zinc-850 dark:text-zinc-150">
              {activeRecord ? `${activeRecord.results.annual.toLocaleString()} kg/yr` : 'Pending calculation'}
            </div>
            <p className="text-[11px] text-zinc-450">
              Percentile: {activeRecord ? `${activeRecord.results.percentileRank}th percentile` : 'Calculate now'}
            </p>
          </div>
        </div>

      </div>

      {/* Features summary blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Active Challenges Progress */}
        <div className="glass-card bg-white dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-800 p-6 md:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 flex items-center space-x-2">
              <Trophy className="h-4.5 w-4.5 text-amber-500" />
              <span>Active Challenges</span>
            </h3>
            <Link href="/roadmap" className="text-xs text-emerald-500 hover:underline inline-flex items-center space-x-1 font-semibold">
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3.5 pt-2">
            {activeChallenges.length > 0 ? (
              activeChallenges.map((ch) => (
                <div key={ch.challengeId} className="p-3.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
                  <div className="flex justify-between items-start text-xs">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">
                      {ch.challengeId === 'ch-transit' ? 'Commute Champion' : ch.challengeId}
                    </span>
                    <span className="text-[10px] text-emerald-500 font-bold">{ch.daysCompleted}/5 Days Logged</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all" 
                      style={{ width: `${(ch.daysCompleted / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/60 rounded-2xl text-center text-xs text-zinc-550 space-y-2 py-8">
                <p>You have no active challenge enrollment.</p>
                <Link href="/roadmap" className="text-emerald-500 hover:underline font-bold text-xs inline-flex items-center space-x-0.5">
                  <span>Join an Eco Challenge</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right: Habit Tracker Summary */}
        <div className="glass-card bg-white dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-800 p-6 md:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 flex items-center space-x-2">
              <Calendar className="h-4.5 w-4.5 text-emerald-500" />
              <span>Habit Tracking Logs</span>
            </h3>
            <Link href="/habits" className="text-xs text-emerald-500 hover:underline inline-flex items-center space-x-1 font-semibold">
              <span>Log Habits</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3.5 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-center">
                <span className="text-[10px] text-zinc-450 uppercase font-semibold">Days Tracked</span>
                <div className="text-2xl font-extrabold text-zinc-850 dark:text-zinc-150 mt-1 tabular-nums">
                  {loggedHabitsCount}
                </div>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-center">
                <span className="text-[10px] text-zinc-450 uppercase font-semibold">Total Carbon Saved</span>
                <div className="text-2xl font-extrabold text-emerald-500 mt-1 tabular-nums">
                  {totalSavings.toFixed(1)} <span className="text-xs font-semibold">kg</span>
                </div>
              </div>
            </div>

            {loggedHabitsCount > 0 && (
              <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Your tracked habits are reducing carbon footprints in real-time. Keep it up!</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
