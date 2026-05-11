import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import BentoCard from '../components/BentoCard';
import { cn } from '../lib/utils';
import {
  Plus,
  Trash2,
  ChevronLeft,
  GripVertical,
  AlertCircle,
  Rocket,
  X,
  CheckCircle2,
} from 'lucide-react';

const genId = () => Math.random().toString(36).slice(2);

const emptyQuestion = () => ({
  _tempId: genId(),
  text: '',
  isRequired: true,
  options: ['', ''],
});

const defaultForm = () => ({
  title: '',
  description: '',
  expiresAt: '',
  requireAuth: false,
  questions: [emptyQuestion()],
});

export default function CreatePoll({ editMode = false }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(defaultForm());
  const [loading, setLoading] = useState(editMode);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch existing poll in edit mode
  useEffect(() => {
    if (!editMode || !id) return;
    const fetchPoll = async () => {
      try {
        const res = await api.get(`/polls/${id}`);
        const poll = res.data.data;
        // Format datetime-local value
        const dt = new Date(poll.expiresAt);
        const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setForm({
          title: poll.title,
          description: poll.description || '',
          expiresAt: local,
          requireAuth: poll.requireAuth,
          questions: poll.questions.map((q) => ({
            _id: q._id,
            _tempId: genId(),
            text: q.text,
            isRequired: q.isRequired,
            options: [...q.options],
          })),
        });
      } catch {
        toast.error('Failed to load poll');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchPoll();
  }, [editMode, id, navigate]);

  // ── Field helpers ──────────────────────────────────────────────────────────

  const setField = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const addQuestion = () => {
    setForm((p) => ({ ...p, questions: [...p.questions, emptyQuestion()] }));
  };

  const removeQuestion = (idx) => {
    setForm((p) => ({
      ...p,
      questions: p.questions.filter((_, i) => i !== idx),
    }));
  };

  const updateQuestion = (idx, key, value) => {
    setForm((p) => {
      const qs = [...p.questions];
      qs[idx] = { ...qs[idx], [key]: value };
      return { ...p, questions: qs };
    });
  };

  const addOption = (qIdx) => {
    setForm((p) => {
      const qs = [...p.questions];
      qs[qIdx] = { ...qs[qIdx], options: [...qs[qIdx].options, ''] };
      return { ...p, questions: qs };
    });
  };

  const removeOption = (qIdx, oIdx) => {
    setForm((p) => {
      const qs = [...p.questions];
      const opts = qs[qIdx].options.filter((_, i) => i !== oIdx);
      qs[qIdx] = { ...qs[qIdx], options: opts };
      return { ...p, questions: qs };
    });
  };

  const updateOption = (qIdx, oIdx, value) => {
    setForm((p) => {
      const qs = [...p.questions];
      const opts = [...qs[qIdx].options];
      opts[oIdx] = value;
      qs[qIdx] = { ...qs[qIdx], options: opts };
      return { ...p, questions: qs };
    });
  };

  // ── Validation ─────────────────────────────────────────────────────────────

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Poll title is required';
    if (!form.expiresAt) {
      e.expiresAt = 'Expiry date is required';
    } else if (new Date(form.expiresAt) <= new Date()) {
      e.expiresAt = 'Expiry date must be in the future';
    }
    if (form.questions.length === 0) e.questions = 'Add at least one question';

    const qErrors = form.questions.map((q, i) => {
      const qe = {};
      if (!q.text.trim()) qe.text = 'Question text is required';
      const validOpts = q.options.filter((o) => o.trim());
      if (validOpts.length < 2) qe.options = 'At least 2 options are required';
      return qe;
    });

    const hasQErrors = qErrors.some((qe) => Object.keys(qe).length > 0);
    if (hasQErrors) e.questionErrors = qErrors;

    return e;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error('Please fix the errors before submitting');
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      expiresAt: new Date(form.expiresAt).toISOString(),
      requireAuth: form.requireAuth,
      questions: form.questions.map((q) => ({
        ...(q._id ? { _id: q._id } : {}),
        text: q.text.trim(),
        isRequired: q.isRequired,
        options: q.options.filter((o) => o.trim()),
      })),
    };

    setSaving(true);
    try {
      if (editMode) {
        await api.put(`/polls/${id}`, payload);
        toast.success('Poll updated!');
      } else {
        await api.post('/polls', payload);
        toast.success('Poll created!');
      }
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save poll';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto pb-20">
      {/* Header */}
      <div className="mb-10">
        <button onClick={() => navigate(-1)} className="btn-ghost mb-4 text-sm pl-0">
          <ChevronLeft size={16} /> Back
        </button>
        <h1 className="text-3xl lg:text-4xl font-black text-on-surface mb-2 tracking-tight">
          {editMode ? 'Edit Poll' : 'Create a New Poll'}
        </h1>
        <p className="font-medium text-on-surface-variant opacity-70">
          {editMode
            ? 'Update your poll settings and questions.'
            : 'Engage your audience with a live, shareable poll.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-12 gap-6">
          {/* Builder Panel */}
          <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">

            {/* Step 1 — Poll Details */}
            <BentoCard className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-lg">1</div>
                <h3 className="text-2xl font-bold text-on-surface">Poll Details</h3>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block font-bold text-xs uppercase tracking-widest text-on-surface-variant opacity-60 mb-3">
                    Title <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Team Feedback Survey Q3"
                    className={cn('input-field text-base', errors.title ? 'ring-2 ring-error/30' : '')}
                    value={form.title}
                    onChange={(e) => setField('title', e.target.value)}
                  />
                  {errors.title && <p className="text-error text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.title}</p>}
                </div>

                <div>
                  <label className="block font-bold text-xs uppercase tracking-widest text-on-surface-variant opacity-60 mb-3">
                    Description <span className="text-on-surface-variant/40 normal-case font-normal">(optional)</span>
                  </label>
                  <textarea
                    placeholder="Brief description of what this poll is about…"
                    rows={3}
                    className="input-field resize-none"
                    value={form.description}
                    onChange={(e) => setField('description', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block font-bold text-xs uppercase tracking-widest text-on-surface-variant opacity-60 mb-3">
                    Expires at <span className="text-error">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    className={cn('input-field', errors.expiresAt ? 'ring-2 ring-error/30' : '')}
                    value={form.expiresAt}
                    onChange={(e) => setField('expiresAt', e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  {errors.expiresAt && <p className="text-error text-xs mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.expiresAt}</p>}
                </div>

                {/* Auth toggle */}
                <div className="flex items-center justify-between p-6 bg-[rgb(var(--clr-panel))] rounded-2xl border border-black/[0.03] dark:border-white/[0.06]">
                  <div>
                    <p className="font-bold text-on-surface text-base">Require Authentication</p>
                    <p className="text-[11px] font-semibold text-on-surface-variant opacity-60 uppercase tracking-widest mt-1">
                      Respondents must be logged in
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setField('requireAuth', !form.requireAuth)}
                    className={cn(
                      'w-14 h-8 rounded-full p-1 transition-all duration-300 focus:outline-none',
                      form.requireAuth ? 'bg-primary-container' : 'bg-black/10'
                    )}
                    aria-checked={form.requireAuth}
                    role="switch"
                  >
                    <div className={cn(
                      'w-6 h-6 bg-white rounded-full shadow-md transition-transform',
                      form.requireAuth ? 'translate-x-6' : 'translate-x-0'
                    )} />
                  </button>
                </div>
              </div>
            </BentoCard>

            {/* Step 2 — Questions */}
            <BentoCard className="p-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-lg">2</div>
                <h3 className="text-2xl font-bold text-on-surface">Questions</h3>
                {errors.questions && (
                  <span className="text-error text-xs font-semibold">{errors.questions}</span>
                )}
              </div>

              <div className="space-y-6">
                {form.questions.map((q, qIdx) => {
                  const qErr = errors.questionErrors?.[qIdx] || {};
                  return (
                    <div key={q._tempId || qIdx} className="bg-[rgb(var(--clr-panel))] rounded-2xl border border-black/[0.03] dark:border-white/[0.06] p-6 space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <GripVertical size={18} className="text-on-surface-variant opacity-30 cursor-grab" />
                          <span className="font-black text-on-surface-variant text-xs uppercase tracking-widest opacity-50">
                            Question {qIdx + 1}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-2 text-xs font-bold text-on-surface-variant opacity-60 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={q.isRequired}
                              onChange={(e) => updateQuestion(qIdx, 'isRequired', e.target.checked)}
                              className="rounded border-black/10 text-primary focus:ring-primary/20 w-4 h-4 accent-primary"
                            />
                            Required
                          </label>
                          {form.questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeQuestion(qIdx)}
                              className="text-error opacity-60 hover:opacity-100 transition-opacity p-1 hover:bg-error/5 rounded-full"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>

                      <input
                        type="text"
                        placeholder="Enter your question…"
                        className={cn('input-field', qErr.text ? 'ring-2 ring-error/30' : '')}
                        value={q.text}
                        onChange={(e) => updateQuestion(qIdx, 'text', e.target.value)}
                      />
                      {qErr.text && <p className="text-error text-xs flex items-center gap-1"><AlertCircle size={12} />{qErr.text}</p>}

                      {/* Options */}
                      <div className="space-y-3 mt-2">
                        <p className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">Options</p>
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-3 bg-surface rounded-xl px-4 py-2 border border-black/[0.03] group hover:border-primary/20 transition-all">
                            <div className="w-4 h-4 rounded-full border-2 border-primary-container/30 flex-shrink-0" />
                            <input
                              type="text"
                              placeholder={`Option ${oIdx + 1}`}
                              className="flex-grow bg-transparent border-none focus:ring-0 font-bold text-on-surface py-1.5 outline-none text-sm"
                              value={opt}
                              onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                            />
                            {q.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeOption(qIdx, oIdx)}
                                className="text-error opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity p-1"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                        {qErr.options && (
                          <p className="text-error text-xs flex items-center gap-1">
                            <AlertCircle size={12} /> {qErr.options}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={() => addOption(qIdx)}
                          className="w-full py-3 rounded-xl border-2 border-dashed border-black/10 text-primary font-bold flex items-center justify-center gap-2 hover:bg-primary/5 transition-all text-sm"
                        >
                          <Plus size={16} /> Add option
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={addQuestion}
                className="w-full mt-6 py-4 rounded-2xl border-2 border-dashed border-black/10 text-primary font-bold flex items-center justify-center gap-2 hover:bg-primary/5 transition-all"
              >
                <Plus size={20} /> Add Question
              </button>
            </BentoCard>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-primary-container text-white py-6 rounded-[32px] font-black text-xl shadow-[0_10px_30px_rgba(205,80,40,0.25)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-60"
              >
                {saving ? (
                  <LoadingSpinner size="sm" />
                ) : editMode ? (
                  <><CheckCircle2 size={22} /> Save Changes</>
                ) : (
                  <><Rocket size={22} /> Launch Poll</>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-10 py-6 rounded-[32px] border-2 border-black/10 text-on-surface-variant font-black text-xl hover:bg-black/5 transition-all active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="col-span-12 lg:col-span-5">
            <div className="sticky top-10 bg-surface-container p-8 rounded-[40px] shadow-xl border border-white/20 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-on-surface">Preview</h3>
                <span className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-widest">
                  Live Preview
                </span>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div className="bg-[rgb(var(--clr-panel))] rounded-2xl p-5 border border-black/[0.03] dark:border-white/[0.06]">
                  <h4 className="font-black text-on-surface text-lg leading-snug">
                    {form.title || <span className="opacity-30 font-medium">Untitled Poll</span>}
                  </h4>
                  {form.description && (
                    <p className="text-sm font-medium text-on-surface-variant opacity-70 mt-2 leading-relaxed">{form.description}</p>
                  )}
                </div>

                {/* Questions preview */}
                {form.questions.filter(q => q.text.trim()).map((q, i) => (
                  <div key={i} className="bg-[rgb(var(--clr-panel))] rounded-2xl p-5 border border-black/[0.03] dark:border-white/[0.06] space-y-3">
                    <p className="font-bold text-on-surface text-sm leading-snug">{q.text}</p>
                    <div className="space-y-2">
                      {q.options.filter(o => o.trim()).map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-3 py-2.5 px-4 bg-surface rounded-xl border border-black/[0.03] text-sm font-medium text-on-surface-variant">
                          <div className="w-4 h-4 rounded-full border-2 border-primary-container/30 shrink-0" />
                          {opt}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {form.questions.every(q => !q.text.trim()) && (
                  <p className="text-center text-on-surface-variant opacity-40 text-sm font-medium py-6">
                    Questions will appear here as you fill them in.
                  </p>
                )}

                {/* Settings summary */}
                <div className="bg-[rgb(var(--clr-panel))] rounded-2xl p-5 border border-black/[0.03] dark:border-white/[0.06] flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest opacity-50">Auth Required</span>
                  <span className={cn('text-xs font-black px-3 py-1 rounded-full', form.requireAuth ? 'bg-primary/10 text-primary' : 'bg-black/5 text-on-surface-variant')}>
                    {form.requireAuth ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
