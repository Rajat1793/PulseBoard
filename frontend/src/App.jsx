import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreatePoll from './pages/CreatePoll';
import Analytics from './pages/Analytics';
import PublicPoll from './pages/PublicPoll';
import PublishedResults from './pages/PublishedResults';
import { Menu, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

/** Layout for public/marketing pages — top Navbar */
function PublicLayout() {
  return (
    <div className="min-h-screen bg-surface dark:bg-[rgb(30_22_20)] text-on-surface dark:text-[rgb(225_210_205)] font-sans transition-colors duration-300">
      <Navbar />
      <div className="pt-[73px]">
        <Outlet />
      </div>
    </div>
  );
}

/** Layout for authenticated pages — left Sidebar */
function AuthLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-surface dark:bg-[rgb(30_22_20)] text-on-surface dark:text-[rgb(225_210_205)] flex selection:bg-primary/20 selection:text-primary transition-colors duration-300">
        {/* Sidebar — receives open state for mobile drawer */}
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
          {/* Mobile-only top bar with hamburger */}
          <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-surface-container/90 dark:bg-[rgb(var(--clr-surface-container)/0.92)] backdrop-blur-xl border-b border-black/[0.06] dark:border-white/[0.05]">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl text-on-surface-variant hover:bg-black/5 dark:hover:bg-white/[0.08] transition-colors"
              aria-label="Open navigation"
            >
              <Menu size={22} />
            </button>
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary-container rounded-lg flex items-center justify-center">
                <Zap size={15} className="text-white" fill="currentColor" />
              </div>
              <span className="font-black text-primary-container text-base tracking-tighter">PulseBoard</span>
            </Link>
            {/* Spacer to balance hamburger */}
            <div className="w-9" />
          </header>

          <main className="flex-1 p-4 sm:p-6 lg:p-10 xl:p-12">
            <Outlet />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/p/:shareId" element={<PublicPoll />} />
          <Route path="/p/:shareId/results" element={<PublishedResults />} />
        </Route>

        {/* Protected routes with Sidebar */}
        <Route element={<AuthLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create" element={<CreatePoll />} />
          <Route path="/poll/:id/edit" element={<CreatePoll editMode />} />
          <Route path="/poll/:id/analytics" element={<Analytics />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
