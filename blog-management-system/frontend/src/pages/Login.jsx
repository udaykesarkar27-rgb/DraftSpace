import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../api/client.js';
import { ErrorNote, Field } from '../components/ui.jsx';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const [form, setForm] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to={from} replace />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.identifier.trim()) next.identifier = 'Enter your username or email';
    if (!form.password) next.password = 'Enter your password';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    setServerError('');
    try {
      const response = await login(form.identifier.trim(), form.password);

      // Ensure token synchronization across both possible keys in local storage
      const token = response?.token || response?.accessToken || localStorage.getItem('token') || localStorage.getItem('fieldnotes_token');
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('fieldnotes_token', token);
      }

      navigate(from, { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm py-8">
      <h1 className="text-3xl font-bold">Log in</h1>
      <p className="mt-1 text-sm text-ink-soft">
        New here?{' '}
        <Link to="/register" className="font-medium text-brand hover:underline">
          Create an account
        </Link>
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <ErrorNote>{serverError}</ErrorNote>
        <Field label="Username or email" error={errors.identifier}>
          <input className="input" autoComplete="username" value={form.identifier} onChange={set('identifier')} />
        </Field>
        <Field label="Password" error={errors.password}>
          <input type="password" className="input" autoComplete="current-password" value={form.password} onChange={set('password')} />
        </Field>
        <button className="btn-primary w-full" disabled={submitting}>
          {submitting ? 'Logging in' : 'Log in'}
        </button>
      </form>
    </div>
  );
}