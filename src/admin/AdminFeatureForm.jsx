import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getToken } from '../utils/auth';
import { featuresAPI } from '../utils/api';

const emptyForm = { title: '', description: '' };

const AdminFeatureForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isEditing) return;
    let active = true;
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setError('');
    featuresAPI
      .getById(id, token)
      .then((data) => {
        if (active) {
          setForm({
            title: data.title || '',
            description: data.description ?? ''
          });
        }
      })
      .catch((err) => {
        if (active) setError(err?.message || 'Impossible de charger cette feature.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      setError('Non connecté.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined
      };
      if (isEditing) {
        await featuresAPI.update(id, payload, token);
      } else {
        await featuresAPI.create(payload, token);
      }
      navigate('/admin/features');
    } catch (err) {
      setError(err?.message || 'Échec de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* Fil d'Ariane */}
        <nav className="text-sm text-gray-500 mb-4" aria-label="Fil d'Ariane">
          <Link to="/admin" className="hover:text-gray-700">Admin</Link>
          <span className="mx-1">›</span>
          <Link to="/admin/features" className="hover:text-gray-700">Features</Link>
          <span className="mx-1">›</span>
          <span className="text-gray-900 font-medium">{isEditing ? 'Modifier' : 'Nouvelle'}</span>
        </nav>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {isEditing ? 'Modifier la feature' : 'Créer une feature'}
          </h1>
          <Link
            to="/admin/features"
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            ← Retour à la liste
          </Link>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-gray-500 flex items-center justify-center gap-2">
            <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-gray-200 border-t-[#fd4d08] inline-block" aria-hidden />
            Chargement...
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4"
          >
            <div>
              <label htmlFor="feature-title" className="block text-sm font-medium text-gray-700 mb-1">
                Titre <span className="text-red-500">*</span>
              </label>
              <input
                id="feature-title"
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Ex: Livraison rapide"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#fd4d08] focus:outline-none focus:ring-1 focus:ring-[#fd4d08]"
              />
            </div>
            <div>
              <label htmlFor="feature-description" className="block text-sm font-medium text-gray-700 mb-1">
                Description (optionnel)
              </label>
              <textarea
                id="feature-description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Ex: Recevez vos fichiers sous 24h"
                rows={3}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-[#fd4d08] focus:outline-none focus:ring-1 focus:ring-[#fd4d08]"
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center rounded-lg bg-[#fd4d08] text-white px-4 py-2 text-sm font-medium hover:bg-[#e04300] disabled:opacity-60"
              >
                {saving ? 'Sauvegarde...' : isEditing ? 'Mettre à jour' : 'Créer'}
              </button>
              <Link
                to="/admin/features"
                className="inline-flex items-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminFeatureForm;
