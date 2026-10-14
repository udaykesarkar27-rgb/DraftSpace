import { useEffect, useState } from 'react';
import { adminApi } from '../../api/services.js';
import { getErrorMessage } from '../../api/client.js';
import { Spinner, ErrorNote } from '../../components/ui.jsx';

function Stat({ label, value, note }) {
  return (
    <div className="px-5 py-4">
      <div className="text-4xl font-bold tabular-nums">{value}</div>
      <div className="mt-1 text-sm text-ink-soft">{label}</div>
      {note && <div className="text-xs text-ink-faint">{note}</div>}
    </div>
  );
}

export default function Overview() {
  const [m, setM] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.metrics().then(setM).catch((e) => setError(getErrorMessage(e)));
  }, []);

  if (error) return <ErrorNote>{error}</ErrorNote>;
  if (!m) return <Spinner />;

  const categories = Object.entries(m.postsByCategory);
  const max = Math.max(1, ...categories.map(([, n]) => n));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 divide-y divide-line overflow-hidden rounded-lg border border-line bg-white sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <Stat label="Total users" value={m.totalUsers} note={`${m.adminUsers} admin, ${m.disabledUsers} disabled`} />
        <Stat label="Total posts" value={m.totalPosts} />
        <Stat label="Total comments" value={m.totalComments} />
      </div>

      <section>
        <h2 className="text-lg font-bold">Posts by category</h2>
        {categories.length === 0 ? (
          <p className="mt-2 text-sm text-ink-faint">No posts have been published yet.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {categories.map(([name, count]) => (
              <li key={name} className="flex items-center gap-3 text-sm">
                <span className="w-36 shrink-0 truncate text-ink-soft">{name}</span>
                <div className="h-3 flex-1 rounded bg-white">
                  <div className="h-3 rounded bg-brand" style={{ width: `${(count / max) * 100}%` }} />
                </div>
                <span className="w-8 text-right tabular-nums">{count}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
