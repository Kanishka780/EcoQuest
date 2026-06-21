'use client';

/**
 * @fileoverview Multi-step Carbon Calculator page.
 *
 * Collects transport, energy, diet and shopping data via a tabbed form,
 * shows real-time CO₂e estimates, and persists results to Firestore.
 *
 * @module CalculatorPage
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { useUserStore } from '../../../stores/useUserStore';
import { useFootprintStore } from '../../../stores/useFootprintStore';
import { FullCalculatorSchema } from '../../../utils/validators';
import { calculateAnnualFootprint } from '../../../features/calculator/utils/calculations';
import { LiveRegion } from '../../../components/shared/LiveRegion';
import { FootprintInputs } from '../../../types/footprint.types';
import {
  Car, Lightbulb, Utensils, ShoppingBag, Info,
  Calculator, ChevronRight, ChevronLeft, Save,
} from 'lucide-react';

/** Duration before the success message auto-dismisses (ms). */
const SUCCESS_DISMISS_MS = 5_000;

const FORM_SECTIONS = [
  { id: 'transport', label: 'Transit',     icon: Car },
  { id: 'energy',    label: 'Utilities',   icon: Lightbulb },
  { id: 'diet',      label: 'Diet',        icon: Utensils },
  { id: 'shopping',  label: 'Consumption', icon: ShoppingBag },
] as const;

type SectionId = (typeof FORM_SECTIONS)[number]['id'];

/** Baseline input values shown when no saved record exists. */
const DEFAULT_INPUTS: FootprintInputs = {
  transport: {
    carKmPerDay: 15,
    carFuelType: 'petrol',
    publicTransportKmPerDay: 10,
    flightsPerYear: 1,
    flightType: 'domestic',
    bikeOrWalkKmPerDay: 2,
  },
  energy: {
    electricityKwhPerMonth: 200,
    electricitySource: 'grid',
    naturalGasUnitsPerMonth: 0,
    coalUsageKgPerMonth: 0,
    householdSize: 2,
  },
  diet: {
    meatMealsPerWeek: 7,
    beefMealsPerWeek: 1,
    dairyServingsPerDay: 2,
    foodWastePercent: 20,
  },
  shopping: {
    clothingItemsPerMonth: 2,
    electronicsPerYear: 1,
    onlineOrdersPerWeek: 2,
  },
};

/** Shared Tailwind classes for all form inputs. */
const INPUT_CLS =
  'block w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500';

/**
 * Multi-step carbon footprint calculator.
 *
 * Provides real-time CO₂e estimates as the user fills in each section and
 * persists the final result to the authenticated user's Firestore profile.
 *
 * @returns The calculator page JSX element.
 */
