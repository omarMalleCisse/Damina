import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8000';

const emptyForm = {
  name: '',
  icon: ''
};

const AdminCategoryForm = () => {
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
    const loadCategory = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${API_BASE_URL}/api/categories/${id}`);
        if (!response.ok) {
          throw new Error('Impossible de charger cette catégorie.');
        }
        const data = await response.json();
        if (active) {
          setForm({
            name: data.name || '',
            icon: data.icon || ''
          });
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Erreur inconnue.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadCategory();
    return () => {
      active = false;
    };
  }, [id, isEditing]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const url = isEditing
        ? `${API_BASE_URL}/api/categories/${id}`
        : `${API_BASE_URL}/api/categories`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: form.name.trim(),
          icon: form.icon.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Échec de la sauvegarde.');
      }

      navigate('/admin/categories');
    } catch (err) {
      setError(err.message || 'Erreur inconnue.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Modifier une catégorie' : 'Créer une catégorie'}
          </h1>
          <Link
            to="/admin/categories"
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            Retour à la liste
          </Link>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-gray-500 flex items-center justify-center gap-2">
            <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-gray-200 border-t-[#fd4d08] inline-block" aria-hidden /> Chargement...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ex: Femmes"
                className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#fd4d08]/20"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icône
              </label>
              <input
                name="icon"
                value={form.icon}
                onChange={handleChange}
                placeholder="🌿 ou icon name"
                className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#fd4d08]/20"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-[#fd4d08] text-white py-2.5 font-medium hover:bg-[#fda708] transition disabled:opacity-60"
            >
              {saving ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-gray-200 border-t-[#fd4d08] inline-block" aria-hidden /> Sauvegarde...
                </span>
              ) : (
                isEditing ? 'Mettre à jour' : 'Créer'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminCategoryForm;
