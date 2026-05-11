import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import BentoCard from '../components/BentoCard';
import { cn } from '../lib/utils';
import {
  Clock,
  Globe,
  Lock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Radio,
  Send,
  Zap,
} from 'lucide-react';

function CountdownBadge({ expiresAt }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const tick = () => {
      const diff = new Date(expiresAt) - new Date();
      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(
        h > 0 ? `${h}h ${m}m remaining` : m > 0 ? `${m}m ${s}s remaining` : `${s}s remaining`
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return (
    <span className="flex items-center gap-1.5 bg-[rgb(var(--clr-panel))] border border-black/[0.06] dark:border-white/[0.06] text-on-surface-variant text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">
      <Clock size={12} /> {timeLeft}
    </span>
  );
}

export default function PublicPoll() {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchPoll = async () => {
      try {
        const res = await api.get(`/polls/public/${shareId}`);
        const p = res.data.data;
        if (p.isPublished) {
          navigate(`/p/${shareId}/results`, { replace: true });
          return;
        }
        setPoll(p);
      } catch {
        toast.error('Poll not found');
      } finally {
        setLoading(false);
      }
    };
    fetchPoll();
  }, [shareId, navigate]);

  const isExpired = poll && new Date() > new Date(poll.expiresAt);

  const setAnswer = (questionId, option) => {
    setAnswers((p) => ({ ...p, [questionId]: option }));
    setErrors((e) => ({ ...e, [questionId]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!poll) return e;
    poll.questions.forEach((q) => {
      if (q.isRequired && !answers[q._id]) {
        e[q._id] = 'This question is required';
      }
    });
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error('Please answer all required questions');
      return;
    }

    const payload = {
      answers: Object.entries(answers).map(([questionId, selectedOption]) => ({
        questionId,
        selectedOption,
      })),
    };

    setSubmitting(true);
    try {
      await api.post(`/responses/${shareId}`, payload);
      setSubmitted(true);
      toast.success('Response submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={36} className="text-on-surface-variant opacity-40" />
          </div>
          <h2 className="text-2xl font-bold text-on-surface mb-2">Poll not found</h2>
          <p className="text-on-surface-variant opacity-60 mb-6">This link may be invalid or removed.</p>
          <Link to="/" className="btn-primary">Go Home</Link>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <BentoCard className="max-w-md w-full text-center py-12 px-8">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock size={28} className="text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-on-surface mb-3">Poll has ended</h2>
          <p className="text-on-surface-variant opacity-70 font-medium leading-relaxed">
            This poll expired on{' '}
            {new Date(poll.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}.
            No more responses are accepted.
          </p>
        </BentoCard>
      </div>
    );
  }

  if (poll.requireAuth && !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <BentoCard className="max-w-md w-full text-center py-12 px-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={28} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-on-surface mb-3">Login required</h2>
          <p className="text-on-surface-variant opacity-70 font-medium leading-relaxed mb-8">
            The creator of this poll requires you to be logged in before responding.
          </p>
          <Link to={`/login?redirect=/p/${shareId}`} className="btn-primary text-base px-8 py-3">
            Log in to respond <ChevronRight size={15} />
          </Link>
        </BentoCard>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <BentoCard className="max-w-md w-full text-center py-16 px-8">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={36} className="text-emerald-500" />
          </div>
          <h2 className="text-3xl font-black text-on-surface mb-3 tracking-tight">Thanks for voting!</h2>
          <p className="text-on-surface-variant opacity-70 font-medium leading-relaxed">
            Your response has been recorded. Results will be shared once the poll creator publishes them.
          </p>
          <Link to="/" className="btn-ghost mt-8">Back to Home</Link>
        </BentoCard>
      </div>
    );
  }

  const answered = Object.keys(answers).length;
  const total = poll.questions.length;

  return (
    <div className="min-h-[calc(100vh-73px)] bg-surface">
      <main className="pt-12 pb-20 px-6 max-w-3xl mx-auto">
        {/* Hero */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-8 flex-wrap">
            <span className="bg-primary-container text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-2 shadow-lg">
              <Radio size={12} fill="currentColor" className="animate-pulse" /> Live Poll
            </span>
            <CountdownBadge expiresAt={poll.expiresAt} />
            {poll.requireAuth ? (
              <span className="flex items-center gap-1.5 bg-[rgb(var(--clr-panel))] border border-black/5 dark:border-white/[0.06] text-on-surface-variant text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                <Lock size={12} /> Auth Required
              </span>
            ) : (
              <span className="flex items-center gap-1.5 bg-[rgb(var(--clr-panel))] border border-black/5 dark:border-white/[0.06] text-on-surface-variant text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                <Globe size={12} /> Public
              </span>
            )}
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-on-surface mb-4 tracking-tight leading-tight">
            {poll.title}
          </h2>
          {poll.description && (
            <p className="text-lg font-medium text-on-surface-variant opacity-60 leading-relaxed">
              {poll.description}
            </p>
          )}

          {/* Progress */}
          <div className="mt-8">
            <div className="flex justify-between text-xs font-bold text-on-surface-variant opacity-60 mb-2">
              <span>{answered}/{total} answered</span>
              <span>{Math.round((answered / total) * 100)}% complete</span>
            </div>
            <div className="h-2 bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-container rounded-full transition-all duration-500"
                style={{ width: `${(answered / total) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Questions */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {poll.questions.map((q, i) => (
            <BentoCard
              key={q._id}
              className={cn(
                'p-8',
                errors[q._id] ? 'ring-2 ring-error/20 border-error/20' : ''
              )}
            >
              <div className="mb-6">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">
                  Question {i + 1} {q.isRequired && <span className="text-error">*</span>}
                </p>
                <p className="font-bold text-on-surface text-xl leading-snug">{q.text}</p>
                {errors[q._id] && (
                  <p className="text-error text-xs mt-2 flex items-center gap-1 font-semibold">
                    <AlertCircle size={12} /> {errors[q._id]}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {q.options.map((opt) => {
                  const selected = answers[q._id] === opt;
                  return (
                    <label
                      key={opt}
                      className={cn(
                        'flex items-center gap-4 p-5 rounded-2xl border cursor-pointer transition-all duration-200 font-bold text-sm',
                        selected
                          ? 'border-primary-container bg-primary-container text-white scale-[1.01] shadow-[0_8px_20px_rgba(205,80,40,0.18)]'
                          : 'border-black/[0.04] bg-[rgb(var(--clr-panel))] hover:border-primary-container/30 hover:bg-primary-container/5 text-on-surface'
                      )}
                    >
                      <div className={cn(
                        'w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all',
                        selected ? 'border-white bg-white/20' : 'border-primary-container/30'
                      )}>
                        {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <input
                        type="radio"
                        name={q._id}
                        value={opt}
                        checked={selected}
                        onChange={() => setAnswer(q._id, opt)}
                        className="sr-only"
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
            </BentoCard>
          ))}

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary-container text-white px-16 py-6 rounded-full text-xl font-black shadow-[0_15px_40px_rgba(205,80,40,0.25)] hover:scale-[1.04] active:scale-95 transition-all flex items-center gap-3 disabled:opacity-60"
            >
              {submitting ? <LoadingSpinner size="sm" /> : <><Send size={22} /> Submit Vote</>}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
