import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import PollCard from '../components/PollCard';
import LoadingSpinner from '../components/LoadingSpinner';
import BentoCard from '../components/BentoCard';
import { Plus, BarChart2, Users, Zap, AlertTriangle, ChevronRight } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPolls = async () => {
    try {
      const res = await api.get('/polls');
      setPolls(res.data.data);
    } catch {
      toast.error('Failed to load polls');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this poll? All responses will also be removed.')) return;
    try {
      await api.delete(`/polls/${id}`);
      setPolls((p) => p.filter((poll) => poll._id !== id));
      toast.success('Poll deleted');
    } catch {
      toast.error('Failed to delete poll');
    }
  };

  const totalResponses = polls.reduce((sum, p) => sum + (p.totalResponses ?? 0), 0);
  const activePolls = polls.filter((p) => p.status === 'active').length;
  const publishedPolls = polls.filter((p) => p.isPublished).length;
  const expiringPolls = polls.filter((p) => {
    const diff = new Date(p.expiresAt) - new Date();
    return diff > 0 && diff < 2 * 60 * 60 * 1000;
  });

  return (
    <div className="max-w-[1440px] mx-auto">
      {/* Header */}
      <header className="flex justify-between items-end mb-10">
        <div>
          <p className="text-primary font-bold uppercase tracking-[0.2em] text-[10px] mb-2">Creator Dashboard</p>
          <h2 className="font-extrabold text-3xl lg:text-4xl text-on-surface tracking-tight">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h2>
        </div>
        <Link to="/create" className="btn-primary text-sm px-5 py-2.5">
          <Plus size={16} /> New Poll
        </Link>
      </header>

      <div className="grid grid-cols-12 gap-4">
        {/* Action Needed — expiring polls */}
        {expiringPolls.length > 0 && (
          <BentoCard className="col-span-12 md:col-span-8 border-none bg-[#ffdbcf]/50 p-8 flex items-center justify-between overflow-hidden relative">
            <div className="z-10 relative">
              <div className="flex items-center gap-2 text-primary font-bold text-xs mb-2">
                <AlertTriangle size={16} fill="currentColor" />
                <span className="tracking-widest uppercase">Action Needed</span>
              </div>
              <h3 className="text-3xl font-bold text-on-surface mb-6">
                {expiringPolls.length} poll{expiringPolls.length > 1 ? 's are' : ' is'} expiring in less than 2 hours!
              </h3>
            </div>
            <div className="absolute right-[-20px] top-[-20px] opacity-10 pointer-events-none transform rotate-12">
              <Zap size={300} className="text-primary" />
            </div>
          </BentoCard>
        )}

        {/* Stats */}
        <BentoCard className={`${expiringPolls.length > 0 ? 'col-span-12 md:col-span-4' : 'col-span-12 md:col-span-4'} flex flex-col justify-between`}>
          <div className="flex justify-between items-start">
            <span className="text-on-surface-variant font-bold text-xs uppercase tracking-wider">Total Responses</span>
            <span className="text-primary bg-primary/10 px-2 py-1 rounded-lg text-[10px] font-extrabold">All Time</span>
          </div>
          <div className="mt-4">
            <span className="text-5xl font-black text-on-surface">{totalResponses}</span>
            <p className="text-sm text-on-surface-variant font-medium mt-2 opacity-70">across all polls</p>
          </div>
        </BentoCard>

        {expiringPolls.length === 0 && (
          <>
            <BentoCard className="col-span-6 md:col-span-4 flex flex-col justify-between">
              <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary mb-4">
                <Zap size={20} fill="currentColor" />
              </div>
              <span className="text-on-surface-variant font-bold text-xs uppercase tracking-wider block mb-1">Active Polls</span>
              <span className="text-4xl font-black text-on-surface">{activePolls}</span>
            </BentoCard>

            <BentoCard className="col-span-6 md:col-span-4 flex flex-col justify-between">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <BarChart2 size={20} />
              </div>
              <span className="text-on-surface-variant font-bold text-xs uppercase tracking-wider block mb-1">Published</span>
              <span className="text-4xl font-black text-on-surface">{publishedPolls}</span>
            </BentoCard>
          </>
        )}

        {/* Polls list */}
        <div className="col-span-12 mt-8 flex justify-between items-center px-2">
          <h3 className="text-2xl font-bold text-on-surface">Your Polls</h3>
          <Link to="/create" className="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
            New Poll <ChevronRight size={18} />
          </Link>
        </div>

        {loading ? (
          <div className="col-span-12 flex justify-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : polls.length === 0 ? (
          <BentoCard className="col-span-12 border-dashed border-2 border-primary-container/30 bg-primary-container/5 hover:bg-primary-container/10 cursor-pointer group flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-full bg-primary-container text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl">
              <Plus size={32} />
            </div>
            <h4 className="text-xl font-bold text-on-surface mb-2">No polls yet</h4>
            <p className="text-on-surface-variant text-center text-sm font-medium opacity-70 mb-8">
              Create your first poll and start collecting feedback from your audience.
            </p>
            <Link to="/create" className="btn-primary text-base px-8 py-3">
              <Plus size={18} /> Create Poll
            </Link>
          </BentoCard>
        ) : (
          <div className="col-span-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {polls.map((poll) => (
              <PollCard key={poll._id} poll={poll} onDelete={handleDelete} />
            ))}
            {/* Create new card */}
            <BentoCard className="border-dashed border-2 border-primary-container/30 bg-primary-container/5 hover:bg-primary-container/10 cursor-pointer group flex flex-col items-center justify-center p-8 min-h-[200px]">
              <Link to="/create" className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-primary-container text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                  <Plus size={28} />
                </div>
                <h4 className="text-base font-bold text-on-surface mb-1">New Poll</h4>
                <p className="text-on-surface-variant text-xs font-medium opacity-70">Create a fresh pulse check.</p>
              </Link>
            </BentoCard>
          </div>
        )}
      </div>

      {/* Floating stats widget */}
    </div>
  );
}
