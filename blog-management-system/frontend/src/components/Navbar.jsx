import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, PenLine, LayoutList, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const linkClass = ({ isActive }) =>
  `inline-flex items-center gap-1.5 rounded px-2 py-1.5 text-sm transition-colors ${
    isActive
      ? 'bg-brand-tint text-brand-dark dark:bg-brand-dark/30 dark:text-brand-tint'
      : 'text-ink-soft hover:text-ink dark:text-gray-300 dark:hover:text-white'
  }`;

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  // Dark mode state: checks local storage first, then falls back to system preference
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply or remove the 'dark' class on the HTML element whenever isDark changes
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-20 border-b border-line dark:border-gray-800 bg-paper/90 dark:bg-gray-900/90 backdrop-blur transition-colors duration-300">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6">

        {/* DraftSpace Logo with Gradient Styling */}
        <Link
          to="/"
          className="text-2xl font-extrabold tracking-tighter bg-gradient-to-r from-brand to-indigo-400 bg-clip-text text-transparent hover:opacity-90 transition-opacity"
        >
          DraftSpace
        </Link>

        <nav className="flex flex-wrap items-center gap-2" aria-label="Main">

          {/* Dark Mode Toggle Button */}
          <button
            onClick={() => setIsDark(!isDark)}
            className="mr-2 rounded-full p-1.5 text-ink-soft hover:bg-gray-200 hover:text-ink dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard/new" className={linkClass}>
                <PenLine className="h-4 w-4" aria-hidden="true" /> Write
              </NavLink>
              <NavLink to="/dashboard" end className={linkClass}>
                <LayoutList className="h-4 w-4" aria-hidden="true" /> My posts
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className={linkClass}>
                  <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Admin
                </NavLink>
              )}
              <span className="ml-2 hidden text-sm text-ink-faint dark:text-gray-400 sm:inline">
                {user.username}
              </span>
              <button onClick={handleLogout} className="btn-quiet dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800 ml-1" aria-label="Log out">
                <LogOut className="h-4 w-4" aria-hidden="true" /> Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Log in
              </NavLink>
              <Link to="/register" className="btn-primary ml-1">
                Create account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}