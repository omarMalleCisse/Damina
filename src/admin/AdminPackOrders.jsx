import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { packOrdersAPI } from '../utils/api';

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

const AdminPackOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userIdFilter, setUserIdFilter] = useState('');
  const [isDoneFilter, setIsDoneFilter] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    const token = getToken();
    if (!token) {
      setError('Non connecté.');
      setLoading(false);
      return;
    }
    try {
      const params = { limit: 500 };
      if (userIdFilter.trim()) params.user_id = userIdFilter.trim();
      if (isDoneFilter === 'true') params.is_done = true;
      if (isDoneFilter === 'false') params.is_done = false;
      const data = await packOrdersAPI.list(token, params);
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || 'Impossible de charger les commandes pack.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [userIdFilter, isDoneFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const formatDate = (value) => {
    if (!value) return '—';
    try {
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? value : d.toLocaleString('fr-FR');
    } catch {
      return value;
    }
  };

  const orderUserName = (order) =>
    order.user?.username ?? order.user?.full_name ?? order.customer_name ?? '—';
  const orderUserEmail = (order) =>
    order.user?.email ?? order.customer_email ?? '—';

  const parseItems = (order) => {
    const raw = order.items;
    if (raw == null) return [];
    if (Array.isArray(raw)) return raw;
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [];
    }
  };

  const itemsSummary = (order) => {
    const arr = parseItems(order);
    if (arr.length === 0) return '—';
    return arr.map((it) => `${it.title || it.name || '?'} × ${it.quantity ?? 1}`).join(', ');
  };

  const packTitle = (order) =>
    order.pack ? (order.pack.title || `Pack #${order.pack.id ?? order.pack_id}`) : (order.pack_id != null ? `Pack #${order.pack_id}` : '—');

  const handleDelete = useCallback(async (orderId) => {
    if (!window.confirm('Supprimer cette commande pack ?')) return;
    const token = getToken();
    if (!token) return;
    setDeletingId(orderId);
    try {
      await packOrdersAPI.delete(orderId, token);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch (err) {
      setError(err?.message || 'Erreur lors de la suppression.');
    } finally {
      setDeletingId(null);
    }
  }, []);

  const handleToggleDone = useCallback(async (orderId, currentIsDone) => {
    const token = getToken();
    if (!token) return;
    setTogglingId(orderId);
    try {
      const updated = await packOrdersAPI.update(orderId, { is_done: !currentIsDone }, token);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, is_done: updated.is_done } : o)));
    } catch (err) {
      setError(err?.message || 'Erreur lors de la mise à jour.');
    } finally {
      setTogglingId(null);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Commandes personnalisées</h1>
              <p className="mt-1 text-sm text-gray-500">Filtres : user_id, Terminé</p>
            </div>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition"
            >
              ← Retour au dashboard
            </Link>
          </div>
        </header>

        {/* Filtres */}
        <div className="mb-6 rounded-2xl bg-white border border-gray-200/80 p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">user_id</span>
              <input
                type="text"
                placeholder="ex: 5"
                value={userIdFilter}
                onChange={(e) => setUserIdFilter(e.target.value)}
                className="w-24 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:border-[#fd4d08] focus:ring-1 focus:ring-[#fd4d08] focus:outline-none"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">Terminé</span>
              <select
                value={isDoneFilter}
                onChange={(e) => setIsDoneFilter(e.target.value)}
                className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:border-[#fd4d08] focus:ring-1 focus:ring-[#fd4d08] focus:outline-none"
              >
                <option value="">Tous</option>
                <option value="false">Non</option>
                <option value="true">Oui</option>
              </select>
            </label>
            <button
              type="button"
              onClick={fetchOrders}
              className="rounded-lg bg-[#fd4d08] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#e04300] transition"
            >
              Rafraîchir
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-white border border-gray-200 py-16 text-gray-500">
            <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-gray-200 border-t-[#fd4d08] inline-block" aria-hidden /> Chargement des commandes...
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl bg-white border border-gray-200 py-16 text-center text-gray-500">
            Aucune commande pack.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {orders.map((order) => (
              <article
                key={order.id}
                className="group flex flex-col overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm transition hover:shadow hover:border-gray-300"
              >
                {/* Image compacte */}
                <div className="relative h-28 w-full shrink-0 overflow-hidden bg-gray-100">
                  {order.photo_url ? (
                    <a
                      href={order.photo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block h-full w-full focus:outline-none focus:ring-2 focus:ring-[#fd4d08] focus:ring-inset"
                    >
                      <img
                        src={order.photo_url}
                        alt={`#${order.id}`}
                        className="h-full w-full object-cover transition group-hover:scale-[1.03]"
                      />
                    </a>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-300">
                      <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-2.5">
                  <div className="mb-1.5 flex items-center justify-between gap-1">
                    <span className="rounded bg-[#fd4d08]/10 px-1.5 py-0.5 text-xs font-semibold text-[#fd4d08]">#{order.id}</span>
                    <div className="flex items-center gap-1">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${order.is_done ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}
                        title={order.is_done ? 'Terminée' : 'En cours'}
                      >
                        {order.is_done ? 'Terminée' : 'En cours'}
                      </span>
                      <span className="text-[10px] text-gray-400">{formatDate(order.created_at)}</span>
                    </div>
                  </div>
                  <p className="mb-1 truncate text-xs font-medium text-gray-900" title={orderUserName(order)}>{orderUserName(order)}</p>
                  <p className="mb-1 truncate text-[11px] text-gray-600" title={orderUserEmail(order)}>{orderUserEmail(order)}</p>
                  <p className="truncate text-[11px] text-gray-500">{packTitle(order)} · {itemsSummary(order)}</p>

                  {/* Actions */}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-gray-100 pt-2">
                    <button
                      type="button"
                      onClick={() => handleToggleDone(order.id, order.is_done)}
                      disabled={togglingId === order.id}
                      className="rounded border border-gray-200 px-2 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {togglingId === order.id ? '…' : order.is_done ? 'Marquer non terminé' : 'Marquer terminé'}
                    </button>
                    {order.photo_url && (
                      <a
                        href={order.photo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded border border-gray-200 px-2 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50 hover:text-[#fd4d08]"
                      >
                        Voir photo
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(order.id)}
                      disabled={deletingId === order.id}
                      className="rounded border border-red-200 px-2 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingId === order.id ? '…' : 'Supprimer'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPackOrders;
