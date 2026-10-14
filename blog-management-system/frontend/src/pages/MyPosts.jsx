import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Plus, Trash2, ExternalLink } from 'lucide-react';
import { postApi } from '../api/services.js';
import { getErrorMessage } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import Pagination from '../components/Pagination.jsx';
import { Spinner, ErrorNote, Empty, formatDate } from '../components/ui.jsx';

export default function MyPosts() {
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      setData(await postApi.mine({ page, size: 10 }));
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [page, isAuthenticated]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (post) => {
    if (!window.confirm(`Delete "${post.title}"? Its comments will be deleted too.`)) return;
    try {
      await postApi.remove(post.id);
      // Step back a page if we just removed the last row of the current one.
      if (data.content.length === 1 && page > 0) setPage(page - 1);
      else load();
    } catch (e) {
      setError(getErrorMessage(e));
    }
  };

  if (!isAuthenticated) {
    return (
      <Empty title="Please log in to view your posts">
        <Link to="/login" className="font-medium text-brand hover:underline">
          Go to Login
        </Link>
      </Empty>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">My posts</h1>
          {data && <p className="mt-1 text-sm text-ink-soft">{data.totalElements} published</p>}
        </div>
        <Link to="/dashboard/new" className="btn-primary">
          <Plus className="h-4 w-4" aria-hidden="true" /> New post
        </Link>
      </div>

      <div className="mt-6">{error && <ErrorNote>{error}</ErrorNote>}</div>

      {loading && !data ? (
        <Spinner />
      ) : data?.content.length === 0 ? (
        <Empty title="You haven't written anything yet">
          <Link to="/dashboard/new" className="font-medium text-brand hover:underline">
            Write your first post
          </Link>
        </Empty>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border border-line bg-white">
          <table className="w-full min-w-[40rem]">
            <thead className="border-b border-line">
              <tr>
                <th className="th">Title</th>
                <th className="th">Category</th>
                <th className="th">Published</th>
                <th className="th">Comments</th>
                <th className="th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data?.content?.map((p) => (
                <tr key={p.id}>
                  <td className="td max-w-xs truncate font-medium">{p.title}</td>
                  <td className="td text-ink-soft">{p.category}</td>
                  <td className="td text-ink-soft">{formatDate(p.createdAt)}</td>
                  <td className="td text-ink-soft">{p.commentCount}</td>
                  <td className="td">
                    <div className="flex justify-end gap-1">
                      <Link to={`/posts/${p.id}`} className="btn-quiet" aria-label={`View ${p.title}`}>
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </Link>
                      <Link to={`/dashboard/edit/${p.id}`} className="btn-quiet" aria-label={`Edit ${p.title}`}>
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Link>
                      <button onClick={() => remove(p)} className="btn-quiet text-danger" aria-label={`Delete ${p.title}`}>
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={data?.page ?? 0} totalPages={data?.totalPages ?? 0} onChange={setPage} />
    </div>
  );
}