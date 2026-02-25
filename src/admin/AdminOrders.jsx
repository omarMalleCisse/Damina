import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../utils/api';

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

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDoneFilter, setIsDoneFilter] = useState(''); // '' = all, 'false' = not done, 'true' = done
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    const token = getToken();
    if (!token) {
      setError('Non connecté.');
      setLoading(false);
      return;
    }
    try {
      const params = {};
      if (isDoneFilter === 'true') params.is_done = true;
      if (isDoneFilter === 'false') params.is_done = false;
      const data = await ordersAPI.list(token, params);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || 'Impossible de charger les commandes.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDone = async (orderId, isDone) => {
    const token = getToken();
    if (!token) return;
    setTogglingId(orderId);
    setError('');
    try {
      await ordersAPI.setDone(orderId, isDone, token);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, is_done: isDone } : o))
      );
    } catch (err) {
      setError(err?.message || 'Erreur lors de la mise à jour.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (orderId) => {
    const token = getToken();
    if (!token) return;
    setDeletingId(orderId);
    setError('');
    try {
      await ordersAPI.delete(orderId, token);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err) {
      setError(err?.message || 'Suppression impossible.');
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [isDoneFilter]);

  const formatDate = (value) => {
    if (!value) return '—';
    try {
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? value : d.toLocaleString('fr-FR');
    } catch {
      return value;
    }
  };

  const itemsPreview = (order) => {
    const items = order.items;
    if (!items) return '—';
    if (typeof items === 'string') {
      try {
        const parsed = JSON.parse(items);
        if (Array.isArray(parsed)) {
          return parsed.length ? `${parsed.length} article(s)` : '—';
        }
      } catch {
        return items.slice(0, 30) + (items.length > 30 ? '…' : '');
      }
    }
    if (Array.isArray(items)) return `${items.length} article(s)`;
    return '—';
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Commandes</h1>
            <Link
              to="/admin"
              className="inline-flex items-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Retour au dashboard
            </Link>
          </div>
          <p className="text-gray-600">
            Liste des commandes (admin : toutes ; sinon uniquement les vôtres). Filtre par statut terminé.
          </p>
        </div>

        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-xl font-semibold text-gray-900">Liste des commandes</h2>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-sm text-gray-600 flex items-center gap-1">
                Statut
                <select
                  value={isDoneFilter}
                  onChange={(e) => setIsDoneFilter(e.target.value)}
                  className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                >
                  <option value="">Toutes</option>
                  <option value="false">Non terminées</option>
                  <option value="true">Terminées</option>
                </select>
              </label>
              <button
                type="button"
                onClick={fetchOrders}
                className="text-sm text-gray-500 hover:text-gray-900 px-2 py-1.5"
              >
                Rafraîchir
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-gray-500 flex items-center justify-center gap-2">
              <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-gray-200 border-t-[#fd4d08] inline-block" aria-hidden /> Chargement des commandes...
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-gray-500">
              Aucune commande.
            </div>
          ) : (
            <>
              {/* Vue mobile : cartes */}
              <div className="space-y-3 md:hidden">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-gray-100">
                      <span className="font-semibold text-gray-900">Commande #{order.id}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${order.is_done ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                        {order.is_done ? 'Terminée' : 'En attente'}
                      </span>
                    </div>
                    <dl className="grid gap-2 text-sm">
                      <div>
                        <dt className="text-gray-500">Client</dt>
                        <dd className="text-gray-900">{order.customer_name ?? '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Email</dt>
                        <dd className="text-gray-900 break-all">{order.customer_email ?? '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Téléphone</dt>
                        <dd className="text-gray-900">{order.customer_phone ?? '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Adresse</dt>
                        <dd className="text-gray-900">{order.customer_address ?? '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Articles</dt>
                        <dd className="text-gray-900">{itemsPreview(order)}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Date</dt>
                        <dd className="text-gray-500">{formatDate(order.created_at)}</dd>
                      </div>
                    </dl>
                    {order.photo_url && (
                      <div className="mt-2">
                        <img src={order.photo_url} alt="Commande" className="h-20 w-20 object-cover rounded border" />
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => handleSetDone(order.id, !order.is_done)}
                        disabled={togglingId === order.id}
                        className="text-sm px-3 py-1.5 rounded-lg bg-[#fd4d08] text-white hover:bg-[#e04300] disabled:opacity-60"
                      >
                        {togglingId === order.id ? '...' : order.is_done ? 'Marquer non terminée' : 'Marquer terminée'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(order)}
                        disabled={deletingId === order.id}
                        className="text-sm text-red-600 hover:text-red-700 disabled:opacity-60"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Vue desktop : tableau */}
              <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tél</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Articles</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{order.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{order.customer_name ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{order.customer_email ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{order.customer_phone ?? '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{itemsPreview(order)}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs ${order.is_done ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                            {order.is_done ? 'Terminée' : 'En attente'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatDate(order.created_at)}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSetDone(order.id, !order.is_done)}
                              disabled={togglingId === order.id}
                              className="text-[#fd4d08] hover:underline disabled:opacity-60"
                            >
                              {order.is_done ? 'Non terminée' : 'Terminée'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDelete(order)}
                              disabled={deletingId === order.id}
                              className="text-red-600 hover:underline disabled:opacity-60"
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Supprimer cette commande ?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Commande #{confirmDelete.id} – {confirmDelete.customer_name}. Réservé aux administrateurs.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => !deletingId && setConfirmDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                disabled={Boolean(deletingId)}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDelete.id)}
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

export default AdminOrders;
