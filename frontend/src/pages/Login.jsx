import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Zap, Eye, EyeOff, Sparkles } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { cn } from '../lib/utils';

const DEMO = { email: 'demo@pulseboard.dev', password: 'demo123' };

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
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
        {/* Logo mark */}
        <div className="text-center mb-10">
          <div className="inline-flex w-14 h-14 bg-primary-container rounded-2xl items-center justify-center mb-5 shadow-[0_8px_24px_rgba(255,107,43,0.25)]">
            <Zap size={26} className="text-white" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight">Welcome back</h1>
          <p className="text-on-surface-variant opacity-60 font-medium mt-2">Log in to your PulseBoard account</p>
        </div>

        {/* Demo credentials banner */}
        <div className="mb-5 rounded-2xl border border-primary-container/25 bg-primary-container/8 px-5 py-4 flex items-start gap-3">
          <Sparkles size={18} className="text-primary-container mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-on-surface mb-1">Try the demo account</p>
            <div className="flex flex-wrap gap-x-5 gap-y-0.5 text-xs font-mono text-on-surface-variant">
              <span><span className="opacity-50">email</span> <span className="font-bold text-on-surface">demo@pulseboard.dev</span></span>
              <span><span className="opacity-50">password</span> <span className="font-bold text-on-surface">demo123</span></span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setForm(DEMO)}
            className="flex-shrink-0 text-[11px] font-black uppercase tracking-widest text-primary-container hover:opacity-70 transition-opacity"
          >
            Fill
          </button>
        </div>

        <div className="bento-card overflow-hidden p-0">
          {/* Orange top stripe */}
          <div className="h-1.5 bg-primary-container w-full" />
          <form onSubmit={handleSubmit} className="p-8 space-y-5 !bg-transparent" noValidate>
          <div>
            <label className="block font-bold text-xs uppercase tracking-widest text-on-surface-variant opacity-60 mb-3">
              Email address
            </label>
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
            <label className="block font-bold text-xs uppercase tracking-widest text-on-surface-variant opacity-60 mb-3">
              Password
            </label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="demo"
                className={cn('input-field pr-12', errors.password ? 'ring-2 ring-error/30' : '')}
                autoComplete="current-password"
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
            {loading ? <LoadingSpinner size="sm" /> : 'Log in'}
          </button>
          </form>
        </div>

        <p className="text-center text-sm text-on-surface-variant opacity-70 font-medium mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-bold hover:underline">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}
