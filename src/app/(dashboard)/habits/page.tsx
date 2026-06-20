'use client';

import React, { useState, useEffect } from 'react';
import { useUserStore } from '../../../stores/useUserStore';
import { CheckSquare, Flame, Trophy, Bike, Bus, Utensils, Box, Save } from 'lucide-react';

export default function HabitsPage() {
  const user = useUserStore(state => state.user);
  const habits = useUserStore(state => state.habits);
  const logHabit = useUserStore(state => state.logHabit);

  const todayStr = new Date().toISOString().split('T')[0];
  
  // Local habit state
  const [bikeKm, setBikeKm] = useState(0);
  const [publicTransportTrips, setPublicTransportTrips] = useState(0);
  const [vegetarianMeals, setVegetarianMeals] = useState(0);
  const [plasticFreeDays, setPlasticFreeDays] = useState(0);
  
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  // Load today's log if it already exists
  useEffect(() => {
    const todayLog = habits[todayStr];
    if (todayLog) {
      const timer = setTimeout(() => {
        setBikeKm(todayLog.bikeKm);
        setPublicTransportTrips(todayLog.publicTransportTrips);
        setVegetarianMeals(todayLog.vegetarianMeals);
        setPlasticFreeDays(todayLog.plasticFreeDays);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [habits, todayStr]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMsg('');
    try {
      await logHabit(todayStr, {
        bikeKm,
        publicTransportTrips,
        vegetarianMeals,
        plasticFreeDays
      });
      setMsg("Today's habits logged successfully! Carbon footprint reduced and points awarded.");
      
      // Auto-hide message
      setTimeout(() => setMsg(''), 5000);
    } catch (err) {
      console.error(err);
      setMsg("Failed to save habit details.");
    } finally {
      setLoading(false);
    }
  };

  // Estimate today's savings
  const estSavings = bikeKm * 0.192 + publicTransportTrips * 1.2 + vegetarianMeals * 0.65 + plasticFreeDays * 0.2;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center space-x-2">
          <CheckSquare className="h-6 w-6 text-emerald-500" />
          <span>Daily Habit Tracker</span>
        </h1>
        <p className="text-sm text-zinc-500">
          Log your daily eco-friendly activities to earn sustainability points, increase your level, and extend your habit streak.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Habit Logging Form */}
        <div className="lg:col-span-2 glass-card bg-white dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-800 p-6 md:p-8 space-y-6">
          <h2 className="text-md font-bold text-zinc-800 dark:text-zinc-100">
            Log Activities for Today ({todayStr})
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Bike / Walk */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3 flex flex-col justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                    <Bike className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Active Commuting</h3>
                    <p className="text-[10px] text-zinc-400">Walking or biking instead of driving</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <label htmlFor="bike" className="sr-only">Bike or Walk distance in kilometers</label>
                  <input
                    id="bike"
                    type="number"
                    min="0"
                    value={bikeKm || ''}
                    onChange={(e) => setBikeKm(parseFloat(e.target.value) || 0)}
                    className="block w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:outline-none"
                    placeholder="Kilometers walked / biked"
                  />
                </div>
              </div>

              {/* Public Transport */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3 flex flex-col justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                    <Bus className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Public Transit</h3>
                    <p className="text-[10px] text-zinc-400">Bus, rail, Metro, or carpools</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <label htmlFor="bus" className="sr-only">Public transport trips taken</label>
                  <input
                    id="bus"
                    type="number"
                    min="0"
                    value={publicTransportTrips || ''}
                    onChange={(e) => setPublicTransportTrips(parseInt(e.target.value) || 0)}
                    className="block w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:outline-none"
                    placeholder="Number of trips taken"
                  />
                </div>
              </div>

              {/* Vegetarian Meals */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3 flex flex-col justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                    <Utensils className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Vegetarian/Vegan Meals</h3>
                    <p className="text-[10px] text-zinc-400">Plant-based breakfasts, lunches, dinners</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <label htmlFor="veg" className="sr-only">Vegetarian or vegan meals eaten</label>
                  <input
                    id="veg"
                    type="number"
                    min="0"
                    max="3"
                    value={vegetarianMeals || ''}
                    onChange={(e) => setVegetarianMeals(parseInt(e.target.value) || 0)}
                    className="block w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:outline-none"
                    placeholder="Meals eaten today"
                  />
                </div>
              </div>

              {/* Plastic Free Day */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3 flex flex-col justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                    <Box className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Plastic-Free Day</h3>
                    <p className="text-[10px] text-zinc-400">Avoided single-use shopping bags/containers</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 py-1.5">
                  <input
                    id="plastic"
                    type="checkbox"
                    checked={plasticFreeDays > 0}
                    onChange={(e) => setPlasticFreeDays(e.target.checked ? 1 : 0)}
                    className="h-4.5 w-4.5 text-emerald-600 border-zinc-300 rounded focus:ring-emerald-500 focus:outline-none"
                  />
                  <label htmlFor="plastic" className="text-xs text-zinc-600 dark:text-zinc-300 font-semibold select-none">Yes, avoided single-use plastic</label>
                </div>
              </div>

            </div>

            {/* Submit */}
            <div className="flex items-center justify-between border-t border-zinc-150 dark:border-zinc-850 pt-6">
              <div className="text-xs text-zinc-500">
                Estimated savings today: <strong className="text-emerald-500">{estSavings.toFixed(2)} kg CO₂</strong>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs transition-colors focus:outline-none shadow-md shadow-emerald-950/20"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Logging...' : 'Log Habits'}</span>
              </button>
            </div>

            {msg && (
              <p className="text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                {msg}
              </p>
            )}
          </form>
        </div>

        {/* Right Side: Score card and Streaks */}
        <div className="space-y-6">
          {/* Streak details */}
          <div className="glass-card bg-zinc-950/40 border-slate-800 p-6 text-center space-y-4">
            <div className="inline-flex p-3 bg-rose-500/10 text-rose-500 rounded-full border border-rose-500/20 animate-float">
              <Flame className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Log Streak</h3>
              <div className="text-4xl font-extrabold text-white mt-1 tabular-nums">
                {user?.sustainability?.streak || 0}
                <span className="text-sm font-semibold text-rose-500 ml-1.5">days</span>
              </div>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Log habits daily to extend your streak. Streaks award bonus multiplier points towards your rank level.
              </p>
            </div>
          </div>

          {/* Point/Level Ledger */}
          <div className="glass-card bg-emerald-950/20 dark:bg-emerald-950/10 border-emerald-500/20 p-6 space-y-4">
            <h3 className="text-xs font-bold text-slate-350 uppercase tracking-wider flex items-center space-x-1.5">
              <Trophy className="h-4 w-4 text-amber-500" />
              <span>Sustainablity Ledger</span>
            </h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-400 border-b border-emerald-500/10 pb-2">
                <span>Account Level:</span>
                <span className="font-bold text-white">Level {user?.sustainability?.level || 1} Planner</span>
              </div>
              <div className="flex justify-between text-slate-400 border-b border-emerald-500/10 pb-2">
                <span>Total Points:</span>
                <span className="font-bold text-white tabular-nums">{user?.sustainability?.totalPoints || 0} pts</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Next level in:</span>
                <span className="font-bold text-emerald-450 tabular-nums">
                  {200 - ((user?.sustainability?.totalPoints || 0) % 200)} pts
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
