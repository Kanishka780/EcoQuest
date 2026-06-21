'use client';

import React, { useState } from 'react';
import { useUserStore } from '../../../stores/useUserStore';
import { Map, Trophy, Compass, ShieldCheck, Star } from 'lucide-react';

interface PredefinedChallenge {
  id: string;
  title: string;
  description: string;
  category: 'transport' | 'energy' | 'food' | 'shopping';
  difficulty: 'easy' | 'medium' | 'hard';
  co2SavedEstimate: number; // kg
  points: number;
  badgeId: string;
}

const PREDEFINED_CHALLENGES: PredefinedChallenge[] = [
  {
    id: 'ch-transit',
    title: 'Commute Champion',
    description: 'Use public transit, walk, or bike for all your travel trips for 5 consecutive days.',
    category: 'transport',
    difficulty: 'medium',
    co2SavedEstimate: 35,
    points: 100,
    badgeId: 'badge-transit'
  },
  {
    id: 'ch-veg',
    title: 'Herbivore Habit',
    description: 'Consume only vegetarian or vegan meals for 7 consecutive days.',
    category: 'food',
    difficulty: 'hard',
    co2SavedEstimate: 45,
    points: 150,
    badgeId: 'badge-veg'
  },
  {
    id: 'ch-unplug',
    title: 'Vampire Power Slayer',
    description: 'Unplug all unused chargers, standby appliances, and electronics before sleeping for 7 days.',
    category: 'energy',
    difficulty: 'easy',
    co2SavedEstimate: 12,
    points: 50,
    badgeId: 'badge-unplug'
  },
  {
    id: 'ch-delivery',
    title: 'Local First',
    description: 'Avoid online shopping deliveries for 14 days; buy groceries and goods locally instead.',
    category: 'shopping',
    difficulty: 'medium',
    co2SavedEstimate: 15,
    points: 80,
    badgeId: 'badge-shopping'
  }
];

