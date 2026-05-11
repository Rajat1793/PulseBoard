import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  PlusCircle,
  LogOut,
  Zap,
  Moon,
  Sun,
  X,
} from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/create', label: 'Create Poll', icon: PlusCircle },
];

/**
 * Sidebar receives `open` + `onClose` props from AuthLayout.
 * On desktop (lg+): always visible, no overlay.
 * On mobile: slide-in drawer controlled by `open`.
 */
export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const { dark, toggle: toggleDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavClick = () => {
    // Close drawer on mobile after navigation
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          // Base
          'fixed left-0 top-0 h-screen w-64 z-50 bg-surface-container dark:bg-[rgb(var(--clr-surface-container))] shadow-xl flex flex-col p-4 gap-2 transition-transform duration-300 ease-in-out',
          // Desktop: always shown
          'lg:translate-x-0',
          // Mobile: slide in/out
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo row — mobile gets a close button */}
        <div className="flex items-center justify-between px-2 py-5 mb-2">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white">
              <Zap size={22} fill="currentColor" />
            </div>
            <div>
              <h1 className="font-bold text-primary-container text-lg leading-tight">PulseBoard</h1>
              <p className="text-on-surface-variant font-semibold text-[10px] uppercase tracking-widest opacity-70">Creator Studio</p>
            </div>
          </Link>
          {/* Close button — only on mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-on-surface-variant hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-grow space-y-1.5">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path || (path === '/create' && location.pathname.includes('/edit'));
            return (
              <Link
                key={path}
                to={path}
                onClick={handleNavClick}
                className={cn(
                  'w-full flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 hover:scale-[1.02] active:scale-95',
                  isActive
                    ? 'bg-primary-container text-white shadow-[0_4px_15px_rgba(205,80,40,0.22)]'
                    : 'text-on-surface-variant hover:bg-black/5 dark:hover:bg-white/[0.07]'
                )}
              >
                <Icon size={20} />
                <span className="font-semibold text-sm tracking-wide">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="mt-auto space-y-3">
          <Link
            to="/create"
            onClick={handleNavClick}
            className="w-full bg-primary-container text-white font-bold py-4 rounded-xl shadow-[0_4px_16px_rgba(255,107,43,0.3)] hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            <PlusCircle size={18} /> New Poll
          </Link>

          <div className="border-t border-black/[0.06] dark:border-white/[0.06] pt-3 space-y-1">
            {/* User info */}
            {user && (
              <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm flex-shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-on-surface truncate">{user.name}</span>
              </div>
            )}

            {/* Dark / Light mode toggle */}
            <button
              onClick={toggleDark}
              className="w-full flex items-center gap-3 text-on-surface-variant hover:bg-black/5 dark:hover:bg-white/[0.07] rounded-xl px-4 py-3 transition-all"
              aria-label="Toggle colour scheme"
            >
              {dark ? <Sun size={20} /> : <Moon size={20} />}
              <span className="font-semibold text-sm">{dark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 text-error hover:bg-error/5 rounded-xl px-4 py-3 transition-all"
            >
              <LogOut size={20} />
              <span className="font-semibold text-sm">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
