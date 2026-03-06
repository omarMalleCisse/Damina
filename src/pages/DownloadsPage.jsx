import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Download, CheckCircle, ArrowLeft, Package } from 'lucide-react';
import { ordersAPI, downloadsAPI } from '../utils/api';
import { getToken } from '../utils/auth';
import toast from 'react-hot-toast';

/**
 * Page /downloads
 * - Avec ?order_id=123 : charge la commande via GET /api/orders/{id}, affiche "Paiement réussi" et la liste des designs avec liens /designs/{id}/download
 * - Sans order_id : affiche la liste de tous les téléchargements de l'utilisateur (GET /api/downloads)
 */
const DownloadsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id');

  const [mode, setMode] = useState(orderId ? 'order' : 'list'); // 'order' | 'list'
  const [order, setOrder] = useState(null);
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = getToken();

  /** Redirige vers la page de téléchargement du design (fichiers un par un). */
  const handleDownload = useCallback(
    (designId) => {
      if (!token) {
        toast.error('Connectez-vous pour télécharger.');
        navigate('/login', { state: { from: '/downloads' } });
        return;
      }
      navigate(`/designs/${designId}/download`);
    },
    [token, navigate]
  );

  // Charger la commande si order_id présent
  useEffect(() => {
    if (!orderId) {
      setMode('list');
      return;
    }
    setMode('order');
    setLoading(true);
    setError(null);
    if (!token) {
      setError('Connectez-vous pour accéder à vos téléchargements.');
      setLoading(false);
      return;
    }
    ordersAPI
      .getById(orderId, token)
      .then((data) => setOrder(data))
      .catch((err) => setError(err?.message ?? 'Impossible de charger la commande.'))
      .finally(() => setLoading(false));
  }, [orderId, token]);

  // Charger la liste des téléchargements (sans order_id)
  useEffect(() => {
    if (orderId) return;
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    downloadsAPI
      .list(token)
      .then((data) => setDownloads(Array.isArray(data) ? data : []))
      .catch((err) => {
        setError(err?.message ?? 'Impossible de charger les téléchargements.');
        setDownloads([]);
      })
      .finally(() => setLoading(false));
  }, [orderId, token]);

  const formatDate = (value) => {
    if (!value) return '—';
    try {
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? value : d.toLocaleString('fr-FR');
    } catch {
      return value;
    }
  };

  // Extraire les designs de la commande (items peuvent être { design_id, design?, quantity } ou similaires)
  const orderDesigns = React.useMemo(() => {
    if (!order) return [];
    const items = order.items ?? order.designs ?? [];
    return items.map((item) => {
      const designId = item.design_id ?? item.design?.id;
      const design = item.design ?? item;
      const title = design?.name ?? design?.title ?? design?.design_name ?? (designId != null ? `Design #${designId}` : 'Design');
      return { designId, title, quantity: item.quantity ?? 1 };
    }).filter((d) => d.designId != null);
  }, [order]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {mode === 'order' ? 'Téléchargements de la commande' : 'Mes téléchargements'}
        </h1>

        {loading && (
          <div className="flex items-center justify-center gap-2 py-12 text-gray-500">
            <span className="h-6 w-6 shrink-0 animate-spin rounded-full border-2 border-gray-200 border-t-[#fd4d08]" aria-hidden />
            <span>Chargement...</span>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-6">
            {error}
          </div>
        )}

        {!loading && !error && mode === 'order' && order && (
          <>
            <div className="flex items-center gap-3 p-4 mb-6 rounded-xl bg-green-50 border border-green-200">
              <CheckCircle className="w-8 h-8 text-green-600 shrink-0" />
              <p className="text-green-800 font-medium">
                Paiement réussi. Téléchargez vos designs ci-dessous.
              </p>
            </div>

            {orderDesigns.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-gray-500">
                Aucun design dans cette commande.
              </div>
            ) : (
              <ul className="space-y-3">
                {orderDesigns.map(({ designId, title, quantity }) => (
                  <li key={designId}>
                    <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{title}</p>
                        {quantity > 1 && (
                          <p className="text-sm text-gray-500">Quantité : {quantity}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDownload(designId)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#fd4d08] text-white font-medium rounded-lg hover:bg-[#e04300] transition shrink-0"
                      >
                        <Download className="w-4 h-4" />
                        Télécharger
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
              >
                <Package className="w-4 h-4" />
                Voir les designs
              </button>
            </div>
          </>
        )}

        {!loading && !error && mode === 'list' && (
          <>
            <p className="text-gray-600 mb-6">
              Historique de vos téléchargements.
            </p>

            {!token ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-6 text-center text-amber-800">
                <p className="mb-4">Connectez-vous pour voir vos téléchargements.</p>
                <button
                  type="button"
                  onClick={() => navigate('/login', { state: { from: '/downloads' } })}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#fd4d08] text-white font-medium rounded-lg hover:bg-[#e04300]"
                >
                  Se connecter
                </button>
              </div>
            ) : downloads.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-gray-500">
                Aucun téléchargement enregistré.
              </div>
            ) : (
              <div className="space-y-3">
                {downloads.map((row, index) => {
                  const designLabel = row.design_title ?? row.design_name ?? row.title ?? (row.design_id != null ? `Design #${row.design_id}` : '—');
                  const designId = row.design_id ?? row.design?.id;
                  return (
                    <div
                      key={row.id ?? index}
                      className="flex items-center justify-between gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{designLabel}</p>
                        <p className="text-sm text-gray-500">{formatDate(row.created_at ?? row.downloaded_at ?? row.date)}</p>
                      </div>
                      {designId != null && (
                        <button
                          type="button"
                          onClick={() => handleDownload(designId)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#fd4d08] text-white font-medium rounded-lg hover:bg-[#e04300] transition shrink-0"
                        >
                          <Download className="w-4 h-4" />
                          Télécharger
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DownloadsPage;
