import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart2,
  Clock,
  Users,
  ExternalLink,
  Trash2,
  Globe,
  Lock,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '../lib/utils';

const statusConfig = {
  active:    { label: 'Live', className: 'bg-primary-container text-white', dot: 'bg-white/80' },
  expired:   { label: 'Expired', className: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  published: { label: 'Published', className: 'bg-primary/10 text-primary border border-primary/15', dot: 'bg-primary' },
};

export default function PollCard({ poll, onDelete }) {
  const status = poll.status || 'active';
  const config = statusConfig[status] || statusConfig.active;
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/p/${poll.shareId}`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const expiryDate = new Date(poll.expiresAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="bento-card group p-0 flex flex-col">
      {/* Header band */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-on-surface truncate text-base leading-snug">{poll.title}</h3>
            {poll.description && (
              <p className="text-sm text-on-surface-variant mt-0.5 line-clamp-1 opacity-70">{poll.description}</p>
            )}
          </div>
          <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shrink-0 shadow-sm', config.className)}>
            <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
            {config.label}
          </span>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant font-semibold mt-3">
          <span className="flex items-center gap-1 opacity-70">
            <Users size={12} />
            {poll.totalResponses ?? 0} responses
          </span>
          <span className="flex items-center gap-1 opacity-70">
            <Zap size={12} />
            {poll.questions?.length ?? 0} questions
          </span>
          <span className="flex items-center gap-1 opacity-70">
            <Clock size={12} />
            {expiryDate}
          </span>
          <span className="flex items-center gap-1 opacity-70">
            {poll.requireAuth ? <Lock size={12} /> : <Globe size={12} />}
            {poll.requireAuth ? 'Auth' : 'Public'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-black/[0.03] mt-auto flex items-center gap-0">
        <Link
          to={`/poll/${poll._id}/analytics`}
          className="flex-1 flex items-center justify-center gap-1.5 py-3.5 text-xs font-bold text-primary hover:bg-primary/5 transition-colors border-r border-black/[0.03]"
        >
          <BarChart2 size={13} /> Analytics
        </Link>
        <Link
          to={`/poll/${poll._id}/edit`}
          className="flex-1 flex items-center justify-center gap-1.5 py-3.5 text-xs font-bold text-on-surface-variant hover:bg-black/[0.03] transition-colors border-r border-black/[0.03]"
        >
          Edit
        </Link>
        <button
          onClick={copyLink}
          className="flex-1 flex items-center justify-center gap-1.5 py-3.5 text-xs font-bold text-on-surface-variant hover:bg-black/[0.03] transition-colors border-r border-black/[0.03]"
          title="Copy share link"
        >
          {copied ? <><CheckCircle2 size={13} className="text-emerald-500" /> Copied!</> : <><ExternalLink size={13} /> Share</>}
        </button>
        <button
          onClick={() => onDelete(poll._id)}
          className="flex items-center justify-center px-4 py-3.5 text-error hover:bg-error/5 transition-colors"
          title="Delete poll"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
