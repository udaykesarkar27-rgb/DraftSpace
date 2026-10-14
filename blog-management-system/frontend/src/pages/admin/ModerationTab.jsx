import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { adminApi, commentApi, postApi } from '../../api/services.js';
import { getErrorMessage } from '../../api/client.js';
import Pagination from '../../components/Pagination.jsx';
import { Spinner, ErrorNote, Empty, formatDate } from '../../components/ui.jsx';

/** Global moderation feed: newest posts or newest comments across the whole site. */
export default function ModerationTab() {
  const [kind, setKind] = useState('posts');
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      setData(kind === 'posts' ? await postApi.list({ page, size: 10 }) : await adminApi.comments({ page, size: 10 }));
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }, [kind, page]);

  useEffect(() => {
    setData(null);
    load();
  }, [load]);

  const switchKind = (k) => {
    setKind(k);
    setPage(0);
  };

  const remove = async (item) => {
    const label = kind === 'posts' ? `post "${item.title}" and its comments` : 'this comment';
    if (!window.confirm(`Delete ${label}?`)) return;
    try {
      await (kind === 'posts' ? postApi.remove(item.id) : commentApi.remove(item.id));
      if (data.content.length === 1 && page > 0) setPage(page - 1);
      else load();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  return (
    <div>
      <div className="inline-flex rounded-md border border-line bg-white p-0.5 text-sm" role="group" aria-label="Content type">
        {['posts', 'comments'].map((k) => (
          <button
            key={k}
            onClick={() => switchKind(k)}
            aria-pressed={kind === k}
            className={`rounded px-4 py-1.5 capitalize ${kind === k ? 'bg-ink text-white' : 'text-ink-soft hover:text-ink'}`}
          >
            {k}
          </button>
        ))}
      </div>

      <div className="mt-4"><ErrorNote>{error}</ErrorNote></div>

      {!data && !error ? (
        <Spinner />
      ) : data?.content.length === 0 ? (
        <Empty title={`No ${kind} to moderate`} />
      ) : (
        data && (
          <>
            <ul className="mt-2 divide-y divide-line overflow-hidden rounded-lg border border-line bg-white">
              {data.content.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-4 px-4 py-3">
                  <div className="min-w-0">
                    {kind === 'posts' ? (
                      <>
                        <Link to={`/posts/${item.id}`} className="font-medium hover:text-brand">
                          {item.title}
                        </Link>
                        <p className="text-sm text-ink-faint">
                          {item.authorUsername} in {item.category}, {formatDate(item.createdAt)}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="whitespace-pre-wrap break-words text-sm">{item.content}</p>
                        <p className="mt-0.5 text-sm text-ink-faint">
                          {item.authorUsername} on{' '}
                          <Link to={`/posts/${item.postId}`} className="hover:text-brand hover:underline">
                            {item.postTitle}
                          </Link>
                          , {formatDate(item.createdAt)}
                        </p>
                      </>
                    )}
                  </div>
                  <button onClick={() => remove(item)} className="btn-quiet shrink-0 text-danger">
                    <Trash2 className="h-4 w-4" aria-hidden="true" /> Delete
                  </button>
                </li>
              ))}
            </ul>
            <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
          </>
        )
      )}
    </div>
  );
}
