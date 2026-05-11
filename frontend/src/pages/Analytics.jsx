import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../utils/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import BentoCard from '../components/BentoCard';
import {
  BarChart2,
  Users,
  Clock,
  Globe,
  Lock,
  Copy,
  CheckCircle2,
  Wifi,
  WifiOff,
  ChevronLeft,
  Send,
  TrendingUp,
  Zap,
  MoreVertical,
} from 'lucide-react';

function OptionBar({ label, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end font-bold text-sm">
        <span className="text-on-surface tracking-tight truncate max-w-[70%]">{label}</span>
        <span className="text-primary">{pct}% ({count})</span>
      </div>
      <div className="h-4 w-full bg-surface-container rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-primary-container transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function Analytics() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [liveConnected, setLiveConnected] = useState(false);
  const [liveCount, setLiveCount] = useState(null);
  const socketRef = useRef(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await api.get(`/polls/${id}/analytics`);
      setAnalytics(res.data.data);
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAnalytics();

    const socket = io('/', { transports: ['websocket', 'polling'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setLiveConnected(true);
      socket.emit('join-poll', id);
    });
    socket.on('disconnect', () => setLiveConnected(false));
    socket.on('analytics-update', (updated) => {
      setAnalytics(updated);
      setLiveCount(updated.totalResponses);
    });
    socket.on('new-response', ({ totalResponses }) => {
      setLiveCount(totalResponses);
      toast.success('New response received!', { icon: '📊', duration: 2500 });
    });
    socket.on('poll-published', () => {
      toast.success('Poll results are now public!');
      fetchAnalytics();
    });

    return () => {
      socket.emit('leave-poll', id);
      socket.disconnect();
    };
  }, [id, fetchAnalytics]);

  const handlePublish = async () => {
    if (!window.confirm('Publish results? Anyone with the link will be able to see the results. This cannot be undone.')) return;
    setPublishing(true);
    try {
      await api.post(`/polls/${id}/publish`);
      toast.success('Results published!');
      fetchAnalytics();
    } catch {
      toast.error('Failed to publish');
    } finally {
      setPublishing(false);
    }
  };

  const copyLink = () => {
    if (!analytics?.poll?.shareId) return;
    const url = `${window.location.origin}/p/${analytics.poll.shareId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!analytics) return null;

  const { poll, totalResponses, anonymousResponses, authenticatedResponses, questions } = analytics;
  const completionRate =
    questions.length > 0
      ? Math.round(
          (questions.reduce((s, q) => s + q.responseCount, 0) /
            (questions.length * (totalResponses || 1))) *
            100
        )
      : 0;

  const shareUrl = `${window.location.origin}/p/${poll.shareId}`;

  return (
    <div className="max-w-[1440px] mx-auto pb-12">
      {/* Header */}
      <header className="flex justify-between items-end mb-12">
        <div>
          <button onClick={() => navigate('/dashboard')} className="btn-ghost mb-4 text-sm pl-0">
            <ChevronLeft size={16} /> Dashboard
          </button>
          <p className="text-primary font-bold uppercase tracking-[0.2em] text-[10px] mb-2">Live Analytics Feed</p>
          <h2 className="font-extrabold text-3xl lg:text-4xl text-on-surface tracking-tight">
            {poll.title}
          </h2>
          <div className="flex items-center gap-4 mt-3">
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${liveConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-black/5 text-on-surface-variant'}`}>
              {liveConnected ? <><Wifi size={12} /><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" /></span>Live</> : <><WifiOff size={12} /> Offline</>}
            </span>
            <span className="text-on-surface-variant text-sm font-medium flex items-center gap-1 opacity-70">
              <Clock size={13} />
              {new Date(poll.expiresAt) > new Date()
                ? `Expires ${new Date(poll.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                : 'Expired'}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={copyLink} className="btn-secondary">
            {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          {!poll.isPublished ? (
            <button
              onClick={handlePublish}
              disabled={publishing || totalResponses === 0}
              className="btn-primary"
              title={totalResponses === 0 ? 'Need at least 1 response to publish' : ''}
            >
              {publishing ? <LoadingSpinner size="sm" /> : <Send size={16} />}
              Publish Results
            </button>
          ) : (
            <a href={`/p/${poll.shareId}/results`} target="_blank" rel="noreferrer" className="btn-primary">
              View Public Results
            </a>
          )}
        </div>
      </header>

      {/* Top Bar */}
      <div className="flex justify-between items-center mb-12 -mt-6">
        <div className="flex items-center gap-2 text-on-surface-variant font-medium text-sm">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          Live Data Syncing
        </div>
        <div className="text-xs font-bold text-on-surface-variant bg-surface-container px-4 py-2 rounded-xl border border-black/[0.03]">
          Share: <span className="text-primary">{shareUrl}</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Stats */}
        <BentoCard className="col-span-12 md:col-span-4 flex items-center justify-between p-8">
          <div>
            <p className="text-on-surface-variant font-bold text-[10px] uppercase tracking-widest opacity-60 mb-1">Total Responses</p>
            <h3 className="text-5xl font-black text-on-surface">{liveCount ?? totalResponses}</h3>
            <p className="text-primary font-bold text-[11px] mt-1">
              {anonymousResponses} anonymous · {authenticatedResponses} authenticated
            </p>
          </div>
          <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center text-primary-container">
            <TrendingUp size={32} />
          </div>
        </BentoCard>

        <BentoCard className="col-span-12 md:col-span-4 flex items-center justify-between p-8">
          <div>
            <p className="text-on-surface-variant font-bold text-[10px] uppercase tracking-widest opacity-60 mb-1">Completion Rate</p>
            <h3 className="text-5xl font-black text-on-surface">{completionRate}%</h3>
            <p className="text-primary font-bold text-[11px] mt-1">{questions.length} questions</p>
          </div>
          <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center text-primary-container">
            <Zap size={32} fill="currentColor" />
          </div>
        </BentoCard>

        <BentoCard className="col-span-12 md:col-span-4 bg-primary-container p-8 shadow-[0_10px_30px_rgba(205,80,40,0.18)] text-white border-none">
          <p className="font-bold text-[10px] uppercase tracking-widest opacity-70 mb-1">Poll Status</p>
          <h3 className="text-5xl font-black">{poll.isPublished ? 'Published' : new Date(poll.expiresAt) > new Date() ? 'Active' : 'Expired'}</h3>
          <p className="font-bold text-sm opacity-80 mt-3 flex items-center gap-2">
            {poll.requireAuth ? <><Lock size={14} /> Auth Required</> : <><Globe size={14} /> Public</>}
          </p>
        </BentoCard>

        {/* Questions breakdown */}
        {totalResponses === 0 ? (
          <BentoCard className="col-span-12 p-12 text-center">
            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart2 size={36} className="text-primary-container" />
            </div>
            <h3 className="font-bold text-on-surface text-xl mb-2">No responses yet</h3>
            <p className="text-on-surface-variant opacity-60 font-medium">
              Share the poll link to start collecting responses. Analytics will appear here in real-time.
            </p>
            <button onClick={copyLink} className="btn-primary mt-6">
              <Copy size={16} /> Copy Poll Link
            </button>
          </BentoCard>
        ) : (
          <>
            <div className="col-span-12 mt-4 flex justify-between items-center px-2">
              <h3 className="text-2xl font-bold text-on-surface">Question Breakdown</h3>
              <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest bg-surface-container px-4 py-2 rounded-xl">{totalResponses} Total Responses</span>
            </div>
            {questions.map((q, i) => (
              <BentoCard key={q.questionId} className="col-span-12 lg:col-span-6 p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest block mb-2">Q{i + 1} · {q.isRequired ? 'Required' : 'Optional'}</span>
                    <h4 className="text-xl font-bold text-on-surface leading-snug">{q.text}</h4>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-xs font-bold text-on-surface-variant opacity-60">{q.responseCount} answered</p>
                    {q.skippedCount > 0 && <p className="text-xs font-bold text-amber-500">{q.skippedCount} skipped</p>}
                  </div>
                </div>
                <div className="space-y-6">
                  {q.options.map((opt) => (
                    <OptionBar key={opt} label={opt} count={q.optionCounts[opt] || 0} total={q.responseCount} />
                  ))}
                </div>
              </BentoCard>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
