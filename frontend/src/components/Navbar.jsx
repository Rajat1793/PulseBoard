import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, Plus, Zap, Moon, Sun } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { dark, toggle: toggleDark } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 w-full z-40 bg-[rgb(var(--clr-panel))]/85 dark:bg-[rgb(var(--clr-surface))]/90 backdrop-blur-2xl border-b border-black/[0.06] dark:border-white/[0.04] flex justify-between items-center px-8 py-4 transition-colors duration-300">
      {/* Logo */}
      <Link
        to={user ? '/dashboard' : '/'}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
      >
        <div className="w-9 h-9 bg-primary-container rounded-xl flex items-center justify-center">
          <Zap size={18} className="text-white" fill="currentColor" />
        </div>
        <span className="text-2xl font-black text-primary-container tracking-tighter">PulseBoard</span>
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-on-surface-variant hover:bg-black/5 dark:hover:bg-white/[0.06] transition-colors"
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle dark mode"
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {user ? (
          <>
            <Link to="/dashboard" className="btn-ghost hidden sm:inline-flex">
              Dashboard
            </Link>
            <Link to="/create" className="btn-primary">
              <Plus size={16} /> New Poll
            </Link>
            <button onClick={handleLogout} className="btn-ghost" title="Logout">
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-ghost">Log in</Link>
            <Link to="/register" className="btn-primary">Get started</Link>
          </>
        )}
      </div>
    </nav>
  );
}
