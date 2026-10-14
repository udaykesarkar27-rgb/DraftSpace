import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, PenLine, LayoutList, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const linkClass = ({ isActive }) =>
  `inline-flex items-center gap-1.5 rounded px-2 py-1.5 text-sm ${isActive ? 'bg-brand-tint text-brand-dark' : 'text-ink-soft hover:text-ink'}`;

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6">
        <Link to="/" className="text-xl font-bold tracking-tight">
          Fieldnotes
        </Link>

        <nav className="flex flex-wrap items-center gap-1" aria-label="Main">
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
              <span className="ml-2 hidden text-sm text-ink-faint sm:inline">{user.username}</span>
              <button onClick={handleLogout} className="btn-quiet" aria-label="Log out">
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
