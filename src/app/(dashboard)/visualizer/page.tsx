'use client';

import React, { useState, useMemo } from 'react';
import { Leaf, AlertTriangle, Sparkles, Sun, ShieldAlert, Activity } from 'lucide-react';

export default function VisualizerPage() {
  const [globalTempRise, setGlobalTempRise] = useState<number>(2.4); // Default projected rise in 2100

  // Calculate the Earth's health metrics based on temperature rise
  const stats = useMemo(() => {
    // 1.5C target: 100% health
    // 4.0C rise: 10% health
    const health = Math.max(5, Math.round(100 - ((globalTempRise - 1.0) / 3.0) * 90));
    
    // Forest cover reduction
    const forestRemaining = Math.max(20, Math.round(100 - ((globalTempRise - 1.0) / 3.0) * 60));
    
    // Sea level rise (cm)
    const seaLevelRise = Math.round((globalTempRise - 1.0) * 28);
    
    return {
      health,
      forestRemaining,
      seaLevelRise: seaLevelRise > 0 ? seaLevelRise : 0,
    };
  }, [globalTempRise]);

  // Determine Earth atmosphere glow color
  const atmosphereGlow = useMemo(() => {
    if (globalTempRise <= 1.5) {return 'rgba(16, 185, 129, 0.45)';} // Emerald
    if (globalTempRise <= 2.0) {return 'rgba(234, 179, 8, 0.45)';}   // Yellow
    if (globalTempRise <= 3.0) {return 'rgba(249, 115, 22, 0.5)';}   // Orange
    return 'rgba(239, 68, 68, 0.6)';                              // Red
  }, [globalTempRise]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center space-x-2">
          <Sparkles className="h-6 w-6 text-emerald-500 animate-float" />
          <span>Future Earth Visualizer</span>
        </h1>
        <p className="text-sm text-zinc-500">
          Simulate global temperature scenarios up to the year 2100 to visualize the corresponding impact on sea levels, forest cover, and overall planetary health.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Globe Visualizer */}
        <div className="lg:col-span-2 glass-card bg-slate-950/40 border-slate-800 p-6 md:p-8 flex flex-col items-center justify-center space-y-6 min-h-[50vh] relative overflow-hidden">
          <div className="absolute top-4 left-4 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
            Planetary Simulator
          </div>

          {/* Interactive Globe Container */}
          <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
            
            {/* Atmosphere layer */}
            <div 
              className="absolute inset-0 rounded-full transition-all duration-500 blur-xl scale-105"
              style={{ backgroundColor: atmosphereGlow }}
            ></div>

            {/* Ocean globe sphere */}
            <div className="relative w-56 h-56 md:w-64 md:h-64 rounded-full bg-slate-800 border-2 border-slate-700 overflow-hidden flex items-center justify-center transition-all duration-500 shadow-2xl">
              
              {/* Climate heat overlay */}
              <div 
                className="absolute inset-0 mix-blend-color-burn opacity-70 transition-all duration-500"
                style={{ 
                  background: `radial-gradient(circle, ${atmosphereGlow} 0%, rgba(15,23,42,1) 85%)` 
                }}
              ></div>

              {/* Continents mock-up */}
              <svg className="w-full h-full text-emerald-600/40 dark:text-emerald-500/20 fill-current opacity-80" viewBox="0 0 100 100">
                <path d="M15,40 Q25,25 35,35 T55,30 T75,45 T85,35 Q90,50 80,65 T50,75 T25,60 Z" />
                <path d="M40,15 Q50,5 60,12 T75,8 Q70,25 60,20 Z" />
                <path d="M10,75 Q20,85 30,80 T40,90 Q20,95 10,75 Z" />
              </svg>

              {/* Water level lines overlay */}
              {stats.seaLevelRise > 0 && (
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-blue-500/35 border-t border-blue-400 backdrop-blur-[1px] transition-all duration-500"
                  style={{ height: `${Math.min(50, stats.seaLevelRise / 2)}%` }}
                >
                  <div className="absolute top-1 left-0 right-0 text-center text-[8px] font-bold text-blue-200 uppercase tracking-widest animate-pulse-slow">
                    Sea Level Rise +{stats.seaLevelRise}cm
                  </div>
                </div>
              )}
            </div>
            
            {/* Warming Sun Visual */}
            <div className="absolute top-4 right-4 animate-spin [animation-duration:10s]">
              <Sun className={`h-8 w-8 transition-colors duration-500 ${
                globalTempRise > 2.5 ? 'text-red-500' : 'text-amber-400'
              }`} />
            </div>
          </div>

          {/* Quick Metrics display */}
          <div className="grid grid-cols-3 gap-4 w-full border-t border-slate-800 pt-6">
            <div className="text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Planetary Health</span>
              <span className={`text-xl font-extrabold mt-1 block tabular-nums ${
                stats.health > 70 ? 'text-emerald-450' : stats.health > 40 ? 'text-amber-500' : 'text-red-500'
              }`}>{stats.health}%</span>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Sea Level Rise</span>
              <span className="text-xl font-extrabold text-blue-400 mt-1 block tabular-nums">+{stats.seaLevelRise} cm</span>
            </div>
            <div className="text-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Forest Canopy</span>
              <span className="text-xl font-extrabold text-emerald-400 mt-1 block tabular-nums">{stats.forestRemaining}%</span>
            </div>
          </div>

        </div>

        {/* Right Side: Simulation Control Panel */}
        <div className="space-y-6">
          
          <div className="glass-card bg-zinc-950/40 border-slate-800 p-6 space-y-6">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Activity className="h-4.5 w-4.5 text-emerald-500" />
              <span>Simulation Controls</span>
            </h2>

            {/* Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-200">
                <span>Temp. Rise by 2100</span>
                <span className={`tabular-nums font-bold text-md ${
                  globalTempRise <= 1.5 ? 'text-emerald-450' : globalTempRise <= 2.0 ? 'text-amber-400' : 'text-red-500'
                }`}>+{globalTempRise.toFixed(1)}°C</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="4.0"
                step="0.1"
                value={globalTempRise}
                onChange={(e) => setGlobalTempRise(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                aria-label="Simulated temperature rise"
              />
              <div className="flex justify-between text-[9px] text-slate-500">
                <span>1.0°C (Pre-industrial)</span>
                <span>4.0°C (Extreme Scenario)</span>
              </div>
            </div>

            {/* Scenario Info */}
            <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2 text-xs leading-relaxed text-slate-400">
              <div className="font-bold text-slate-200 flex items-center space-x-1.5">
                {globalTempRise <= 1.5 ? (
                  <>
                    <Leaf className="h-4 w-4 text-emerald-450" />
                    <span>Paris Accord Target (1.5°C)</span>
                  </>
                ) : globalTempRise <= 2.0 ? (
                  <>
                    <Leaf className="h-4 w-4 text-amber-400" />
                    <span>Moderate Warming Limit (2.0°C)</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span>Runaway Warming Scenario</span>
                  </>
                )}
              </div>
              
              <p>
                {globalTempRise <= 1.5 && (
                  "Planetary biomes remain stable. Arctic summer sea ice is preserved, extreme heat waves remain rare, and agricultural yields are protected."
                )}
                {globalTempRise > 1.5 && globalTempRise <= 2.0 && (
                  "Coral reef biomes experience widespread bleaching. Sea level rises displace low-lying coastal populations, and summer ice-free Arctic cycles occur once per decade."
                )}
                {globalTempRise > 2.0 && (
                  "Runaway feedback loops trigger. Permafrost thaw accelerates, desertification spreads, and sea-level surges displace up to 150 million coastal residents globally."
                )}
              </p>
            </div>
          </div>

          {/* Connection to user footprint */}
          <div className="bg-zinc-100 dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 flex items-center space-x-2">
              <ShieldAlert className="h-4.5 w-4.5 text-amber-500" />
              <span>Your Ecological Role</span>
            </h3>
            <p className="text-xs text-zinc-550 leading-relaxed">
              If every global resident maintained your carbon footprint rate, the projected global temperature rise by 2100 would reach roughly <strong className="text-zinc-800 dark:text-zinc-250">2.6°C</strong>. Swapping to public transit and green energy moves us back toward the safe <strong className="text-emerald-500">1.5°C</strong> threshold.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
