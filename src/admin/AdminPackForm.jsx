import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { packsAPI } from '../utils/api';

const emptyForm = {
  title: '',
  subtitle: '',
  delivery: '',
  price: '',
  cta_label: 'Passer la commande',
  cta_to: '/pack-order',
  badges: '',
};

const AdminPackForm = () => {
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
    const loadPack = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await packsAPI.getById(id);
        if (active) {
          const badgesVal = data.badges;
          const badgesStr = Array.isArray(badgesVal)
            ? badgesVal.join(', ')
            : typeof badgesVal === 'string'
              ? badgesVal
              : '';
          setForm({
            title: data.title ?? '',
            subtitle: data.subtitle ?? '',
            delivery: data.delivery ?? '',
            price: data.price ?? '',
            cta_label: data.cta_label ?? emptyForm.cta_label,
            cta_to: data.cta_to ?? emptyForm.cta_to,
            badges: badgesStr,
          });
        }
      } catch (err) {
        if (active) setError(err?.message || 'Impossible de charger ce pack.');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadPack();
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
    setSaving(true);
    setError('');
    try {
      const badgesStr = (form.badges || '').trim();
      const badges = badgesStr
        ? badgesStr.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

      if (isEditing) {
        await packsAPI.update(id, {
          title: form.title.trim(),
          subtitle: form.subtitle.trim() || null,
          delivery: form.delivery.trim() || null,
          price: form.price.trim() || null,
          cta_label: form.cta_label.trim() || null,
          cta_to: form.cta_to.trim() || null,
          badges: badges.length ? badges : null,
        });
      } else {
        await packsAPI.create({
          title: form.title.trim(),
          subtitle: form.subtitle.trim() || undefined,
          delivery: form.delivery.trim() || undefined,
          price: form.price.trim() || undefined,
          cta_label: form.cta_label.trim() || undefined,
          cta_to: form.cta_to.trim() || undefined,
          badges: badges.length ? badges : undefined,
        });
      }
      navigate('/admin/packs');
    } catch (err) {
      setError(err?.message || 'Échec de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Modifier le pack' : 'Créer un pack'}
          </h1>
          <Link to="/admin/packs" className="text-sm text-gray-500 hover:text-gray-900">
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
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Ex: Pack personnalisé"
                className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#fd4d08]/20"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sous-titre</label>
              <input
                name="subtitle"
                value={form.subtitle}
                onChange={handleChange}
                placeholder="Ex: Livraison rapide"
                className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#fd4d08]/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Livraison / Délai</label>
              <input
                name="delivery"
                value={form.delivery}
                onChange={handleChange}
                placeholder="Ex: Livraison 24-48h"
                className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#fd4d08]/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prix</label>
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="Ex: 29,99 €"
                className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#fd4d08]/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Libellé du bouton</label>
              <input
                name="cta_label"
                value={form.cta_label}
                onChange={handleChange}
                placeholder="Passer la commande"
                className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#fd4d08]/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lien du bouton (URL)</label>
              <input
                name="cta_to"
                value={form.cta_to}
                onChange={handleChange}
                placeholder="/pack-order"
                className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#fd4d08]/20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Badges (séparés par des virgules)</label>
              <input
                name="badges"
                value={form.badges}
                onChange={handleChange}
                placeholder="Ex: Livraison rapide, Support 24/7"
                className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#fd4d08]/20"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-[#fd4d08] text-white py-2.5 font-medium hover:bg-[#e04300] transition disabled:opacity-60"
            >
              {saving ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-gray-200 border-t-[#fd4d08] inline-block" aria-hidden /> Sauvegarde...
                </span>
              ) : (
                isEditing ? 'Mettre à jour' : 'Créer le pack'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminPackForm;
