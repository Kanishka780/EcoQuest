'use client';

/**
 * @fileoverview AI Sustainability Coach page.
 *
 * Provides a chat interface to the rate-limited /api/ai/chat endpoint
 * (backed by Google Gemini) and renders structured recommendation cards
 * inline within the chat history.
 *
 * @module CoachPage
 */

import React, { useState, useRef, useCallback } from 'react';
import { useUserStore } from '../../../stores/useUserStore';
import { useFootprintStore } from '../../../stores/useFootprintStore';
import { Send, Sparkles, AlertCircle, Award, Footprints, Zap, CheckCircle2 } from 'lucide-react';
import { ShieldCheck } from 'lucide-react';

/** Difficulty level for an AI-recommended reduction action. */
type Difficulty = 'easy' | 'medium' | 'hard';

/** A single reduction recommendation returned by the AI coach. */
interface Recommendation {
  action: string;
  co2SavedKgPerYear: number;
  difficulty: Difficulty;
  timeframe: string;
  reason: string;
}

/** Full structured response from the /api/ai/chat endpoint. */
interface CoachResponse {
  summary: string;
  topSources: { category: string; percentage: number; insight: string }[];
  recommendations: Recommendation[];
  motivationalMessage: string;
  nextCheckIn: string;
}

/** A single entry in the visible chat history. */
interface ChatEntry {
  /** Stable unique ID used as the React list key. */
  id: string;
  sender: 'user' | 'coach';
  text: string;
  /** Present on coach entries that return structured data. */
  data?: CoachResponse;
}

/** Quick-start suggestions shown before the first user message. */
const SUGGESTIONS: readonly string[] = [
  'How can I reduce my transportation emissions?',
  'What are some low-carbon dietary swaps?',
  'How does switching to solar energy affect my footprint?',
  'What are quick shopping reductions I can make?',
];

/**
 * Maps a difficulty level to its Tailwind colour classes.
 *
 * @param level - The difficulty level to map.
 * @returns Tailwind class string for background and text colour.
 */
function difficultyClass(level: Difficulty): string {
  const map: Record<Difficulty, string> = {
    easy:   'text-emerald-500 bg-emerald-500/10',
    medium: 'text-amber-500  bg-amber-500/10',
    hard:   'text-red-500    bg-red-500/10',
  };
  return map[level];
}

/**
 * AI Sustainability Coach — Gemini-powered chat interface.
 *
 * Renders incoming coach messages as structured recommendation cards when
 * the API returns structured JSON, or as plain text for casual replies.
 *
 * @returns The coach page JSX element.
 */
