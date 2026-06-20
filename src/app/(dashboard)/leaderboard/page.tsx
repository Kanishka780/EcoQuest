'use client';

import React, { useState, useMemo } from 'react';
import { useUserStore } from '../../../stores/useUserStore';
import { Trophy, Search, Building, Globe } from 'lucide-react';

interface LeaderboardEntry {
  userId: string;
  displayName: string;
  photoURL: string | null;
  score: number; // total sustainability points
  carbonSaved: number; // total kg saved
  rank: number;
}

const MOCK_LEADERBOARDS: Record<string, LeaderboardEntry[]> = {
  global: [
    { userId: 'u-1', displayName: 'Elena Rostova', photoURL: null, score: 980, carbonSaved: 120, rank: 1 },
    { userId: 'u-2', displayName: 'Kenji Sato', photoURL: null, score: 850, carbonSaved: 95, rank: 2 },
    { userId: 'u-3', displayName: 'Chloe Dupont', photoURL: null, score: 720, carbonSaved: 80, rank: 3 },
    { userId: 'mock-user-123', displayName: 'Aarav Sharma (You)', photoURL: null, score: 450, carbonSaved: 48, rank: 4 },
    { userId: 'u-4', displayName: 'Sarah Jenkins', photoURL: null, score: 390, carbonSaved: 38, rank: 5 },
    { userId: 'u-5', displayName: 'David Miller', photoURL: null, score: 280, carbonSaved: 22, rank: 6 }
  ],
  city: [ // Mumbai
    { userId: 'u-10', displayName: 'Priyah Sharma', photoURL: null, score: 780, carbonSaved: 82, rank: 1 },
    { userId: 'u-11', displayName: 'Rahul Mehta', photoURL: null, score: 620, carbonSaved: 68, rank: 2 },
    { userId: 'mock-user-123', displayName: 'Aarav Sharma (You)', photoURL: null, score: 450, carbonSaved: 48, rank: 3 },
    { userId: 'u-12', displayName: 'Ananya Deshmukh', photoURL: null, score: 350, carbonSaved: 31, rank: 4 },
    { userId: 'u-13', displayName: 'Vikram Joshi', photoURL: null, score: 190, carbonSaved: 15, rank: 5 }
  ],
  institution: [ // IIT Bombay
    { userId: 'u-20', displayName: 'Kabir Sen', photoURL: null, score: 810, carbonSaved: 90, rank: 1 },
    { userId: 'mock-user-123', displayName: 'Aarav Sharma (You)', photoURL: null, score: 450, carbonSaved: 48, rank: 2 },
    { userId: 'u-21', displayName: 'Nisha Patil', photoURL: null, score: 320, carbonSaved: 28, rank: 3 },
    { userId: 'u-22', displayName: 'Aditya Roy', photoURL: null, score: 150, carbonSaved: 12, rank: 4 }
  ]
};

