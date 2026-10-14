import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage, getFieldErrors } from '../api/client.js';
import { ErrorNote, Field } from '../components/ui.jsx';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(f) {
  const e = {};
  if (f.username.length < 3 || f.username.length > 50) e.username = 'Use 3 to 50 characters';
  else if (!/^[A-Za-z0-9_.-]+$/.test(f.username)) e.username = "Letters, digits, '.', '_' and '-' only";
  if (!EMAIL_RE.test(f.email)) e.email = 'Enter a valid email address';
  if (f.password.length < 6) e.password = 'Use at least 6 characters';
  if (f.confirm !== f.password) e.confirm = 'Passwords do not match';
  return e;
}

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    setServerError('');
    try {
      await register(form.username.trim(), form.email.trim(), form.password);
      navigate('/', { replace: true });
    } catch (err) {
      setErrors(getFieldErrors(err));
      setServerError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm py-8">
      <h1 className="text-3xl font-bold">Create your account</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Already registered?{' '}
        <Link to="/login" className="font-medium text-brand hover:underline">
          Log in
        </Link>
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <ErrorNote>{serverError}</ErrorNote>
        <Field label="Username" error={errors.username}>
          <input className="input" autoComplete="username" value={form.username} onChange={set('username')} />
        </Field>
        <Field label="Email" error={errors.email}>
          <input type="email" className="input" autoComplete="email" value={form.email} onChange={set('email')} />
        </Field>
        <Field label="Password" error={errors.password} hint="At least 6 characters">
          <input type="password" className="input" autoComplete="new-password" value={form.password} onChange={set('password')} />
        </Field>
        <Field label="Confirm password" error={errors.confirm}>
          <input type="password" className="input" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} />
        </Field>
        <button className="btn-primary w-full" disabled={submitting}>
          {submitting ? 'Creating account' : 'Create account'}
        </button>
      </form>
    </div>
  );
}
