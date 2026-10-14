import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Bold, Italic, Heading2, Quote, Code, List, Link2 } from 'lucide-react';
import { postApi } from '../api/services.js';
import { getErrorMessage, getFieldErrors } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Spinner, ErrorNote, Field } from '../components/ui.jsx';

const TOOLS = [
  { label: 'Bold', icon: Bold, before: '**', after: '**', placeholder: 'bold text' },
  { label: 'Italic', icon: Italic, before: '*', after: '*', placeholder: 'italic text' },
  { label: 'Heading', icon: Heading2, before: '## ', after: '', placeholder: 'Heading', line: true },
  { label: 'Quote', icon: Quote, before: '> ', after: '', placeholder: 'Quoted text', line: true },
  { label: 'Code', icon: Code, before: '`', after: '`', placeholder: 'code' },
  { label: 'List', icon: List, before: '\n- ', after: '', placeholder: 'List item', line: true },
  { label: 'Link', icon: Link2, before: '[', after: '](https://)', placeholder: 'link text' },
];

export default function PostEditor() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const textareaRef = useRef(null);

  const [form, setForm] = useState({ title: '', category: '', content: '' });
  const [categories, setCategories] = useState([]);
  const [tab, setTab] = useState('write');
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    postApi.categories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    if (!editing) return;
    postApi
      .get(id)
      .then((p) => {
        if (user && p.authorId !== user.id) {
          setError('Only the author can edit this post.');
          return;
        }
        setForm({ title: p.title, category: p.category, content: p.content });
      })
      .catch((e) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [editing, id, user, isAuthenticated]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const applyTool = ({ before, after, placeholder, line }) => {
    const el = textareaRef.current;
    const { selectionStart: s, selectionEnd: e } = el;
    const value = form.content;
    const selected = value.slice(s, e) || placeholder;
    const lead = line && s > 0 && value[s - 1] !== '\n' ? '\n' : '';
    const next = value.slice(0, s) + lead + before + selected + after + value.slice(e);
    setForm((f) => ({ ...f, content: next }));
    requestAnimationFrame(() => {
      el.focus();
      const start = s + lead.length + before.length;
      el.setSelectionRange(start, start + selected.length);
    });
  };

  const words = form.content.trim() ? form.content.trim().split(/\s+/).length : 0;
  const readTime = Math.max(1, Math.ceil(words / 200));

  const submit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError('You must be logged in to create or edit posts.');
      return;
    }

    const local = {};
    if (!form.title.trim()) local.title = 'Add a title';
    if (!form.category.trim()) local.category = 'Choose or type a category';
    if (!form.content.trim()) local.content = 'Write something before publishing';
    setFieldErrors(local);
    if (Object.keys(local).length) return;

    setSaving(true);
    setError('');
    try {
      const payload = { title: form.title.trim(), category: form.category.trim(), content: form.content };
      const saved = editing ? await postApi.update(id, payload) : await postApi.create(payload);
      navigate(`/posts/${saved.id}`);
    } catch (err) {
      setFieldErrors(getFieldErrors(err));
      setError(getErrorMessage(err));
      setSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
        <p className="text-ink-soft mb-4">Please log in to create or edit blog posts.</p>
        <button onClick={() => navigate('/login')} className="btn-primary">
          Go to Login
        </button>
      </div>
    );
  }

  if (loading) return <Spinner />;

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl" noValidate>
      <h1 className="text-3xl font-bold">{editing ? 'Edit post' : 'New post'}</h1>

      <div className="mt-6 space-y-5">
        <ErrorNote>{error}</ErrorNote>

        <Field label="Title" error={fieldErrors.title}>
          <input className="input text-lg font-medium" maxLength={200} value={form.title} onChange={set('title')} />
        </Field>

        <Field label="Category" error={fieldErrors.category} hint="Pick an existing one or type a new one">
          <input className="input max-w-xs" list="category-options" maxLength={50} value={form.category} onChange={set('category')} />
          <datalist id="category-options">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-t-md border border-b-0 border-line bg-white px-2 py-1.5">
            <div className="flex gap-1" role="toolbar" aria-label="Formatting">
              {TOOLS.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  disabled={tab !== 'write'}
                  onClick={() => applyTool(t)}
                  className="btn-quiet disabled:opacity-40"
                  aria-label={t.label}
                  title={t.label}
                >
                  <t.icon className="h-4 w-4" aria-hidden="true" />
                </button>
              ))}
            </div>
            <div className="flex gap-1 text-sm" role="tablist">
              {['write', 'preview'].map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className={`rounded px-3 py-1 capitalize ${tab === t ? 'bg-ink text-white' : 'text-ink-soft hover:text-ink'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {tab === 'write' ? (
            <textarea
              ref={textareaRef}
              value={form.content}
              onChange={set('content')}
              rows={18}
              aria-label="Post content (Markdown)"
              placeholder="Write in Markdown. Use the toolbar for headings, quotes, lists and links."
              className="input rounded-t-none font-serif text-base leading-relaxed"
            />
          ) : (
            <div className="min-h-[24rem] rounded-b-md border border-line bg-white p-5">
              {form.content.trim() ? (
                <div className="prose prose-slate max-w-none font-serif prose-headings:font-sans">
                  <ReactMarkdown>{form.content}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm text-ink-faint">Nothing to preview yet.</p>
              )}
            </div>
          )}
          <div className="mt-1 flex justify-between text-xs">
            <span className="text-danger">{fieldErrors.content}</span>
            <span className="text-ink-faint">
              {words} words, about {readTime} min read
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <button className="btn-primary" disabled={saving}>
          {saving ? 'Saving' : editing ? 'Save changes' : 'Publish'}
        </button>
        <button type="button" className="btn-ghost" onClick={() => navigate(-1)}>
          Cancel
        </button>
      </div>
    </form>
  );
}