export default function LeaderboardPage() {
  const user = useUserStore(state => state.user);

  const [scope, setScope] = useState<'global' | 'city' | 'institution'>('global');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'score' | 'carbonSaved'>('score');

  // Sync user score into mock data
  const processedData = useMemo(() => {
    const list = [...MOCK_LEADERBOARDS[scope]];
    
    // Find user entry
    const userIndex = list.findIndex(e => e.userId === 'mock-user-123');
    if (userIndex !== -1 && user) {
      list[userIndex] = {
        ...list[userIndex],
        displayName: `${user.displayName} (You)`,
        score: user.sustainability.totalPoints,
        // Estimate saved carbon based on habits
        carbonSaved: Object.values(useUserStore.getState().habits).reduce((sum, h) => sum + h.carbonSaved, 48)
      };
    }

    // Sort based on sortField
    const sorted = list.sort((a, b) => b[sortField] - a[sortField]);

    // Re-rank
    return sorted.map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
  }, [scope, sortField, user]);

  const filteredData = useMemo(() => {
    return processedData.filter(entry => 
      entry.displayName.toLowerCase().includes(search.toLowerCase())
    );
  }, [processedData, search]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center space-x-2">
          <Trophy className="h-6 w-6 text-emerald-500 animate-float" />
          <span>Community Leaderboards</span>
        </h1>
        <p className="text-sm text-zinc-500">
          Compare your sustainability points and carbon reductions with users worldwide, in {user?.location.city || 'your city'}, or within your institution.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Columns: Rankings list */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2 rounded-2xl">
            
            {/* Scopes */}
            <div className="flex space-x-1">
              <button
                onClick={() => setScope('global')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold focus:outline-none ${
                  scope === 'global'
                    ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                }`}
              >
                <Globe className="h-4 w-4" />
                <span>Global</span>
              </button>

              <button
                onClick={() => setScope('city')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold focus:outline-none ${
                  scope === 'city'
                    ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                }`}
              >
                <Building className="h-4 w-4" />
                <span>{user?.location.city || 'Mumbai'}</span>
              </button>

              <button
                onClick={() => setScope('institution')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold focus:outline-none ${
                  scope === 'institution'
                    ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                }`}
              >
                <Building className="h-4 w-4" />
                <span>{user?.institution || 'IIT Bombay'}</span>
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500 pointer-events-none">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full pl-9 pr-3 py-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-805 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-zinc-800 dark:text-zinc-150"
                placeholder="Search players..."
                aria-label="Search rankings player list"
              />
            </div>

          </div>

          {/* Rankings Table Card */}
          <div className="glass-card bg-white dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse" aria-label="Sustainability rankings list">
                <caption className="sr-only">{scope} carbon reduction rankings</caption>
                
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 text-xs font-semibold bg-zinc-50/50 dark:bg-zinc-900/30">
                    <th scope="col" className="text-center py-3.5 px-4 w-16">Rank</th>
                    <th scope="col" className="text-left py-3.5 px-4">User</th>
                    
                    <th 
                      scope="col" 
                      className="text-right py-3.5 px-4 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      onClick={() => setSortField('score')}
                      aria-sort={sortField === 'score' ? 'descending' : 'none'}
                    >
                      Score {sortField === 'score' && '▼'}
                    </th>
                    
                    <th 
                      scope="col" 
                      className="text-right py-3.5 px-4 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      onClick={() => setSortField('carbonSaved')}
                      aria-sort={sortField === 'carbonSaved' ? 'descending' : 'none'}
                    >
                      CO₂ Saved {sortField === 'carbonSaved' && '▼'}
                    </th>
                  </tr>
                </thead>
                
                <tbody>
                  {filteredData.map((row) => {
                    const isMe = row.userId === 'mock-user-123';
                    return (
                      <tr 
                        key={row.userId} 
                        className={`border-b border-zinc-100 dark:border-zinc-800/40 last:border-0 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 ${
                          isMe ? 'bg-emerald-500/5 dark:bg-emerald-500/5 font-semibold text-emerald-650 dark:text-emerald-400' : 'text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        <td className="text-center py-4 px-4 text-xs font-bold tabular-nums">
                          {row.rank === 1 && '🥇'}
                          {row.rank === 2 && '🥈'}
                          {row.rank === 3 && '🥉'}
                          {row.rank > 3 && `${row.rank}`}
                        </td>
                        
                        <td className="py-4 px-4 text-xs">
                          <div className="flex items-center space-x-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold uppercase text-[10px] ${
                              isMe ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500' : 'bg-zinc-100 border border-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-400'
                            }`}>
                              {row.displayName.charAt(0)}
                            </div>
                            <span className="truncate max-w-[150px]">{row.displayName}</span>
                          </div>
                        </td>

                        <td className="text-right py-4 px-4 text-xs tabular-nums">{row.score.toLocaleString()} pts</td>
                        <td className="text-right py-4 px-4 text-xs tabular-nums text-emerald-500">{row.carbonSaved.toFixed(1)} kg</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right side helper info */}
        <div className="space-y-6">
          <div className="bg-zinc-100 dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">How Ranks Work</h3>
            <p className="text-xs text-zinc-550 leading-relaxed">
              Points are generated by logging daily habits (vegetarian diet, Metro commuting, bicycling) and completing challenges. High scores and high streaks help elevate your municipal percentile rankings.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
