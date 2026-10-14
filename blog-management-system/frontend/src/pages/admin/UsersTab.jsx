import { useCallback, useEffect, useState } from 'react';
import { ShieldCheck, ShieldOff, UserX, UserCheck } from 'lucide-react';
import { adminApi } from '../../api/services.js';
import { getErrorMessage } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Pagination from '../../components/Pagination.jsx';
import { Spinner, ErrorNote, RoleBadge, formatDate } from '../../components/ui.jsx';

export default function UsersTab() {
  const { user: me } = useAuth();
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      setData(await adminApi.users({ page, size: 10 }));
    } catch (e) {
      setError(getErrorMessage(e));
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const replace = (updated) =>
    setData((d) => ({ ...d, content: d.content.map((u) => (u.id === updated.id ? updated : u)) }));

  const run = async (id, action) => {
    setBusyId(id);
    setError('');
    try {
      replace(await action());
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  const toggleAdmin = (u) => {
    const isAdmin = u.roles.includes('ROLE_ADMIN');
    const roles = isAdmin ? ['ROLE_USER'] : ['ROLE_USER', 'ROLE_ADMIN'];
    if (!window.confirm(`${isAdmin ? 'Remove admin rights from' : 'Make admin:'} ${u.username}?`)) return;
    run(u.id, () => adminApi.setRoles(u.id, roles));
  };

  const toggleEnabled = (u) => {
    if (u.enabled && !window.confirm(`Disable ${u.username}? They will be signed out on their next request.`)) return;
    run(u.id, () => adminApi.setEnabled(u.id, !u.enabled));
  };

  if (!data && !error) return <Spinner />;

  return (
    <div>
      <ErrorNote>{error}</ErrorNote>
      {data && (
        <>
          <div className="mt-2 overflow-x-auto rounded-lg border border-line bg-white">
            <table className="w-full min-w-[44rem]">
              <thead className="border-b border-line">
                <tr>
                  <th className="th">User</th>
                  <th className="th">Role</th>
                  <th className="th">Status</th>
                  <th className="th">Joined</th>
                  <th className="th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.content.map((u) => {
                  const self = u.id === me.id;
                  const admin = u.roles.includes('ROLE_ADMIN');
                  return (
                    <tr key={u.id}>
                      <td className="td">
                        <div className="font-medium">{u.username}</div>
                        <div className="text-xs text-ink-faint">{u.email}</div>
                      </td>
                      <td className="td">
                        <RoleBadge role={admin ? 'ROLE_ADMIN' : 'ROLE_USER'} />
                      </td>
                      <td className="td">
                        <span className={u.enabled ? 'text-ok' : 'text-danger'}>{u.enabled ? 'Active' : 'Disabled'}</span>
                      </td>
                      <td className="td text-ink-soft">{formatDate(u.createdAt)}</td>
                      <td className="td">
                        <div className="flex justify-end gap-1">
                          <button className="btn-quiet" disabled={self || busyId === u.id} onClick={() => toggleAdmin(u)}>
                            {admin ? <ShieldOff className="h-4 w-4" aria-hidden="true" /> : <ShieldCheck className="h-4 w-4" aria-hidden="true" />}
                            {admin ? 'Remove admin' : 'Make admin'}
                          </button>
                          <button
                            className={`btn-quiet ${u.enabled ? 'text-danger' : 'text-ok'}`}
                            disabled={self || busyId === u.id}
                            onClick={() => toggleEnabled(u)}
                          >
                            {u.enabled ? <UserX className="h-4 w-4" aria-hidden="true" /> : <UserCheck className="h-4 w-4" aria-hidden="true" />}
                            {u.enabled ? 'Disable' : 'Enable'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} totalPages={data.totalPages} onChange={setPage} />
        </>
      )}
    </div>
  );
}
