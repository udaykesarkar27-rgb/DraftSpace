import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { postApi } from '../api/services.js';
import { getErrorMessage } from '../api/client.js';
import PostRow from '../components/PostRow.jsx';
import Pagination from '../components/Pagination.jsx';
import { Spinner, ErrorNote, Empty } from '../components/ui.jsx';

export default function Home() {
  const [params, setParams] = useSearchParams();
  const page = Number(params.get('page') || 0);
  const category = params.get('category') || '';
  const search = params.get('q') || '';

  const [searchInput, setSearchInput] = useState(search);
  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next);
  };

  useEffect(() => {
    postApi.categories().then(setCategories).catch(() => {});
  }, []);

  // Debounce the search box so we don't hit the API on every keystroke.
  useEffect(() => {
    if (searchInput === search) return;
    const t = setTimeout(() => update({ q: searchInput.trim(), page: '' }), 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    postApi
      .list({ page, category, search, size: 8 })
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(getErrorMessage(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page, category, search]);

  return (
    <div>
      <section className="mb-8">
        <h1 className="text-4xl font-bold sm:text-5xl">Latest writing</h1>
        <div className="relative mt-5 max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden="true" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search titles and text"
            aria-label="Search posts"
            className="input py-2.5 pl-9"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          <button
            onClick={() => update({ category: '', page: '' })}
            className={`rounded-full px-3 py-1 text-sm ${!category ? 'bg-ink text-white' : 'bg-white text-ink-soft hover:text-ink'}`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => update({ category: c, page: '' })}
              aria-pressed={category === c}
              className={`rounded-full px-3 py-1 text-sm ${category === c ? 'bg-ink text-white' : 'bg-white text-ink-soft hover:text-ink'}`}
            >
              {c}
            </button>
          ))}
        </div>
        {(search || category) && (
          <button
            onClick={() => {
              setSearchInput('');
              setParams({});
            }}
            className="btn-quiet mt-3 -ml-2"
          >
            <X className="h-4 w-4" aria-hidden="true" /> Clear filters
          </button>
        )}
      </section>

      {error && <ErrorNote>{error}</ErrorNote>}
      {loading && !data ? (
        <Spinner label="Loading posts" />
      ) : data?.content.length === 0 ? (
        <Empty title="No posts match your search">Try a different word or clear the filters.</Empty>
      ) : (
        <div className={loading ? 'opacity-60 transition-opacity' : ''}>
          {data?.content.map((p) => (
            <PostRow key={p.id} post={p} onCategory={(c) => update({ category: c, page: '' })} />
          ))}
          <Pagination page={data?.page ?? 0} totalPages={data?.totalPages ?? 0} onChange={(p) => update({ page: p ? String(p) : '' })} />
        </div>
      )}
    </div>
  );
}
