import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Search, PlusSquare, Bell, Moon, Sun, LogOut, ShieldCheck } from 'lucide-react';
import { Avatar } from './Avatar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotificationCount } from '../hooks/useNotificationCount';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotificationCount();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 border-b border-ink-700/10 bg-paper-100/90 backdrop-blur dark:border-paper-300/10 dark:bg-ink-950/90">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="font-display text-xl font-semibold tracking-tight">
          Connect<span className="text-safelight-500">Hub</span>
        </Link>

        <div className="flex items-center gap-1">
          <NavIcon to="/" label="Home"><Home size={20} /></NavIcon>
          <NavIcon to="/search" label="Search"><Search size={20} /></NavIcon>
          <NavIcon to="/create" label="Create post"><PlusSquare size={20} /></NavIcon>
          <NavIcon to="/notifications" label="Notifications" badge={unreadCount}>
            <Bell size={20} />
          </NavIcon>

          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="rounded-full p-2.5 text-ink-700 hover:bg-ink-900/5 dark:text-paper-300 dark:hover:bg-paper-100/5"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="relative ml-1">
            <button onClick={() => setMenuOpen((v) => !v)} aria-label="Account menu">
              <Avatar user={user} size="sm" />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 mt-2 w-48 rounded-lg border border-ink-700/10 bg-white py-1 shadow-lg dark:border-paper-300/10 dark:bg-ink-900"
                onMouseLeave={() => setMenuOpen(false)}
              >
                <Link
                  to={`/profile/${user?.username}`}
                  className="block px-4 py-2 text-sm hover:bg-ink-900/5 dark:hover:bg-paper-100/5"
                  onClick={() => setMenuOpen(false)}
                >
                  Your profile
                </Link>
                {user?.isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-ink-900/5 dark:hover:bg-paper-100/5"
                    onClick={() => setMenuOpen(false)}
                  >
                    <ShieldCheck size={14} /> Admin dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-danger-500 hover:bg-danger-500/10"
                >
                  <LogOut size={14} /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavIcon = ({ to, label, children, badge }) => (
  <Link
    to={to}
    aria-label={label}
    className="relative rounded-full p-2.5 text-ink-700 hover:bg-ink-900/5 dark:text-paper-300 dark:hover:bg-paper-100/5"
  >
    {children}
    {!!badge && (
      <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-semibold text-white">
        {badge > 9 ? '9+' : badge}
      </span>
    )}
  </Link>
);
