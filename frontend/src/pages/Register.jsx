import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Zap, Eye, EyeOff } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { cn } from '../lib/utils';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.token, res.data.user);
      toast.success(`Welcome to PulseBoard, ${res.data.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm((p) => ({ ...p, [key]: e.target.value })),
    onBlur: () => {
      const errs = validate();
      setErrors((p) => ({ ...p, [key]: errs[key] }));
    },
  });

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center p-4 bg-surface">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex w-14 h-14 bg-primary-container rounded-2xl items-center justify-center mb-5 shadow-[0_8px_24px_rgba(255,107,43,0.25)]">
            <Zap size={26} className="text-white" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight">Create your account</h1>
          <p className="text-on-surface-variant opacity-60 font-medium mt-2">Start collecting feedback today</p>
        </div>

        <div className="bento-card overflow-hidden p-0">
          <div className="h-1.5 bg-primary-container w-full" />
          <form onSubmit={handleSubmit} className="p-8 space-y-5" noValidate>
          <div>
            <label className="block font-bold text-xs uppercase tracking-widest text-on-surface-variant opacity-60 mb-3">Full name</label>
            <input
              type="text"
              placeholder="Alex Johnson"
              className={cn('input-field', errors.name ? 'ring-2 ring-error/30' : '')}
              autoComplete="name"
              {...field('name')}
            />
            {errors.name && <p className="text-error text-xs mt-1 font-semibold">{errors.name}</p>}
          </div>

          <div>
            <label className="block font-bold text-xs uppercase tracking-widest text-on-surface-variant opacity-60 mb-3">Email address</label>
            <input
              type="email"
              placeholder="you@example.com"
              className={cn('input-field', errors.email ? 'ring-2 ring-error/30' : '')}
              autoComplete="email"
              {...field('email')}
            />
            {errors.email && <p className="text-error text-xs mt-1 font-semibold">{errors.email}</p>}
          </div>

          <div>
            <label className="block font-bold text-xs uppercase tracking-widest text-on-surface-variant opacity-60 mb-3">Password</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                className={cn('input-field pr-12', errors.password ? 'ring-2 ring-error/30' : '')}
                autoComplete="new-password"
                {...field('password')}
              />
              <button
                type="button"
                onClick={() => setShowPwd((p) => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-40 hover:opacity-80 transition-opacity"
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-error text-xs mt-1 font-semibold">{errors.password}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base mt-2">
            {loading ? <LoadingSpinner size="sm" /> : 'Create account'}
          </button>

          <p className="text-center text-xs text-on-surface-variant opacity-40 font-medium">
            By signing up you agree to our terms of service.
          </p>
          </form>
        </div>

        <p className="text-center text-sm text-on-surface-variant opacity-70 font-medium mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
