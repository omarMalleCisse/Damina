import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getToken } from '../utils/auth';
import { featuresAPI } from '../utils/api';

const AdminFeatures = () => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const fetchFeatures = useCallback(async () => {
    setLoading(true);
    setError('');
    const token = getToken();
    if (!token) {
      setError('Non connecté.');
      setLoading(false);
      return;
    }
    try {
      const data = await featuresAPI.listAdmin(token);
      setFeatures(Array.isArray(data) ? data : data?.items || []);
    } catch (err) {
      setError(err?.message || 'Impossible de charger les features.');
      setFeatures([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  const handleDelete = async (featureId) => {
    const token = getToken();
    if (!token) return;
    setDeletingId(featureId);
    setError('');
    try {
      await featuresAPI.delete(featureId, token);
      setFeatures((prev) => prev.filter((f) => f.id !== featureId));
      setConfirmTarget(null);
    } catch (err) {
      setError(err?.message || 'Erreur lors de la suppression.');
    } finally {
      setDeletingId(null);
    }
  };

  const requestDelete = (feature) => setConfirmTarget(feature);
  const closeConfirm = () => {
    if (!deletingId) setConfirmTarget(null);
  };

  const formatDate = (value) => {
    if (!value) return '—';
    try {
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? value : d.toLocaleString('fr-FR');
    } catch {
      return value;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* Fil d'Ariane */}
        <nav className="text-sm text-gray-500 mb-4" aria-label="Fil d'Ariane">
          <Link to="/admin" className="hover:text-gray-700">Admin</Link>
          <span className="mx-1">›</span>
          <span className="text-gray-900 font-medium">Features</span>
        </nav>

        <div className="flex flex-col gap-3 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestion des features</h1>
            <div className="flex items-center gap-2">
              <Link
                to="/admin"
                className="inline-flex items-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Retour au dashboard
              </Link>
              <Link
                to="/admin/features/new"
                className="inline-flex items-center rounded-lg bg-[#fd4d08] text-white px-4 py-2 text-sm font-medium hover:bg-[#e04300]"
              >
                Nouvelle feature
              </Link>
            </div>
          </div>
          <p className="text-gray-600">
            Gérez les avantages / features affichés sur la page d&apos;accueil (titres et descriptions).
          </p>
        </div>

        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-xl font-semibold text-gray-900">Liste des features</h2>
            <button
              type="button"
              onClick={fetchFeatures}
              className="text-sm text-gray-500 hover:text-gray-900 px-2 py-1.5"
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
              <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-gray-200 border-t-[#fd4d08] inline-block" aria-hidden />
              Chargement des features...
            </div>
          ) : features.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-gray-500">
              Aucune feature. Cliquez sur &quot;Nouvelle feature&quot; pour en créer une.
            </div>
          ) : (
            <>
              {/* Vue mobile : cartes */}
              <div className="space-y-3 md:hidden">
                {features.map((feature) => (
                  <div
                    key={feature.id}
                    className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-gray-100">
                      <span className="font-semibold text-gray-900">{feature.title || '—'}</span>
                      <span className="text-xs text-gray-400">ID {feature.id}</span>
                    </div>
                    {feature.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{feature.description}</p>
                    )}
                    <div className="text-xs text-gray-400 mb-3">{formatDate(feature.created_at)}</div>
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/admin/features/${feature.id}/edit`}
                        className="text-sm font-medium text-[#fd4d08] hover:text-[#e04300]"
                      >
                        Modifier
                      </Link>
                      <button
                        type="button"
                        onClick={() => requestDelete(feature)}
                        disabled={deletingId === feature.id}
                        className="text-sm text-red-600 hover:text-red-700 disabled:opacity-60"
                      >
                        {deletingId === feature.id ? 'Suppression...' : 'Supprimer'}
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {features.map((feature) => (
                      <tr key={feature.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                          {feature.id}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {feature.title || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                          {feature.description || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                          {formatDate(feature.created_at)}
                        </td>
                        <td className="px-4 py-3 text-right text-sm whitespace-nowrap">
                          <Link
                            to={`/admin/features/${feature.id}/edit`}
                            className="text-[#fd4d08] font-medium hover:text-[#e04300] mr-4"
                          >
                            Modifier
                          </Link>
                          <button
                            type="button"
                            onClick={() => requestDelete(feature)}
                            disabled={deletingId === feature.id}
                            className="text-red-600 hover:text-red-700 disabled:opacity-60"
                          >
                            {deletingId === feature.id ? 'Suppression...' : 'Supprimer'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        {/* Modal de confirmation de suppression */}
        {confirmTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Supprimer cette feature ?
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                &quot;{confirmTarget.title}&quot; sera supprimée définitivement.
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
                  onClick={() => confirmTarget && handleDelete(confirmTarget.id)}
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
    </div>
  );
};

export default AdminFeatures;
