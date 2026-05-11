import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import BentoCard from '../components/BentoCard';
import { cn } from '../lib/utils';
import { BarChart2, Users, Globe, Lock, AlertCircle, CheckCircle2, Award, Share2, Rocket } from 'lucide-react';

function OptionBar({ label, count, total, isTop }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end font-bold text-sm">
        <span className={cn('flex items-center gap-2 truncate max-w-[70%]', isTop ? 'text-primary' : 'text-on-surface')}>
          {isTop && <CheckCircle2 size={14} className="text-primary shrink-0" />}
          {label}
        </span>
        <span className={cn('ml-2', isTop ? 'text-primary' : 'text-on-surface-variant opacity-50')}>
          {pct}% ({count})
        </span>
      </div>
      <div className="h-4 bg-surface-container rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', isTop ? 'bg-primary-container' : 'bg-primary/20')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function PublishedResults() {
  const { shareId } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/responses/results/${shareId}`);
        setAnalytics(res.data.data);
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to load results';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <BentoCard className="max-w-md w-full text-center py-12 px-8">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={28} className="text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-on-surface mb-3">Results unavailable</h2>
          <p className="text-on-surface-variant opacity-70 font-medium leading-relaxed">{error}</p>
          <Link to="/" className="btn-ghost mt-8">Go Home</Link>
        </BentoCard>
      </div>
    );
  }

  if (!analytics) return null;

  const { poll, totalResponses, anonymousResponses, authenticatedResponses, questions } = analytics;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 pb-20 space-y-10">
      {/* Hero section */}
      <div className="space-y-6">
        <div className="inline-flex items-center gap-3 bg-primary-container text-white px-5 py-2 rounded-full font-bold text-xs uppercase tracking-widest shadow-lg">
          <Award size={14} fill="currentColor" /> Results Published
        </div>
        <h1 className="text-5xl font-black text-on-surface tracking-tight leading-tight">
          {poll.title}
        </h1>
        {poll.description && (
          <p className="text-xl font-medium text-on-surface-variant opacity-60 leading-relaxed max-w-2xl">
            {poll.description}
          </p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          {[
            { label: 'Total Responses', value: totalResponses, icon: Users },
            { label: 'Anonymous', value: anonymousResponses, icon: Globe },
            { label: 'Authenticated', value: authenticatedResponses, icon: Lock },
            { label: 'Questions', value: questions.length, icon: BarChart2 },
          ].map(({ label, value, icon: Icon }) => (
            <BentoCard key={label} className="p-6">
              <Icon size={18} className="text-primary mb-3" />
              <p className="text-3xl font-black text-on-surface">{value}</p>
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-50 mt-1">{label}</p>
            </BentoCard>
          ))}
        </div>
      </div>

      {/* Questions */}
      {totalResponses === 0 ? (
        <BentoCard className="text-center py-16">
          <BarChart2 size={36} className="text-on-surface-variant opacity-20 mx-auto mb-4" />
          <p className="text-on-surface-variant font-medium opacity-60">No responses were collected for this poll.</p>
        </BentoCard>
      ) : (
        <section className="space-y-6">
          <h2 className="text-3xl font-black text-primary tracking-tight">Results Breakdown</h2>
          {questions.map((q, i) => {
            const maxCount = Math.max(...Object.values(q.optionCounts));
            return (
              <BentoCard key={q.questionId} className="p-8">
                <div className="flex items-start justify-between gap-3 mb-8">
                  <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest block mb-2">
                      Question {i + 1}
                    </span>
                    <h3 className="font-bold text-on-surface text-xl leading-snug">{q.text}</h3>
                  </div>
                  <span className="text-xs font-bold text-on-surface-variant bg-surface-container px-4 py-1.5 rounded-xl opacity-60 shrink-0">{q.responseCount} votes</span>
                </div>
                <div className="space-y-5">
                  {q.options.map((opt) => {
                    const count = q.optionCounts[opt] || 0;
                    const isTop = count === maxCount && maxCount > 0;
                    return (
                      <OptionBar
                        key={opt}
                        label={opt}
                        count={count}
                        total={q.responseCount}
                        isTop={isTop}
                      />
                    );
                  })}
                </div>
              </BentoCard>
            );
          })}
        </section>
      )}

      {/* CTA */}
      <div className="relative rounded-[48px] bg-primary-container p-12 text-center shadow-[0_20px_60px_-15px_rgba(205,80,40,0.3)] overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <Rocket size={300} className="text-white absolute -bottom-10 -right-10 rotate-12" />
        </div>
        <div className="relative z-10 space-y-6">
          <h2 className="text-white text-4xl font-black tracking-tight">Run your own poll</h2>
          <p className="text-white/80 text-lg font-medium leading-relaxed max-w-lg mx-auto">
            Create polls, collect responses in real-time, and publish results — all with PulseBoard.
          </p>
          <Link to="/register" className="inline-block bg-white text-primary-container px-12 py-5 rounded-3xl font-black text-xl shadow-2xl hover:scale-[1.04] active:scale-95 transition-all">
            Get started free
          </Link>
        </div>
      </div>
    </div>
  );
}
