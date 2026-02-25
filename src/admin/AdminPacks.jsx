import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { packsAPI } from '../utils/api';

const AdminPacks = () => {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const fetchPacks = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await packsAPI.list();
      setPacks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || 'Impossible de charger les packs.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (packId) => {
    setDeletingId(packId);
    setError('');
    try {
      await packsAPI.delete(packId);
      setPacks((prev) => prev.filter((p) => p.id !== packId));
    } catch (err) {
      setError(err?.message || 'Suppression impossible.');
    } finally {
      setDeletingId(null);
    }
  };

  const requestDelete = (pack) => {
    setConfirmTarget(pack);
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
    fetchPacks();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Packs</h1>
            <Link
              to="/admin/packs/new"
              className="inline-flex items-center rounded-lg bg-[#fd4d08] text-white px-4 py-2 text-sm font-medium hover:bg-[#e04300]"
            >
              Nouveau pack
            </Link>
          </div>
          <p className="text-gray-600">
            Gérez le pack affiché sur la page d&apos;accueil (titre, prix, CTA, badges).
          </p>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Liste des packs</h2>
            <button
              type="button"
              onClick={fetchPacks}
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
              <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-gray-200 border-t-[#fd4d08] inline-block" aria-hidden /> Chargement des packs...
            </div>
          ) : packs.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-gray-500">
              Aucun pack. Créez-en un pour l&apos;afficher sur la page d&apos;accueil.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {packs.map((pack) => (
                <div
                  key={pack.id}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex flex-col gap-2"
                >
                  <div>
                    <div className="text-sm text-gray-500">ID {pack.id}</div>
                    <div className="font-semibold text-gray-900">{pack.title || '—'}</div>
                    {pack.subtitle && (
                      <div className="text-sm text-gray-600 mt-0.5 line-clamp-2">{pack.subtitle}</div>
                    )}
                    {pack.price && (
                      <div className="text-sm font-medium text-[#fd4d08] mt-1">{pack.price}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-auto pt-2">
                    <Link
                      to={`/admin/packs/${pack.id}/edit`}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      Modifier
                    </Link>
                    <button
                      type="button"
                      onClick={() => requestDelete(pack)}
                      disabled={deletingId === pack.id}
                      className="text-sm text-red-600 hover:text-red-700 disabled:opacity-60"
                    >
                      {deletingId === pack.id ? 'Suppression...' : 'Supprimer'}
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
              Supprimer ce pack ?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              &quot;{confirmTarget.title}&quot; sera supprimé définitivement.
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

export default AdminPacks;
