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
      .list({ page, category, search, size: 9 })
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(getErrorMessage(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [page, category, search]);

  return (
    <div className="min-h-screen bg-paper dark:bg-gray-900 transition-colors">
      {/* Top Half: Dark Dual-Tone Section */}
      <section className="bg-ink dark:bg-black pt-16 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-6 text-center sm:text-left">
            Latest writing
          </h1>

          <div className="relative max-w-2xl mx-auto sm:mx-0 shadow-sm rounded-lg">
            <Search className="pointer-events-none absolute z-10 left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search titles and text"
              aria-label="Search posts"
              className="w-full rounded-lg bg-ink-soft/30 border border-gray-700 text-white placeholder-gray-400 py-3 pl-11 pr-4 focus:border-brand focus:ring-brand focus:ring-2 outline-none transition-all backdrop-blur-sm"
            />
          </div>

          <div className="mt-6 flex flex-wrap justify-center sm:justify-start gap-2" role="group" aria-label="Filter by category">
            <button
              onClick={() => update({ category: '', page: '' })}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${!category ? 'bg-brand text-white shadow-md' : 'bg-ink-soft/40 text-gray-300 hover:bg-ink-soft/80'}`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => update({ category: c, page: '' })}
                aria-pressed={category === c}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${category === c ? 'bg-brand text-white shadow-md' : 'bg-ink-soft/40 text-gray-300 hover:bg-ink-soft/80'}`}
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
              className="mt-4 inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors"
            >
              <X className="mr-1 h-4 w-4" aria-hidden="true" /> Clear filters
            </button>
          )}
        </div>
      </section>

      {/* Bottom Half: Cards overlapping the boundary using negative margin (-mt-20) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-12">
        {error && <ErrorNote>{error}</ErrorNote>}
        {loading && !data ? (
          <div className="py-12 bg-white rounded-xl shadow-sm"><Spinner label="Loading posts" /></div>
        ) : data?.content.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8">
            <Empty title="No posts match your search">Try a different word or clear the filters.</Empty>
          </div>
        ) : (
          <div className={`transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {data?.content.map((p) => (
                <PostRow key={p.id} post={p} onCategory={(c) => update({ category: c, page: '' })} />
              ))}
            </div>
            <Pagination page={data?.page ?? 0} totalPages={data?.totalPages ?? 0} onChange={(p) => update({ page: p ? String(p) : '' })} />
          </div>
        )}
      </section>
    </div>
  );
}