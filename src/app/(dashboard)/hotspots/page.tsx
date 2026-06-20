'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useFootprintStore } from '../../../stores/useFootprintStore';
import { calculateHotspots } from '../../../features/calculator/utils/calculations';
import { AccessibleChart } from '../../../components/shared/AccessibleChart';
import { ShieldAlert, ArrowRight, Lightbulb, Compass } from 'lucide-react';

const HotspotsChart = dynamic(
  () => import('../../../features/hotspots/components/HotspotsChart'),
  { 
    loading: () => (
      <div className="h-64 flex items-center justify-center text-xs text-zinc-500 font-medium animate-pulse">
        Loading visual charts...
      </div>
    ), 
    ssr: false 
  }
);

export default function HotspotsPage() {
  const activeRecord = useFootprintStore(state => state.activeRecord);

  // If no record exists
  if (!activeRecord) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 bg-white dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800 rounded-2xl space-y-4">
        <div className="p-3 bg-zinc-100 dark:bg-zinc-900 text-zinc-400 rounded-2xl">
          <ShieldAlert className="h-10 w-10 animate-float" />
        </div>
        <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">No Carbon Record Found</h2>
        <p className="text-sm text-zinc-500 max-w-sm leading-relaxed">
          Please fill out the Carbon Footprint Calculator first so we can analyze your hotspots and carbon drivers.
        </p>
        <Link href="/calculator" className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs transition-all shadow-md focus:outline-none">
          <span>Go to Calculator</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const results = activeRecord.results;
  const rawHotspots = calculateHotspots(results);

  // Format data for chart
  const chartData = rawHotspots.map(h => ({
    name: h.label,
    value: h.value
  }));

  // Format data for Accessible table
  const tableData = rawHotspots.map(h => ({
    label: h.label,
    value: h.value.toLocaleString(),
    unit: 'kg CO2e'
  }));

  // Create screen reader description string
  const primaryCategory = rawHotspots[0];
  const chartDescription = `Your total annual carbon footprint is ${results.annual.toLocaleString()} kg CO2 equivalent. Category breakdown: ` + 
    rawHotspots.map(h => `${h.label} contributes ${h.percentage.toFixed(0)}% (${h.value.toLocaleString()} kg)`).join(', ') + '.';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Hotspot Analysis
        </h1>
        <p className="text-sm text-zinc-500">
          Identify the primary drivers of your carbon footprint and learn where your reduction efforts will have the greatest impact.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Chart Visualization */}
        <div className="lg:col-span-2 glass-card bg-white dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-800 p-6 md:p-8 space-y-6">
          <h2 className="text-md font-bold text-zinc-800 dark:text-zinc-100 flex items-center space-x-2">
            <Compass className="h-5 w-5 text-emerald-500" />
            <span>Emissions Breakdown</span>
          </h2>
          
          <AccessibleChart 
            title="Carbon Footprint by Category" 
            description={chartDescription} 
            data={tableData}
          >
            <HotspotsChart data={chartData} />
          </AccessibleChart>
        </div>

        {/* Right Side: Analysis Cards */}
        <div className="space-y-6">
          
          {/* Carbon driver summary */}
          <div className="glass-card bg-zinc-900/5 dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
            <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 flex items-center space-x-2">
              <ShieldAlert className="h-4.5 w-4.5 text-rose-500" />
              <span>Primary Carbon Driver</span>
            </h3>
            
            <div className="p-4 bg-rose-500/5 rounded-xl border border-rose-500/10">
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Top Source</span>
              <div className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-0.5">{primaryCategory.label}</div>
              <p className="text-xs text-zinc-500 mt-2">
                This category accounts for <strong className="text-zinc-700 dark:text-zinc-350">{primaryCategory.percentage.toFixed(0)}%</strong> of your total emissions, contributing <strong className="text-zinc-700 dark:text-zinc-350">{primaryCategory.value.toLocaleString()} kg CO₂e</strong> annually.
              </p>
            </div>

            <div className="text-xs text-zinc-500 leading-relaxed space-y-3 pt-2">
              <p>
                To achieve the 2030 climate safety target, target reductions in your top two carbon drivers first.
              </p>
              
              <Link href="/simulator" className="inline-flex items-center space-x-1.5 text-emerald-500 hover:text-emerald-450 hover:underline font-semibold focus:outline-none">
                <span>Open Savings Simulator</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Action Recommendations */}
          <div className="bg-zinc-100 dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 flex items-center space-x-2">
              <Lightbulb className="h-4.5 w-4.5 text-amber-500" />
              <span>Reduction Insight</span>
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              {primaryCategory.label === 'Transportation' && (
                "Your transit emissions are highly influenced by private vehicle commutes. Shifting just two commute days per week to electric vehicles, public transportation, or bicycling can yield savings of over 500kg CO₂ per year."
              )}
              {primaryCategory.label === 'Energy Usage' && (
                "Your household energy is your highest contributor. Unifying your electricity supply under solar generation or shifting standard grid consumption downward through high-efficiency LED appliances will result in double-digit footprint reductions."
              )}
              {primaryCategory.label === 'Diet & Food' && (
                "Food emissions are highly responsive to diet selections. Replacing red meat (such as beef) with vegetarian alternatives three times a week reduces your food footprint by roughly 30%."
              )}
              {primaryCategory.label === 'Shopping & Goods' && (
                "High shopping outputs indicate consumption cycles. Try switching to refurbished or second-hand electronics, buying clothing made from recycled materials, and grouping online orders together to reduce shipping footprints."
              )}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
