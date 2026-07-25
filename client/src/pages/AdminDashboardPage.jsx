import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Users, FileText, MessageSquare, TrendingUp } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { adminService } from '../services/adminService';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    try {
      const [statsData, usersData] = await Promise.all([
        adminService.getStats(),
        adminService.getAllUsers(1, 20),
      ]);
      setStats(statsData.stats);
      setUsers(usersData.users);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleToggleActive = async (targetUser) => {
    try {
      const data = await adminService.toggleUserActive(targetUser._id);
      setUsers((prev) => prev.map((u) => (u._id === targetUser._id ? data.user : u)));
      toast.success(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (isLoading) return <p className="text-center text-sm">Loading dashboard...</p>;

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold">Admin dashboard</h1>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={<Users size={18} />} label="Total users" value={stats.totalUsers} />
        <StatCard icon={<FileText size={18} />} label="Total posts" value={stats.totalPosts} />
        <StatCard icon={<MessageSquare size={18} />} label="Total comments" value={stats.totalComments} />
        <StatCard icon={<TrendingUp size={18} />} label="New users (30d)" value={stats.newUsersLast30Days} />
      </div>

      <h2 className="label-mono mb-3">All users</h2>
      <div className="contact-frame divide-y divide-ink-700/10 dark:divide-paper-300/10">
        {users.map((u) => (
          <div key={u._id} className="flex items-center gap-3 p-3">
            <Avatar user={u} size="sm" />
            <div className="flex-1">
              <p className="text-sm font-semibold">{u.username}</p>
              <p className="text-xs text-ink-600 dark:text-paper-300/60">{u.email}</p>
            </div>
            <span className={`label-mono ${u.isActive ? 'text-teal-500' : 'text-danger-500'}`}>
              {u.isActive ? 'Active' : 'Deactivated'}
            </span>
            <button onClick={() => handleToggleActive(u)} className="btn-secondary">
              {u.isActive ? 'Deactivate' : 'Reactivate'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className="contact-frame flex items-center gap-3 p-4">
    <div className="rounded-full bg-safelight-500/15 p-2 text-safelight-600 dark:text-safelight-400">{icon}</div>
    <div>
      <p className="text-lg font-semibold">{value}</p>
      <p className="label-mono">{label}</p>
    </div>
  </div>
);
