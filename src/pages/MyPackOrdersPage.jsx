import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
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

const MyPackOrdersPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const hasNavigatedRef = useRef(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      if (!hasNavigatedRef.current) {
        hasNavigatedRef.current = true;
        navigate('/login', { replace: true, state: { from: '/mes-commandes-pack' } });
      }
      return;
    }
    hasNavigatedRef.current = false;
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError('');
    packOrdersAPI
      .list(token, {})
      .then((data) => {
        if (active) setOrders(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (active) setError(err?.message || 'Impossible de charger vos commandes.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isAuthenticated, navigate]);

  const formatDate = (value) => {
    if (!value) return '—';
    try {
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? value : d.toLocaleString('fr-FR');
    } catch {
      return value;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Redirection vers la connexion...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex flex-col gap-3 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mes commandes pack</h1>
          <p className="text-gray-600 text-sm">
            Retrouvez ici l&apos;historique de vos commandes pack.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/pack-order"
              className="inline-flex items-center rounded-lg bg-[#fd4d08] text-white px-4 py-2 text-sm font-medium hover:bg-[#e04300] transition"
            >
              Passer une nouvelle commande pack
            </Link>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">
            {error ?? ''}
          </div>
        )}

        {loading ? (
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-12 text-center text-gray-500 flex items-center justify-center gap-2">
            <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-gray-200 border-t-[#fd4d08]" aria-hidden />
            Chargement...
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-12 text-center">
            <p className="text-gray-600 mb-4">Vous n&apos;avez pas encore de commande pack.</p>
            <Link
              to="/pack-order"
              className="inline-flex items-center rounded-lg bg-[#fd4d08] text-white px-4 py-2 text-sm font-medium hover:bg-[#e04300] transition"
            >
              Passer ma première commande
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {orders.map((order) => (
              <li
                key={order.id}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-gray-900">
                      Commande #{order.id}
                      {order.pack ? ` · ${(order.pack.title ?? '') || (order.pack.id != null ? `Pack #${order.pack.id}` : '') || ''}` : (order.pack_id != null ? ` · Pack #${order.pack_id}` : '')}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {formatDate(order.created_at)}
                    </div>
                    {order.pack?.price != null && (
                      <div className="text-sm font-medium text-[#fd4d08] mt-0.5">{order.pack.price ?? ''}</div>
                    )}
                    {(order.user?.phone || order.customer_phone || order.phone) && (
                      <div className="text-sm text-gray-600 mt-1">
                        Tél. {String(order.user?.phone ?? order.customer_phone ?? order.phone ?? '')}
                      </div>
                    )}
                    {(order.user?.address || order.customer_address || order.address) && (
                      <div className="text-sm text-gray-600 mt-0.5 max-w-md truncate">
                        {String(order.user?.address ?? order.customer_address ?? order.address ?? '')}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MyPackOrdersPage;
