import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/** Requires login; optionally requires a role such as "ROLE_ADMIN". */
export default function ProtectedRoute({ role }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  if (role && !user.roles?.includes(role)) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold">You don't have access to this page</h1>
        <p className="mt-2 text-ink-soft">This area is restricted to administrators.</p>
      </div>
    );
  }
  return <Outlet />;
}
