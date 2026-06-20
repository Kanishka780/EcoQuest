'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useFootprintStore } from '../../../stores/useFootprintStore';
import { calculateAnnualFootprint } from '../../../features/calculator/utils/calculations';
import { ShieldAlert, ArrowRight, Activity, Leaf, ShieldCheck } from 'lucide-react';

const SimulatorChart = dynamic(
  () => import('../../../features/simulator/components/SimulatorChart'),
  { 
    loading: () => (
      <div className="h-64 flex items-center justify-center text-xs text-zinc-550 font-medium animate-pulse">
        Loading simulator chart...
      </div>
    ), 
    ssr: false 
  }
);

export default function SimulatorPage() {
  const activeRecord = useFootprintStore(state => state.activeRecord);

  // Simulated state values
  const [carKm, setCarKm] = useState(0);
  const [elecKwh, setElecKwh] = useState(0);
  const [meatMeals, setMeatMeals] = useState(0);
  const [onlineOrders, setOnlineOrders] = useState(0);

  // Sync initial state values with active record inputs
  useEffect(() => {
    if (activeRecord) {
      const timer = setTimeout(() => {
        setCarKm(activeRecord.inputs.transport.carKmPerDay);
        setElecKwh(activeRecord.inputs.energy.electricityKwhPerMonth);
        setMeatMeals(activeRecord.inputs.diet.meatMealsPerWeek);
        setOnlineOrders(activeRecord.inputs.shopping.onlineOrdersPerWeek);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [activeRecord]);

  if (!activeRecord) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-white dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
        <div className="p-3 bg-zinc-100 dark:bg-zinc-900 text-zinc-400 rounded-2xl">
          <ShieldAlert className="h-10 w-10 animate-float" />
        </div>
        <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">No Carbon Record Found</h2>
        <p className="text-sm text-zinc-500 max-w-sm leading-relaxed">
          Please fill out the Carbon Footprint Calculator first to enable carbon savings simulations.
        </p>
        <Link href="/calculator" className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs transition-all shadow-md focus:outline-none">
          <span>Go to Calculator</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  // Calculate simulated results
  const simulatedInputs = {
    ...activeRecord.inputs,
    transport: {
      ...activeRecord.inputs.transport,
      carKmPerDay: carKm
    },
    energy: {
      ...activeRecord.inputs.energy,
      electricityKwhPerMonth: elecKwh
    },
    diet: {
      ...activeRecord.inputs.diet,
      meatMealsPerWeek: meatMeals,
      beefMealsPerWeek: Math.min(meatMeals, activeRecord.inputs.diet.beefMealsPerWeek)
    },
    shopping: {
      ...activeRecord.inputs.shopping,
      onlineOrdersPerWeek: onlineOrders
    }
  };

  const currentAnnual = activeRecord.results.annual;
  const simulatedResults = calculateAnnualFootprint(simulatedInputs);
  const simulatedAnnual = simulatedResults.annual;

  const carbonSaved = Math.max(0, currentAnnual - simulatedAnnual);
  const savingsPercent = currentAnnual > 0 ? (carbonSaved / currentAnnual) * 100 : 0;
  
  // 1 tree absorbs ~22kg of CO2 per year
  const treesEquivalent = parseFloat((carbonSaved / 22).toFixed(1));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Impact Simulator
        </h1>
        <p className="text-sm text-zinc-500">
          Tweak your daily routines in real time to visualize how different lifestyle choices accumulate carbon savings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Interactive Sliders */}
        <div className="lg:col-span-2 glass-card bg-white dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-800 p-6 md:p-8 space-y-6">
          <h2 className="text-md font-bold text-zinc-800 dark:text-zinc-100 flex items-center space-x-2">
            <Activity className="h-5 w-5 text-emerald-500" />
            <span>Simulate Habits Changes</span>
          </h2>

          <div className="space-y-6">
            {/* Slider 1: Car commuting */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <span>Daily Car Distance</span>
                <span className="tabular-nums text-emerald-500">{carKm} km/day</span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.max(100, activeRecord.inputs.transport.carKmPerDay * 2)}
                value={carKm}
                onChange={(e) => setCarKm(parseFloat(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                aria-label="Daily car distance simulation"
              />
              <div className="flex justify-between text-[9px] text-zinc-400">
                <span>0 km (Net-zero)</span>
                <span>Original: {activeRecord.inputs.transport.carKmPerDay} km</span>
              </div>
            </div>

            {/* Slider 2: Electricity */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <span>Monthly Electricity consumption</span>
                <span className="tabular-nums text-emerald-500">{elecKwh} kWh/month</span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.max(1000, activeRecord.inputs.energy.electricityKwhPerMonth * 2)}
                value={elecKwh}
                onChange={(e) => setElecKwh(parseFloat(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                aria-label="Monthly electricity usage simulation"
              />
              <div className="flex justify-between text-[9px] text-zinc-400">
                <span>0 kWh (Fully Solar/Wind)</span>
                <span>Original: {activeRecord.inputs.energy.electricityKwhPerMonth} kWh</span>
              </div>
            </div>

            {/* Slider 3: Meat Meals */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <span>Meat Meals per week</span>
                <span className="tabular-nums text-emerald-500">{meatMeals} meals/week</span>
              </div>
              <input
                type="range"
                min="0"
                max="21"
                value={meatMeals}
                onChange={(e) => setMeatMeals(parseInt(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                aria-label="Meat meals per week simulation"
              />
              <div className="flex justify-between text-[9px] text-zinc-400">
                <span>0 meals (Full Vegetarian)</span>
                <span>Original: {activeRecord.inputs.diet.meatMealsPerWeek} meals</span>
              </div>
            </div>

            {/* Slider 4: Online Orders */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <span>E-Commerce deliveries</span>
                <span className="tabular-nums text-emerald-500">{onlineOrders} deliveries/week</span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.max(20, activeRecord.inputs.shopping.onlineOrdersPerWeek * 2)}
                value={onlineOrders}
                onChange={(e) => setOnlineOrders(parseFloat(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                aria-label="Online shopping orders simulation"
              />
              <div className="flex justify-between text-[9px] text-zinc-400">
                <span>0 orders</span>
                <span>Original: {activeRecord.inputs.shopping.onlineOrdersPerWeek} orders</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Graph & Equivalences */}
        <div className="space-y-6">
          
          {/* Comparison Bar Chart */}
          <div className="glass-card bg-slate-950/40 border-slate-800 p-6 space-y-4 text-center">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Before vs After Comparison</h3>
            <SimulatorChart current={currentAnnual} simulated={simulatedAnnual} />
          </div>

          {/* Savings details */}
          <div className="glass-card bg-emerald-950/20 dark:bg-emerald-950/10 border-emerald-500/20 p-6 text-center space-y-4">
            <div className="inline-flex p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
              <Leaf className="h-6 w-6" />
            </div>
            
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Annual Carbon Savings</h3>
              <div className="text-3xl font-extrabold text-white mt-1">
                {carbonSaved.toLocaleString()}
                <span className="text-sm font-semibold text-emerald-400 ml-1">kg CO₂e</span>
              </div>
              <p className="text-xs text-emerald-400 font-bold mt-1">
                {savingsPercent.toFixed(0)}% footprint reduction
              </p>
            </div>

            {carbonSaved > 0 && (
              <div className="bg-emerald-900/10 border border-emerald-500/15 p-4 rounded-xl space-y-1.5 text-left text-xs text-slate-300">
                <div className="flex items-center space-x-2 font-bold text-slate-200">
                  <ShieldCheck className="h-4.5 w-4.5 text-emerald-400" />
                  <span>Environmental Equivalency</span>
                </div>
                <p className="leading-relaxed">
                  Reducing emissions by this amount is equivalent to planting <strong className="text-white font-bold">{treesEquivalent} mature trees</strong> and allowing them to grow for a full year.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
