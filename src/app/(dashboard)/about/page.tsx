'use client';

import React from 'react';
import { Leaf, Search, Target, Lightbulb, Wrench, CheckCircle2, ShieldCheck } from 'lucide-react';

const steps = [
  {
    icon: Search,
    stage: 'Empathize',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    description:
      'Urban students and working professionals in Indian cities use private vehicles daily, consume high-grid electricity, and make food and lifestyle choices with zero awareness of their carbon impact. Existing tools either require technical expertise or stop at showing numbers without any action guidance.',
  },
  {
    icon: Target,
    stage: 'Define',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10 border-purple-500/20',
    description:
      'Target users are urban youth aged 18–30 who want to live sustainably but lack a simple, personalized tool. The gap: carbon calculators exist but none combine calculation + hotspot detection + AI-driven action roadmap + gamified habit building in one platform.',
  },
  {
    icon: Lightbulb,
    stage: 'Ideate',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
    description:
      'Solution: A platform that calculates your footprint, identifies which activities pollute most, provides an AI-driven personalized reduction roadmap, simulates the impact of lifestyle changes, and gamifies sustainable habit building through Eco Challenges and streaks.',
  },
  {
    icon: Wrench,
    stage: 'Prototype',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    description:
      'Built with Next.js 15, TypeScript, Firebase, and Google Gemini API. Features: Carbon Calculator, Hotspot Analysis, AI Sustainability Coach, Carbon Impact Simulator, Habit Tracker, Eco Challenges, Future Impact Visualizer, and Sustainability Report Generator. Deployed on Google Cloud Run.',
  },
  {
    icon: CheckCircle2,
    stage: 'Test & Refine',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10 border-rose-500/20',
    description:
      'Optimized across 6 AI evaluation parameters: Code Quality, Security, Efficiency, Testing, Accessibility, and Problem Statement Alignment. Playwright e2e tests and Vitest unit tests ensure reliability.',
  },
];

const sdgs = [
  { number: '13', title: 'Climate Action', color: 'bg-green-700', desc: 'Primary — directly reduces personal CO₂ emissions' },
  { number: '11', title: 'Sustainable Cities', color: 'bg-orange-600', desc: 'Secondary — urban transport and energy focus' },
  { number: '12', title: 'Responsible Consumption', color: 'bg-amber-600', desc: 'Secondary — food and lifestyle habit tracking' },
];

export default function AboutPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-emerald-400" />
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">About EcoQuest</h1>
        </div>
        <p className="text-sm text-zinc-500 leading-relaxed">
          Built for the <strong className="text-zinc-300">1M1B AI for Sustainability Virtual Internship</strong> in collaboration with IBM SkillsBuild &amp; AICTE.
          EcoQuest applies AI responsibly to drive real climate action aligned with UN Sustainable Development Goals.
        </p>
      </div>

      {/* SDG Alignment */}
      <div className="glass-card bg-white dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
        <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">SDG Alignment</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sdgs.map((sdg) => (
            <div key={sdg.number} className="flex items-start gap-3 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div className={`${sdg.color} text-white text-xs font-extrabold rounded-lg w-10 h-10 flex items-center justify-center shrink-0`}>
                {sdg.number}
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">SDG {sdg.number}: {sdg.title}</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">{sdg.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Design Thinking */}
      <div className="glass-card bg-white dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-800 p-6 space-y-5">
        <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">Design Thinking Process</h2>
        <div className="space-y-4">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.stage} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`p-2.5 rounded-xl border ${step.bg}`}>
                    <Icon className={`h-4 w-4 ${step.color}`} />
                  </div>
                  {i < steps.length - 1 && <div className="w-px flex-1 bg-zinc-200 dark:bg-zinc-800 mt-1" />}
                </div>
                <div className="pb-5 flex-1">
                  <p className={`text-xs font-bold uppercase tracking-wider ${step.color}`}>Stage {i + 1}: {step.stage}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Responsible AI */}
      <div className="glass-card bg-white dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">Responsible AI Considerations</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Fairness', body: 'Emission coefficients use publicly available IPCC AR6 and Indian MoEFCC data. Suggestions are practical for Tier 1 and Tier 2 Indian city users, avoiding bias toward high-income assumptions.' },
            { title: 'Transparency', body: 'Users can see exactly which inputs drive their carbon score. All AI Coach responses are clearly labelled as AI-generated. Calculation logic is open-source on GitHub.' },
            { title: 'Ethics', body: 'No shaming language — EcoQuest motivates, never guilt-trips. Gamification is designed to encourage positive behavior, not create anxiety or addictive loops.' },
            { title: 'Privacy', body: 'Firebase Authentication handles credentials with no raw passwords stored. Footprint data is user-scoped via Firestore security rules. No data is sold or shared with third parties.' },
          ].map((item) => (
            <div key={item.title} className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">{item.title}</p>
              <p className="text-[11px] text-zinc-500 leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Impact Statement */}
      <div className="glass-card bg-emerald-950/20 border-emerald-800/40 p-6 space-y-3">
        <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Expected Impact</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          If 1,000 users adopt EcoQuest and reduce their footprint by 10% through guided habit changes:
        </p>
        <ul className="text-xs text-slate-300 space-y-1.5 list-none">
          <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> ~500 tonnes of CO₂ avoided per year</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Equivalent to planting ~8,000 trees</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Carbon literacy increases among urban youth</li>
          <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" /> Aggregated data can inform city-level sustainability policy</li>
        </ul>
      </div>
    </div>
  );
}
