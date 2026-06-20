'use client';

import React, { useState } from 'react';
import { useUserStore } from '../../../stores/useUserStore';
import { useFootprintStore } from '../../../stores/useFootprintStore';
import { Send, Sparkles, AlertCircle, Award, Footprints, Zap, CheckCircle2 } from 'lucide-react';

interface Recommendation {
  action: string;
  co2SavedKgPerYear: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeframe: string;
  reason: string;
}

interface CoachResponse {
  summary: string;
  topSources: { category: string; percentage: number; insight: string }[];
  recommendations: Recommendation[];
  motivationalMessage: string;
  nextCheckIn: string;
}

export default function CoachPage() {
  const user = useUserStore(state => state.user);
  const activeRecord = useFootprintStore(state => state.activeRecord);
  
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'coach'; text: string; data?: CoachResponse }[]>([
    {
      sender: 'coach',
      text: "Hello! I am your EcoQuest Sustainability Coach. Send me a question about your carbon footprint, or ask for reduction strategies tailored specifically to your profile!"
    }
  ]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !user) return;

    setError(null);
    setLoading(true);
    const userMessage = prompt;
    setPrompt('');
    
    // Add to chat list
    setChatHistory(prev => [...prev, { sender: 'user', text: userMessage }]);

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userMessage,
          userId: user.uid
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch coach advice.');
      }

      setChatHistory(prev => [
        ...prev, 
        { 
          sender: 'coach', 
          text: data.summary,
          data: data
        }
      ]);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Connection to Gemini Coach lost.';
      setError(errorMsg);
      setChatHistory(prev => [
        ...prev,
        { sender: 'coach', text: "Sorry, I encountered an error. Please try again." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const selectSuggestion = (text: string) => {
    setPrompt(text);
  };

  const suggestions = [
    "How can I reduce my transportation emissions?",
    "What are some low-carbon dietary swaps?",
    "How does switching to solar energy affect my footprint?",
    "What are quick shopping reductions I can make?"
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center space-x-2">
          <Sparkles className="h-6 w-6 text-emerald-500 animate-float" />
          <span>AI Sustainability Coach</span>
        </h1>
        <p className="text-sm text-zinc-500">
          Get real-time insights and tailored carbon-reduction roadmaps from our Gemini-powered ecological assistant.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Chat Interface Column */}
        <div className="lg:col-span-2 flex flex-col h-[70vh] glass-card bg-white dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-800 overflow-hidden">
          
          {/* Active Record Indicator */}
          <div className="p-3 border-b border-zinc-150 dark:border-zinc-850 bg-emerald-500/5 flex items-center justify-between text-xs">
            <span className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <Footprints className="h-4 w-4" />
              <span>Profile-Aware Context</span>
            </span>
            <span className="text-zinc-400">
              {activeRecord 
                ? `Footprint: ${activeRecord.results.annual} kg CO2e` 
                : "No calculation profile linked"
              }
            </span>
          </div>

          {/* Chat History Panel */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
            {chatHistory.map((chat, idx) => {
              const isCoach = chat.sender === 'coach';
              return (
                <div key={idx} className={`flex ${isCoach ? 'justify-start' : 'justify-end'} animate-fade-in`}>
                  <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                    isCoach 
                      ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-850 dark:text-zinc-200 border border-zinc-200/50 dark:border-zinc-800' 
                      : 'bg-emerald-600 text-white font-medium shadow-md shadow-emerald-950/10'
                  }`}>
                    {chat.text}

                    {/* Render Structured Advice Cards inside the Chat Node if available */}
                    {isCoach && chat.data && (
                      <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
                        
                        {/* Recommendation List */}
                        <div className="space-y-3">
                          <span className="text-[10px] font-bold text-emerald-500 dark:text-emerald-450 uppercase tracking-wider block">Recommended Actions</span>
                          <div className="grid grid-cols-1 gap-2">
                            {chat.data.recommendations?.map((rec, rIdx) => (
                              <div key={rIdx} className="p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl space-y-1 shadow-sm">
                                <div className="flex items-start justify-between">
                                  <span className="font-bold text-zinc-800 dark:text-zinc-250 text-xs">{rec.action}</span>
                                  <span className="text-[9px] font-extrabold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase">{rec.difficulty}</span>
                                </div>
                                <p className="text-[10px] text-zinc-400">{rec.reason}</p>
                                <div className="flex items-center justify-between text-[9px] text-zinc-400 pt-1.5 border-t border-zinc-100 dark:border-zinc-900">
                                  <span>Timeframe: <strong>{rec.timeframe}</strong></span>
                                  <span className="text-emerald-500 font-bold">-{rec.co2SavedKgPerYear} kg CO2/yr</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Motivational Alert */}
                        {chat.data.motivationalMessage && (
                          <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/10 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-start space-x-2">
                            <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5" />
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
                <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-xs font-semibold text-zinc-400 flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce"></span>
                    <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span>Gemini is generating personalized recommendations...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-xl text-xs flex items-center space-x-2">
                <AlertCircle className="h-4.5 w-4.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Suggestions Tray */}
          {chatHistory.length <= 1 && (
            <div className="p-4 border-t border-zinc-150 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-900/30">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">Suggested Questions</span>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => selectSuggestion(sug)}
                    className="text-[11px] text-zinc-650 dark:text-zinc-350 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 hover:text-emerald-500 dark:hover:border-emerald-550 px-3 py-1.5 rounded-full transition-all focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form input bar */}
          <form onSubmit={handleSend} className="p-4 border-t border-zinc-150 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950/40 flex items-center space-x-2.5">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-zinc-800 dark:text-zinc-100"
              placeholder="Ask for customized saving plans..."
              aria-label="Coach prompt query"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-40"
              aria-label="Submit coach prompt query"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </form>

        </div>

        {/* Sidebar recommendations stats */}
        <div className="space-y-6">
          <div className="glass-card bg-emerald-950/20 dark:bg-emerald-950/10 border-emerald-500/20 p-6 text-center space-y-4">
            <div className="inline-flex p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
              <Award className="h-6 w-6" />
            </div>
            
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Coach Rating</h3>
              <div className="text-2xl font-extrabold text-white mt-1">Sustainability Rank</div>
              <p className="text-xs text-emerald-400 font-bold mt-1">
                Active reductions roadmap linked
              </p>
            </div>
          </div>

          <div className="bg-zinc-100 dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
            <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200 flex items-center space-x-2">
              <Zap className="h-4.5 w-4.5 text-amber-505" />
              <span>Prompting Guideline</span>
            </h3>
            <p className="text-xs text-zinc-550 leading-relaxed">
              When querying the coach, refer directly to specific utilities or commute issues. E.g., &quot;I travel 20km by diesel car, what public transit swaps exist in India?&quot; or &quot;How does beef compared to other meats?&quot;.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