export default function RoadmapPage() {
  const user = useUserStore(state => state.user);
  const challengeProgress = useUserStore(state => state.challengeProgress);
  const enroll = useUserStore(state => state.enrollInChallenge);
  const updateProgress = useUserStore(state => state.updateChallengeProgress);

  const [loadingChallenge, setLoadingChallenge] = useState<string | null>(null);

  // Week-by-week roadmap actions
  const [weeklyActions, setWeeklyActions] = useState([
    { id: 'w1-1', week: 1, label: 'Swap 2 driving trips to bus or rail travel', checked: false, points: 20 },
    { id: 'w1-2', week: 1, label: 'Unplug devices when fully charged', checked: true, points: 10 },
    { id: 'w2-1', week: 2, label: 'Establish 2 full vegetarian meal days', checked: false, points: 30 },
    { id: 'w2-2', week: 2, label: 'Switch 5 lights in high-use areas to LEDs', checked: false, points: 25 },
    { id: 'w3-1', week: 3, label: 'Limit clothing purchases to zero this week', checked: false, points: 15 },
    { id: 'w3-2', week: 3, label: 'Optimize computer power settings (hibernate mode)', checked: false, points: 15 },
  ]);

  const toggleAction = (id: string) => {
    setWeeklyActions(prev => prev.map(act => {
      if (act.id === id) {
        return { ...act, checked: !act.checked };
      }
      return act;
    }));
  };

  const handleEnroll = async (id: string) => {
    if (!user) {return;}
    setLoadingChallenge(id);
    try {
      await enroll(id, 7, 100);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChallenge(null);
    }
  };

  const handleComplete = async (id: string, currentDays: number) => {
    if (!user) {return;}
    setLoadingChallenge(id);
    try {
      // Simulate completion progression
      const nextDays = currentDays + 1;
      const isCompleted = nextDays >= 5; // simplified standard duration
      await updateProgress(id, nextDays, isCompleted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChallenge(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center space-x-2">
          <Map className="h-6 w-6 text-emerald-500" />
          <span>Reduction Roadmap &amp; Challenges</span>
        </h1>
        <p className="text-sm text-zinc-500">
          Act on structured, week-by-week sustainability tasks and join active challenges to earn unique badges.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Week-by-Week Reduction Planner */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="glass-card bg-white dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-800 p-6 md:p-8 space-y-6">
            <h2 className="text-md font-bold text-zinc-800 dark:text-zinc-100 flex items-center space-x-2">
              <Compass className="h-5 w-5 text-emerald-500" />
              <span>Week-by-Week Action Plan</span>
            </h2>

            <div className="space-y-6">
              {[1, 2, 3].map((week) => (
                <div key={week} className="space-y-3">
                  <h3 className="text-xs font-extrabold text-emerald-600 dark:text-emerald-450 uppercase tracking-widest">
                    Week {week} — Foundation Reductions
                  </h3>
                  
                  <div className="space-y-2">
                    {weeklyActions.filter(a => a.week === week).map((act) => (
                      <div 
                        key={act.id}
                        className={`p-4 border rounded-xl flex items-start justify-between space-x-3 transition-colors ${
                          act.checked 
                            ? 'bg-emerald-500/5 border-emerald-500/25 dark:bg-emerald-500/5 text-zinc-400' 
                            : 'bg-zinc-50 border-zinc-200 dark:bg-zinc-900/50 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={act.checked}
                            onChange={() => toggleAction(act.id)}
                            className="h-4.5 w-4.5 text-emerald-600 border-zinc-300 rounded focus:ring-emerald-500 shrink-0 mt-0.5"
                          />
                          <span className={`text-xs ${act.checked ? 'line-through' : ''}`}>
                            {act.label}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded">
                          +{act.points} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side: Predefined Challenges */}
        <div className="space-y-6">
          
          <div className="glass-card bg-zinc-900/5 dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
            <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-150 flex items-center space-x-2">
              <Trophy className="h-4.5 w-4.5 text-amber-500" />
              <span>Eco Challenges</span>
            </h2>

            <div className="space-y-4">
              {PREDEFINED_CHALLENGES.map((ch) => {
                const prog = challengeProgress[ch.id];
                const isEnrolled = !!prog;
                const isCompleted = prog?.status === 'completed';
                const isPending = loadingChallenge === ch.id;

                return (
                  <div key={ch.id} className="p-4 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{ch.title}</h4>
                        <span className="text-[9px] text-zinc-400 capitalize">{ch.difficulty} difficulty</span>
                      </div>
                      
                      <span className="text-[10px] font-bold bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded">
                        +{ch.points} pts
                      </span>
                    </div>

                    <p className="text-[10px] text-zinc-550 leading-relaxed">{ch.description}</p>

                    <div className="flex items-center justify-between text-[9px] text-zinc-400 border-t border-zinc-150 dark:border-zinc-850 pt-2.5">
                      <span>Est. Savings: <strong className="text-emerald-500">-{ch.co2SavedEstimate}kg CO₂</strong></span>
                      
                      {isCompleted ? (
                        <span className="text-emerald-500 font-bold flex items-center space-x-1">
                          <ShieldCheck className="h-3 w-3" />
                          <span>Earned!</span>
                        </span>
                      ) : isEnrolled ? (
                        <button
                          onClick={() => handleComplete(ch.id, prog.daysCompleted)}
                          disabled={isPending}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-[10px] transition-colors focus:outline-none"
                        >
                          {isPending ? 'Updating...' : `Log Day (${prog.daysCompleted}/5)`}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEnroll(ch.id)}
                          disabled={isPending}
                          className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-white rounded-lg font-semibold text-[10px] transition-colors focus:outline-none"
                        >
                          {isPending ? 'Enrolling...' : 'Join Challenge'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Badge Display Box */}
          <div className="bg-zinc-100 dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 flex items-center space-x-2">
              <Star className="h-4.5 w-4.5 text-amber-500" />
              <span>Badges Awarded</span>
            </h3>
            
            <div className="grid grid-cols-4 gap-2.5 text-center">
              {PREDEFINED_CHALLENGES.map((ch) => {
                const isCompleted = challengeProgress[ch.id]?.status === 'completed';
                return (
                  <div key={ch.id} className="space-y-1 group">
                    <div className={`h-11 w-11 rounded-full mx-auto flex items-center justify-center border text-md ${
                      isCompleted 
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 animate-float' 
                        : 'bg-zinc-200/50 border-zinc-300/40 text-zinc-400 opacity-40 dark:bg-zinc-800 dark:border-zinc-700'
                    }`}>
                      🏆
                    </div>
                    <span className="text-[8px] text-zinc-400 truncate block">{ch.title.split(' ')[0]}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
