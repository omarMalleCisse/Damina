import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { API_BASE_URL } from '../utils/api';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`);
      if (!response.ok) {
        throw new Error('Impossible de charger les catégories.');
      }
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : data?.items || []);
    } catch (err) {
      setError(err.message || 'Erreur inconnue.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (categoryId) => {
    setDeletingId(categoryId);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories/${categoryId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Suppression impossible.');
      }
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
    } catch (err) {
      setError(err.message || 'Erreur inconnue.');
    } finally {
      setDeletingId(null);
    }
  };

  const requestDelete = (category) => {
    setConfirmTarget(category);
  };

  const closeConfirm = () => {
    if (deletingId) return;
    setConfirmTarget(null);
  };

  const confirmDelete = async () => {
    if (!confirmTarget) return;
    await handleDelete(confirmTarget.id);
    setConfirmTarget(null);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Catégories</h1>
            <Link
              to="/admin/categories/new"
              className="inline-flex items-center rounded-lg bg-[#fd4d08] text-white px-4 py-2 text-sm font-medium hover:bg-[#fda708]"
            >
              Nouvelle catégorie
            </Link>
          </div>
          <p className="text-gray-600">
            Gérez vos catégories de designs.
          </p>
        </div>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Liste des catégories</h2>
            <button
              type="button"
              onClick={fetchCategories}
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
              <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-gray-200 border-t-[#fd4d08] inline-block" aria-hidden /> Chargement des catégories...
            </div>
          ) : categories.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-gray-500">
              Aucune catégorie disponible.
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm text-gray-500">ID {category.id}</div>
                    <div className="font-semibold text-gray-900">{category.name}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {category.icon && (
                      <span className="text-xl" aria-hidden="true">
                        {category.icon}
                      </span>
                    )}
                    <Link
                      to={`/admin/categories/${category.id}/edit`}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      Modifier
                    </Link>
                    <button
                      type="button"
                      onClick={() => requestDelete(category)}
                      disabled={deletingId === category.id}
                      className="text-sm text-red-600 hover:text-red-700 disabled:opacity-60"
                    >
                      {deletingId === category.id ? 'Suppression...' : 'Supprimer'}
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
              Supprimer cette catégorie ?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              "{confirmTarget.name}" sera supprimée définitivement.
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

export default AdminCategories;
