import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI } from '../utils/api';

const getToken = () =>
  typeof window === 'undefined'
    ? ''
    : localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('access_token') ||
      sessionStorage.getItem('token') ||
      sessionStorage.getItem('accessToken') ||
      '';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    const token = getToken();
    if (!token) {
      setError('Non connecté.');
      setLoading(false);
      return;
    }
    try {
      const data = await usersAPI.list(token);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || 'Impossible de charger les utilisateurs.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    setDeletingId(userId);
    setError('');
    const token = getToken();
    try {
      await usersAPI.delete(userId, token);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      setError(err?.message || 'Suppression impossible.');
    } finally {
      setDeletingId(null);
    }
  };

  const requestDelete = (user) => {
    setConfirmTarget(user);
  };

  const closeConfirm = () => {
    if (!deletingId) setConfirmTarget(null);
  };

  const confirmDelete = async () => {
    if (!confirmTarget) return;
    await handleDelete(confirmTarget.id);
    setConfirmTarget(null);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Utilisateurs</h1>
            <Link
              to="/admin"
              className="inline-flex items-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Retour au dashboard
            </Link>
          </div>
          <p className="text-gray-600">
            Liste des utilisateurs. Modifier ou supprimer (réservé admin).
          </p>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Liste des utilisateurs</h2>
            <button
              type="button"
              onClick={fetchUsers}
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              Rafraîchir
            </button>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-gray-500 flex items-center justify-center gap-2">
              <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-gray-200 border-t-[#fd4d08] inline-block" aria-hidden /> Chargement des utilisateurs...
            </div>
          ) : users.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-gray-500">
              Aucun utilisateur.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex flex-col gap-2"
                >
                  <div>
                    <div className="text-sm text-gray-500">ID {user.id}</div>
                    <div className="font-semibold text-gray-900">{user.username ?? user.email ?? '—'}</div>
                    {user.email && (
                      <div className="text-sm text-gray-600 truncate" title={user.email}>{user.email}</div>
                    )}
                    {user.is_admin && (
                      <span className="inline-block mt-1 text-xs font-medium text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-auto pt-2">
                    <Link
                      to={`/admin/users/${user.id}/edit`}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      Modifier
                    </Link>
                    <button
                      type="button"
                      onClick={() => requestDelete(user)}
                      disabled={deletingId === user.id}
                      className="text-sm text-red-600 hover:text-red-700 disabled:opacity-60"
                    >
                      {deletingId === user.id ? 'Suppression...' : 'Supprimer'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {confirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Supprimer cet utilisateur ?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              &quot;{confirmTarget.username ?? confirmTarget.email}&quot; sera supprimé définitivement.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeConfirm}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                disabled={Boolean(deletingId)}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-60"
                disabled={Boolean(deletingId)}
              >
                {deletingId ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