export default function CalculatorPage() {
  const user         = useUserStore(state => state.user);
  const saveFootprint = useFootprintStore(state => state.saveRecord);
  const activeRecord  = useFootprintStore(state => state.activeRecord);

  const [activeTab,   setActiveTab]   = useState<SectionId>('transport');
  const [announcement, setAnnouncement] = useState('');
  const [saveLoading,  setSaveLoading]  = useState(false);
  const [successMsg,   setSuccessMsg]   = useState('');
  const [saveError,    setSaveError]    = useState('');

  /** Timer ref so we can clear the auto-dismiss on unmount. */
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (dismissTimer.current !== null) {
        clearTimeout(dismissTimer.current);
      }
    };
  }, []);

  const defaultValues = useMemo<FootprintInputs>(
    () => activeRecord?.inputs ?? DEFAULT_INPUTS,
    [activeRecord],
  );

  type CalculatorFormInput = z.input<typeof FullCalculatorSchema>;

  const methods = useForm<CalculatorFormInput, unknown, FootprintInputs>({
    resolver: zodResolver(FullCalculatorSchema),
    defaultValues,
    mode: 'onChange',
  });

  const { handleSubmit, reset, formState: { errors, isValid } } = methods;

  useEffect(() => {
    if (activeRecord) {
      reset(activeRecord.inputs);
    }
  }, [activeRecord, reset]);

  const watchedInputs = useWatch({ control: methods.control });

  const realTimeResults = useMemo(() => {
    try {
      return calculateAnnualFootprint(watchedInputs as FootprintInputs);
    } catch {
      return null;
    }
  }, [watchedInputs]);

  /** Move to the next form section. */
  const nextTab = useCallback(() => {
    const idx = FORM_SECTIONS.findIndex(s => s.id === activeTab);
    if (idx < FORM_SECTIONS.length - 1) {
      setActiveTab(FORM_SECTIONS[idx + 1].id);
    }
  }, [activeTab]);

  /** Move to the previous form section. */
  const prevTab = useCallback(() => {
    const idx = FORM_SECTIONS.findIndex(s => s.id === activeTab);
    if (idx > 0) {
      setActiveTab(FORM_SECTIONS[idx - 1].id);
    }
  }, [activeTab]);

  /**
   * Handle form submission.
   * Calculates the footprint from validated inputs and saves it to Firestore.
   *
   * @param data - Validated form values.
   */
  const onSubmit = useCallback(async (data: FootprintInputs) => {
    if (!user) { return; }

    setSaveLoading(true);
    setSuccessMsg('');
    setSaveError('');

    try {
      const results = calculateAnnualFootprint(data);
      await saveFootprint(user.uid, data, results);

      const msg = `Carbon calculation saved. Your annual footprint is estimated at ${results.annual} kg CO₂ equivalent.`;
      setAnnouncement(msg);
      setSuccessMsg('Calculation saved successfully to your profile!');

      if (dismissTimer.current !== null) {
        clearTimeout(dismissTimer.current);
      }
      dismissTimer.current = setTimeout(() => {
        setSuccessMsg('');
        dismissTimer.current = null;
      }, SUCCESS_DISMISS_MS);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save. Please try again.';
      setSaveError(message);
    } finally {
      setSaveLoading(false);
    }
  }, [user, saveFootprint]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Carbon Calculator
          </h1>
          <p className="text-sm text-zinc-500">
            Measure your ecological footprint based on daily transportation, electricity, diet, and consumption.
          </p>
        </div>
      </div>

      <LiveRegion message={announcement} />

      <FormProvider {...methods}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

          {/* ── Form column ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Tab bar */}
            <div
              role="tablist"
              aria-label="Calculator sections"
              className="flex bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1.5 rounded-2xl"
            >
              {FORM_SECTIONS.map(section => {
                const TabIcon   = section.icon;
                const isSelected = activeTab === section.id;
                return (
                  <button
                    key={section.id}
                    role="tab"
                    id={`tab-${section.id}`}
                    aria-selected={isSelected}
                    aria-controls={`tabpanel-${section.id}`}
                    onClick={() => setActiveTab(section.id)}
                    className={`flex-1 flex flex-col sm:flex-row items-center justify-center space-y-1 sm:space-y-0 sm:space-x-2 py-2.5 rounded-xl text-xs font-semibold transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                      isSelected
                        ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                    }`}
                  >
                    <TabIcon className="h-4 w-4" aria-hidden="true" />
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Active tab panel */}
            <div
              role="tabpanel"
              id={`tabpanel-${activeTab}`}
              aria-labelledby={`tab-${activeTab}`}
              className="glass-card bg-white dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-800 p-6 md:p-8"
            >
              {/* eslint-disable-next-line react-hooks/refs */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>

                {/* 1 · Transport */}
                {activeTab === 'transport' && (
                  <fieldset className="space-y-5">
                    <legend className="text-md font-bold text-zinc-800 dark:text-zinc-100 mb-2">
                      Daily Transportation &amp; Travel
                    </legend>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="carKm" className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                          Daily Car Distance (km/day)
                        </label>
                        <input
                          id="carKm"
                          type="number"
                          step="any"
                          aria-describedby={errors.transport?.carKmPerDay ? 'carKm-err' : undefined}
                          {...methods.register('transport.carKmPerDay')}
                          className={INPUT_CLS}
                        />
                        {errors.transport?.carKmPerDay && (
                          <p id="carKm-err" role="alert" className="text-[10px] text-red-500">
                            {errors.transport.carKmPerDay.message}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="fuelType" className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                          Car Fuel Type
                        </label>
                        <select id="fuelType" {...methods.register('transport.carFuelType')} className={INPUT_CLS}>
                          <option value="none">No Car / Do not drive</option>
                          <option value="petrol">Petrol</option>
                          <option value="diesel">Diesel</option>
                          <option value="electric">Electric (EV)</option>
                          <option value="hybrid">Hybrid</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="transitKm" className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                          Public Transport (km/day)
                        </label>
                        <input id="transitKm" type="number" {...methods.register('transport.publicTransportKmPerDay')} className={INPUT_CLS} />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="activeKm" className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                          Bicycle / Walk (km/day)
                        </label>
                        <input id="activeKm" type="number" {...methods.register('transport.bikeOrWalkKmPerDay')} className={INPUT_CLS} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-100 dark:border-zinc-900 pt-4">
                      <div className="space-y-1.5">
                        <label htmlFor="flights" className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                          Flights taken per year
                        </label>
                        <input id="flights" type="number" {...methods.register('transport.flightsPerYear')} className={INPUT_CLS} />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="flightType" className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                          Typical Flight Type
                        </label>
                        <select id="flightType" {...methods.register('transport.flightType')} className={INPUT_CLS}>
                          <option value="domestic">Domestic Flight (~800 km)</option>
                          <option value="shortHaul">Short-haul International (~2 000 km)</option>
                          <option value="longHaul">Long-haul International (~6 000 km)</option>
                          <option value="mixed">Mixed Types</option>
                        </select>
                      </div>
                    </div>
                  </fieldset>
                )}

                {/* 2 · Energy */}
                {activeTab === 'energy' && (
                  <fieldset className="space-y-5">
                    <legend className="text-md font-bold text-zinc-800 dark:text-zinc-100 mb-2">
                      Household Utility Consumption
                    </legend>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="electricity" className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                          Monthly Electricity (kWh/month)
                        </label>
                        <input id="electricity" type="number" {...methods.register('energy.electricityKwhPerMonth')} className={INPUT_CLS} />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="elecSource" className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                          Electricity Source
                        </label>
                        <select id="elecSource" {...methods.register('energy.electricitySource')} className={INPUT_CLS}>
                          <option value="grid">Standard Power Grid (Highly Fossil)</option>
                          <option value="solar">Solar Energy (Net-Zero Direct)</option>
                          <option value="wind">Wind Energy</option>
                          <option value="mixed">Mixed / Green Electricity Plan</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="hhSize" className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                          Household Size
                        </label>
                        <input
                          id="hhSize"
                          type="number"
                          aria-describedby="hhSize-hint"
                          {...methods.register('energy.householdSize')}
                          className={INPUT_CLS}
                        />
                        <span id="hhSize-hint" className="text-[10px] text-zinc-400">
                          Emissions are divided by household members
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="gas" className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                          Natural Gas Usage (m³/month)
                        </label>
                        <input id="gas" type="number" {...methods.register('energy.naturalGasUnitsPerMonth')} className={INPUT_CLS} />
                      </div>
                    </div>
                  </fieldset>
                )}

                {/* 3 · Diet */}
                {activeTab === 'diet' && (
                  <fieldset className="space-y-5">
                    <legend className="text-md font-bold text-zinc-800 dark:text-zinc-100 mb-2">
                      Dietary Habits &amp; Food Waste
                    </legend>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="meatMeals" className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                          Meat Meals per week (max 21)
                        </label>
                        <input id="meatMeals" type="number" {...methods.register('diet.meatMealsPerWeek')} className={INPUT_CLS} />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="beefMeals" className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                          Beef Meals per week
                        </label>
                        <input
                          id="beefMeals"
                          type="number"
                          aria-describedby={errors.diet?.beefMealsPerWeek ? 'beefMeals-err' : undefined}
                          {...methods.register('diet.beefMealsPerWeek')}
                          className={INPUT_CLS}
                        />
                        {errors.diet?.beefMealsPerWeek && (
                          <p id="beefMeals-err" role="alert" className="text-[10px] text-red-500">
                            {errors.diet.beefMealsPerWeek.message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="dairy" className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                          Dairy servings per day
                        </label>
                        <input id="dairy" type="number" step="0.5" {...methods.register('diet.dairyServingsPerDay')} className={INPUT_CLS} />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="waste" className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                          Est. Food Waste (%)
                        </label>
                        <input id="waste" type="number" {...methods.register('diet.foodWastePercent')} className={INPUT_CLS} />
                      </div>
                    </div>
                  </fieldset>
                )}

                {/* 4 · Shopping */}
                {activeTab === 'shopping' && (
                  <fieldset className="space-y-5">
                    <legend className="text-md font-bold text-zinc-800 dark:text-zinc-100 mb-2">
                      Purchasing &amp; Daily Consumption
                    </legend>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="clothing" className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                          New clothing / month
                        </label>
                        <input id="clothing" type="number" {...methods.register('shopping.clothingItemsPerMonth')} className={INPUT_CLS} />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="electronics" className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                          New gadgets / year
                        </label>
                        <input id="electronics" type="number" {...methods.register('shopping.electronicsPerYear')} className={INPUT_CLS} />
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="orders" className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                          E-Commerce orders / week
                        </label>
                        <input id="orders" type="number" {...methods.register('shopping.onlineOrdersPerWeek')} className={INPUT_CLS} />
                      </div>
                    </div>
                  </fieldset>
                )}

                {/* Navigation buttons */}
                <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900 pt-6">
                  <button
                    type="button"
                    onClick={prevTab}
                    disabled={activeTab === 'transport'}
                    aria-label="Go to previous section"
                    className="flex items-center space-x-1.5 px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl font-semibold text-xs disabled:opacity-40 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    <span>Back</span>
                  </button>

                  {activeTab !== 'shopping' ? (
                    <button
                      type="button"
                      onClick={nextTab}
                      aria-label="Go to next section"
                      className="flex items-center space-x-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={saveLoading || !isValid}
                      className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-md"
                    >
                      <Save className="h-4 w-4" aria-hidden="true" />
                      <span>{saveLoading ? 'Saving…' : 'Save Footprint'}</span>
                    </button>
                  )}
                </div>

                {successMsg && (
                  <p role="status" aria-live="polite" className="text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                    {successMsg}
                  </p>
                )}
                {saveError && (
                  <p role="alert" className="text-center text-xs font-semibold text-red-600 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                    {saveError}
                  </p>
                )}
              </form>
            </div>
            
            {/* Calculation Transparency Panel (Citing IPCC constants) */}
            <details 
              className="border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-zinc-950/20 overflow-hidden"
              aria-label="Transparency formulas and references"
            >
              <summary className="text-sm font-semibold p-4 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900/50 flex items-center justify-between text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500">
                <span className="flex items-center space-x-2">
                  <Info className="h-4 w-4 text-emerald-500" />
                  <span>Calculation Audit & Transparency Panel</span>
                </span>
                <span className="text-xs text-zinc-400">View exact IPCC formulas</span>
              </summary>
              
              <div className="p-5 border-t border-zinc-200 dark:border-zinc-800 space-y-4 text-xs text-zinc-650 dark:text-zinc-350 leading-relaxed">
                <div>
                  <h4 className="font-bold text-zinc-800 dark:text-zinc-100 text-xs mb-1">1. Transportation Formula</h4>
                  <p className="bg-zinc-100 dark:bg-zinc-900 p-2.5 rounded-lg font-mono text-[10px] text-zinc-800 dark:text-zinc-300">
                    Annual CO₂e = (Daily Car Km × 365 × Fuel Factor) + (Daily Transit Km × 365 × 0.068) + (Flights/Year × Flight Distance × Flight Factor)
                  </p>
                  <ul className="list-disc pl-5 mt-1.5 space-y-0.5 text-[11px] text-zinc-500">
                    <li>Petrol factor: <strong className="text-zinc-700 dark:text-slate-350">0.192 kg CO₂/km</strong> (IPCC AR6 WG3)</li>
                    <li>Electric factor (India Grid average): <strong className="text-zinc-700 dark:text-slate-350">0.082 kg CO₂/km</strong> (CEA India 2023)</li>
                    <li>Short-haul flights factor: <strong className="text-zinc-700 dark:text-slate-350">0.150 kg CO₂/km</strong> (DEFRA 2023)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-zinc-800 dark:text-zinc-100 text-xs mb-1">2. Energy Formula</h4>
                  <p className="bg-zinc-100 dark:bg-zinc-900 p-2.5 rounded-lg font-mono text-[10px] text-zinc-800 dark:text-zinc-300">
                    Annual CO₂e = [ (Monthly kWh × 12 × Grid Factor) + (Monthly Natural Gas × 12 × 2.02) ] / Household Size
                  </p>
                  <ul className="list-disc pl-5 mt-1.5 space-y-0.5 text-[11px] text-zinc-500">
                    <li>India Grid intensity: <strong className="text-zinc-700 dark:text-slate-350">0.716 kg CO₂e/kWh</strong> (CEA India 2023 Baseline)</li>
                    <li>Solar lifecycle baseline: <strong className="text-zinc-700 dark:text-slate-350">0.045 kg CO₂e/kWh</strong> (NREL 2021)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-zinc-800 dark:text-zinc-100 text-xs mb-1">3. Dietary Formula</h4>
                  <p className="bg-zinc-100 dark:bg-zinc-900 p-2.5 rounded-lg font-mono text-[10px] text-zinc-800 dark:text-zinc-300">
                    Annual CO₂e = [ (Beef meals × 3.3) + (Other meats × 0.69) + (Vegetarian meals × 0.35) ] × 52 × (1 + Waste % × 0.25)
                  </p>
                  <p className="mt-1 text-[11px] text-zinc-500">
                    Derived from Poore &amp; Nemecek 2018 (Science) database. Food waste multiplier penalizes waste factors by 0.25% surcharge per percent of waste.
                  </p>
                </div>
              </div>
            </details>

          </div>

          {/* Results Sidebar Display */}
          <div className="space-y-6">
            
            <div className="glass-card bg-emerald-950/20 dark:bg-emerald-950/10 border-emerald-500/20 p-6 text-center space-y-4">
              <div className="inline-flex p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                <Calculator className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Annual Footprint</h3>
                <div className="text-4xl font-extrabold text-white mt-1 tabular-nums">
                  {realTimeResults ? realTimeResults.annual.toLocaleString() : '---'}
                  <span className="text-sm font-semibold text-emerald-400 ml-1.5">kg CO₂e</span>
                </div>
              </div>

              {/* Monthly breakdown */}
              <div className="border-t border-emerald-500/10 pt-4 flex justify-between text-xs text-slate-300">
                <span>Monthly Average:</span>
                <span className="font-bold text-white tabular-nums">
                  {realTimeResults ? realTimeResults.monthly.toLocaleString() : '---'} kg
                </span>
              </div>

              {/* Benchmarking Comparison */}
              {realTimeResults && (
                <div className="bg-emerald-900/10 border border-emerald-500/15 p-4 rounded-xl space-y-2 text-left">
                  <div className="text-xs font-semibold text-slate-200">National Benchmarking</div>
                  
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>India Average:</span>
                    <span className="text-slate-200">1,900 kg</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>Global Average:</span>
                    <span className="text-slate-200">4,700 kg</span>
                  </div>

                  <div className="text-[11px] text-emerald-450 border-t border-emerald-500/10 pt-2 font-medium">
                    {realTimeResults.annual < 1900 ? (
                      <span>🎉 Your footprint is <strong>{(100 - (realTimeResults.annual / 1900) * 100).toFixed(0)}% lower</strong> than the national average!</span>
                    ) : (
                      <span>⚠️ Your footprint is <strong>{((realTimeResults.annual / 1900) * 100 - 100).toFixed(0)}% higher</strong> than the national average.</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Tips Box */}
            <div className="bg-zinc-100 dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
              <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">Calculation Tips</h3>
              <ul className="text-xs text-zinc-500 space-y-2 list-disc pl-4 leading-relaxed">
                <li>Calculate utility statistics based on your average monthly electricity bill.</li>
                <li>Commuter distances should include your daily travel to work or study.</li>
                <li>In corporate or shared households, energy consumption is divided by the household size automatically.</li>
              </ul>
            </div>

          </div>

        </div>
      </FormProvider>
    </div>
  );
}
