import Link from 'next/link';
import { Leaf, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900 text-white font-sans text-center relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none"></div>
      
      <div className="z-10 space-y-5 max-w-sm">
        <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 mb-2 animate-float">
          <Leaf className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">404 - Page Not Found</h2>
        <p className="text-sm text-slate-400 leading-relaxed">
          The ecological pathway you are trying to visit does not exist or has been relocated to another coordinate.
        </p>
        <div className="pt-2">
          <Link href="/" className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors focus:outline-none">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
