import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../api/services.js';
import { TOKEN_KEY, USER_KEY } from '../api/client.js';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (localStorage.getItem(TOKEN_KEY) ? readStoredUser() : null));

  const persist = useCallback((auth) => {
    const token = auth.token;
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('fieldnotes_token', token);
    }
    localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
    setUser(auth.user);
    return auth.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('fieldnotes_token');
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  // Fired by the Axios interceptor when the server rejects our token.
  useEffect(() => {
    window.addEventListener('auth:logout', logout);
    return () => window.removeEventListener('auth:logout', logout);
  }, [logout]);

  const login = useCallback(async (identifier, password) => persist(await authApi.login(identifier, password)), [persist]);
  const register = useCallback(
    async (username, email, password) => persist(await authApi.register(username, email, password)),
    [persist]
  );

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isAdmin: !!user?.roles?.includes('ROLE_ADMIN'),
      login,
      register,
      logout,
    }),
    [user, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}