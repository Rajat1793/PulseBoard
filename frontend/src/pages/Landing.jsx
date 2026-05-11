import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Zap, BarChart2, Clock, Globe, Shield, ArrowRight, TrendingUp,
} from 'lucide-react';
import BentoCard from '../components/BentoCard';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="bg-surface min-h-screen">
      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="px-6 pt-24 pb-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-[72px] font-black leading-[1.05] tracking-tight text-on-surface mb-6">
            Collect feedback<br />
            <span className="text-primary-container">that matters</span>
          </h1>

          <p className="text-lg text-on-surface-variant font-medium max-w-xl mx-auto mb-10 leading-relaxed opacity-70">
            Create polls in seconds, share a link, and watch responses arrive live with real-time analytics.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {user ? (
              <Link to="/dashboard" className="btn-primary text-base px-8 py-3.5 rounded-2xl">
                Open Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-base px-8 py-3.5 rounded-2xl">
                  Start for free <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn-secondary text-base px-8 py-3.5 rounded-2xl">
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Bento feature grid ─────────────────────────────────────── */}
      <section className="px-4 sm:px-6 pb-24 max-w-5xl mx-auto">
        <div className="grid grid-cols-12 gap-4">

          {/* Large: Create polls */}
          <BentoCard className="col-span-12 md:col-span-7 p-8 group hover:-translate-y-1 !bg-surface-container">
            <div className="w-12 h-12 bg-primary-container/15 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-container/25 transition-colors">
              <Zap size={22} className="text-primary-container" fill="currentColor" />
            </div>
            <h3 className="text-2xl font-black text-on-surface mb-2 tracking-tight">Create in minutes</h3>
            <p className="text-sm text-on-surface-variant font-medium opacity-70 leading-relaxed mb-8">
              Build polls with multiple questions, required toggles, and expiry times — instantly.
            </p>
            {/* Mock poll UI */}
            <div className="space-y-2.5">
              <div className="bg-[rgb(var(--clr-panel))] rounded-xl px-4 py-3 text-sm font-semibold text-on-surface border border-black/[0.05] dark:border-white/[0.05]">
                How satisfied are you with our product?
              </div>
              {[['Very satisfied', true], ['Satisfied', false], ['Neutral', false]].map(([opt, active]) => (
                <div
                  key={opt}
                  className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium border transition-all ${
                    active
                      ? 'bg-primary-container text-white border-transparent'
                      : 'bg-[rgb(var(--clr-panel))] border-black/[0.05] dark:border-white/[0.05] text-on-surface-variant'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${active ? 'border-white' : 'border-black/20 dark:border-white/20'}`}>
                    {active && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  {opt}
                </div>
              ))}
            </div>
          </BentoCard>

          {/* Large: Live analytics */}
          <BentoCard className="col-span-12 md:col-span-5 p-8 group hover:-translate-y-1 !bg-surface-container">
            <div className="w-12 h-12 bg-primary-container/15 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-container/25 transition-colors">
              <BarChart2 size={22} className="text-primary-container" />
            </div>
            <h3 className="text-2xl font-black text-on-surface mb-2 tracking-tight">Live analytics</h3>
            <p className="text-sm text-on-surface-variant font-medium opacity-70 leading-relaxed mb-8">
              Watch responses arrive in real-time via WebSockets.
            </p>
            {/* Mock bars */}
            <div className="space-y-4">
              {[['Very satisfied', 71], ['Satisfied', 19], ['Neutral', 10]].map(([label, pct]) => (
                <div key={label} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-on-surface-variant">{label}</span>
                    <span className="text-primary-container">{pct}%</span>
                  </div>
                  <div className="h-2.5 bg-[rgb(var(--clr-panel))] rounded-full overflow-hidden">
                    <div className="h-full bg-primary-container rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </BentoCard>

          {/* Small feature cards */}
          <BentoCard className="col-span-12 sm:col-span-6 md:col-span-4 p-7 group hover:-translate-y-1">
            <div className="w-10 h-10 bg-primary-container/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-container/20 transition-colors">
              <Globe size={18} className="text-primary-container" />
            </div>
            <h3 className="font-black text-on-surface mb-2">Share anywhere</h3>
            <p className="text-sm text-on-surface-variant font-medium opacity-60 leading-relaxed">
              Unique public link for every poll. Share via email, chat, or socials.
            </p>
          </BentoCard>

          <BentoCard className="col-span-12 sm:col-span-6 md:col-span-4 p-7 group hover:-translate-y-1">
            <div className="w-10 h-10 bg-primary-container/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-container/20 transition-colors">
              <Shield size={18} className="text-primary-container" />
            </div>
            <h3 className="font-black text-on-surface mb-2">Flexible auth</h3>
            <p className="text-sm text-on-surface-variant font-medium opacity-60 leading-relaxed">
              Anonymous or login-required responses — you control who can vote.
            </p>
          </BentoCard>

          <BentoCard className="col-span-12 sm:col-span-6 md:col-span-4 p-7 group hover:-translate-y-1">
            <div className="w-10 h-10 bg-primary-container/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-container/20 transition-colors">
              <Clock size={18} className="text-primary-container" />
            </div>
            <h3 className="font-black text-on-surface mb-2">Auto-expiry</h3>
            <p className="text-sm text-on-surface-variant font-medium opacity-60 leading-relaxed">
              Set a deadline — polls close automatically when the time is up.
            </p>
          </BentoCard>

          {/* CTA bento card */}
          <div className="col-span-12 rounded-2xl bg-primary-container p-10 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative">
            <div className="absolute right-0 bottom-0 opacity-[0.07] pointer-events-none">
              <TrendingUp size={280} className="text-white translate-x-16 translate-y-8" />
            </div>
            <div className="relative z-10">
              <h3 className="text-3xl font-black text-white mb-2 tracking-tight">Ready to start?</h3>
              <p className="text-white/70 font-medium">Create your first poll in under a minute — free.</p>
            </div>
            {user ? (
              <Link
                to="/dashboard"
                className="relative z-10 flex-shrink-0 inline-flex items-center gap-2 bg-white text-primary-container font-bold px-8 py-3.5 rounded-2xl hover:brightness-95 transition-all shadow-xl text-base"
              >
                Open Dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <Link
                to="/register"
                className="relative z-10 flex-shrink-0 inline-flex items-center gap-2 bg-white text-primary-container font-bold px-8 py-3.5 rounded-2xl hover:brightness-95 transition-all shadow-xl text-base"
              >
                Get started free <ArrowRight size={18} />
              </Link>
            )}
          </div>

        </div>
      </section>
    </div>
  );
}

