import React, { useState } from 'react';
import { useUserStore } from '../../stores/useUserStore';
import { ShieldCheck, Lock, Eye } from 'lucide-react';

export function PrivacyModal() {
  const acceptConsent = useUserStore(state => state.acceptPrivacyConsent);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      await acceptConsent();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-float"
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-title"
      >
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center space-x-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 id="privacy-title" className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Privacy Consent & Data Policy
            </h2>
            <p className="text-xs text-zinc-500">GDPR & Digital Personal Data Protection (DPDP) Act 2023 Compliant</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
          <p>
            Welcome to EcoQuest. Before we calculate and track your carbon footprint, we need your consent to collect and process your sustainability activities and household information.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-150 dark:border-zinc-800 flex items-start space-x-3">
              <Eye className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-zinc-800 dark:text-zinc-100 text-xs">What We Collect</h3>
                <p className="text-xs text-zinc-500 mt-1">Daily commute distances, monthly utility consumption, meal stats, and shopping activities.</p>
              </div>
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-150 dark:border-zinc-800 flex items-start space-x-3">
              <Lock className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-semibold text-zinc-800 dark:text-zinc-100 text-xs">How We Protect It</h3>
                <p className="text-xs text-zinc-500 mt-1">Data is stored in Firestore with secure access tokens. Secrets like Gemini keys remain server-side.</p>
              </div>
            </div>
          </div>

          <h3 className="font-bold text-zinc-800 dark:text-zinc-100 mt-4 text-xs">Key Privacy Rights Enforced:</h3>
          <ul className="list-disc pl-5 space-y-2 text-xs">
            <li>
              <strong>Right to Erasure (GDPR Art. 17 / DPDP Sec. 12)</strong>: You can delete your account and all calculation logs instantly from your dashboard profile settings.
            </li>
            <li>
              <strong>Purpose Limitation</strong>: Your footprint details are processed solely to provide recommendations and leaderboard aggregates.
            </li>
            <li>
              <strong>No Third-Party Sharing</strong>: Your personal metrics are never sold, rented, or shared with commercial entities.
            </li>
          </ul>

          <p className="text-xs text-zinc-500 italic mt-4">
            By clicking &quot;Accept &amp; Continue&quot;, you grant permission for EcoQuest to store and process your carbon data according to this policy. You can withdraw consent at any time by deleting your account.
          </p>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-55 dark:bg-zinc-900/20 flex justify-end">
          <button
            onClick={handleAccept}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Accept & Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