export default function CoachPage() {
  const user         = useUserStore(state => state.user);
  const activeRecord  = useFootprintStore(state => state.activeRecord);

  const [prompt,      setPrompt]      = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  /** Auto-incrementing counter for stable, unique chat entry IDs. */
  const counterRef = useRef(0);

  /** Returns a new unique entry ID. */
  const nextId = useCallback((): string => {
    counterRef.current += 1;
    return `entry-${counterRef.current}`;
  }, []);

  const [chatHistory, setChatHistory] = useState<ChatEntry[]>(() => [
    {
      id: 'entry-0',
      sender: 'coach',
      text: 'Hello! I am your EcoQuest Sustainability Coach. Send me a question about your carbon footprint, or ask for reduction strategies tailored specifically to your profile!',
    },
  ]);

  /**
   * Submit the current prompt to the AI coach endpoint.
   *
   * @param e - The form submit event.
   */
  const handleSend = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed || !user) { return; }

    setError(null);
    setLoading(true);
    setPrompt('');

    setChatHistory(prev => [...prev, { id: nextId(), sender: 'user', text: trimmed }]);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: trimmed, userId: user.uid }),
      });

      const data: { error?: string } & Partial<CoachResponse> = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to fetch coach advice.');
      }

      setChatHistory(prev => [
        ...prev,
        {
          id:     nextId(),
          sender: 'coach',
          text:   data.summary ?? 'Here are my thoughts…',
          data:   data as CoachResponse,
        },
      ]);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Connection to Gemini Coach lost.';
      setError(message);
      setChatHistory(prev => [
        ...prev,
        { id: nextId(), sender: 'coach', text: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  }, [prompt, user, nextId]);

  /**
   * Pre-fill the input with a suggested question.
   *
   * @param text - The suggestion text to load into the prompt input.
   */
  const selectSuggestion = useCallback((text: string) => {
    setPrompt(text);
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Responsible AI Disclosure — 1M1B Guideline Requirement */}
      <div className="mb-4 p-4 bg-slate-900/60 border border-slate-700/50 rounded-xl flex items-start gap-3">
        <ShieldCheck className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
        <div className="space-y-0.5">
          <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Responsible AI Disclosure</p>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            This coach is powered by Google Gemini AI and uses <strong className="text-slate-300">prompt engineering</strong> to generate personalized sustainability guidance.
            Responses are AI-generated suggestions — not professional advice. All recommendations are based on
            publicly available IPCC and Indian government emission data.
            No personal data is shared with third parties. Your footprint data is stored securely in Firestore
            under your user account only.
          </p>
        </div>
      </div>

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center space-x-2">
          <Sparkles className="h-6 w-6 text-emerald-500 animate-float" aria-hidden="true" />
          <span>AI Sustainability Coach</span>
        </h1>
        <p className="text-sm text-zinc-500">
          Get real-time insights and tailored carbon-reduction roadmaps from our Gemini-powered ecological assistant.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* ── Chat column ─────────────────────────────────────────────── */}
        <section
          aria-label="Chat with AI sustainability coach"
          className="lg:col-span-2 flex flex-col h-[70vh] glass-card bg-white dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-800 overflow-hidden"
        >
          {/* Profile context strip */}
          <div className="p-3 border-b border-zinc-100 dark:border-zinc-800 bg-emerald-500/5 flex items-center justify-between text-xs">
            <span className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <Footprints className="h-4 w-4" aria-hidden="true" />
              <span>Profile-Aware Context</span>
            </span>
            <span className="text-zinc-400">
              {activeRecord
                ? `Footprint: ${activeRecord.results.annual} kg CO₂e`
                : 'No calculation profile linked'}
            </span>
          </div>

          {/* Chat log — role="log" tells screen readers to announce new entries */}
          <div
            role="log"
            aria-live="polite"
            aria-label="Chat history"
            className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4"
          >
            {chatHistory.map(chat => {
              const isCoach = chat.sender === 'coach';
              return (
                <div
                  key={chat.id}
                  className={`flex ${isCoach ? 'justify-start' : 'justify-end'} animate-fade-in`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                    isCoach
                      ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200/50 dark:border-zinc-800'
                      : 'bg-emerald-600 text-white font-medium shadow-md shadow-emerald-950/10'
                  }`}>
                    {chat.text}

                    {/* Structured recommendation cards */}
                    {isCoach && chat.data && (
                      <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
                        <div className="space-y-3">
                          <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-wider block">
                            Recommended Actions
                          </span>
                          <div className="grid grid-cols-1 gap-2">
                            {chat.data.recommendations?.map((rec, rIdx) => (
                              <div
                                key={`${chat.id}-rec-${rIdx}`}
                                className="p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-1 shadow-sm"
                              >
                                <div className="flex items-start justify-between">
                                  <span className="font-bold text-zinc-800 dark:text-zinc-200 text-xs">
                                    {rec.action}
                                  </span>
                                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${difficultyClass(rec.difficulty)}`}>
                                    {rec.difficulty}
                                  </span>
                                </div>
                                <p className="text-[10px] text-zinc-400">{rec.reason}</p>
                                <div className="flex items-center justify-between text-[9px] text-zinc-400 pt-1.5 border-t border-zinc-100 dark:border-zinc-900">
                                  <span>Timeframe: <strong>{rec.timeframe}</strong></span>
                                  <span className="text-emerald-500 font-bold">
                                    -{rec.co2SavedKgPerYear} kg CO₂/yr
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {chat.data.motivationalMessage && (
                          <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-start space-x-2">
                            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                            <span>{chat.data.motivationalMessage}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start">
                <div
                  role="status"
                  aria-label="Coach is generating a response"
                  className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-xs font-semibold text-zinc-400 flex items-center space-x-2"
                >
                  <div className="flex space-x-1" aria-hidden="true">
                    <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce" />
                    <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span>Gemini is generating personalised recommendations…</span>
                </div>
              </div>
            )}

            {error && (
              <div role="alert" className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl text-xs flex items-center space-x-2">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Quick-start suggestions */}
          {chatHistory.length <= 1 && (
            <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                Suggested Questions
              </span>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map(sug => (
                  <button
                    key={sug}
                    onClick={() => selectSuggestion(sug)}
                    className="text-[11px] text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 hover:text-emerald-500 px-3 py-1.5 rounded-full transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Prompt input */}
          <form
            onSubmit={handleSend}
            className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 flex items-center space-x-2.5"
          >
            <label htmlFor="coach-prompt" className="sr-only">
              Ask the sustainability coach
            </label>
            <input
              id="coach-prompt"
              type="text"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Ask for customised saving plans…"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-zinc-800 dark:text-zinc-100"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              aria-label="Send message to coach"
              className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-40"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </section>

        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <div className="space-y-6">
          <div className="glass-card bg-emerald-950/20 dark:bg-emerald-950/10 border-emerald-500/20 p-6 text-center space-y-4">
            <div className="inline-flex p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
              <Award className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Coach Rating</h2>
              <div className="text-2xl font-extrabold text-white mt-1">Sustainability Rank</div>
              <p className="text-xs text-emerald-400 font-bold mt-1">Active reductions roadmap linked</p>
            </div>
          </div>

          <div className="bg-zinc-100 dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 flex items-center space-x-2">
              <Zap className="h-4 w-4 text-amber-500" aria-hidden="true" />
              <span>Prompting Guideline</span>
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Refer to specific utilities or commute issues. E.g., &quot;I travel 20 km by diesel car, what public transit swaps exist in India?&quot; or &quot;How does beef compare to other meats?&quot;
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
