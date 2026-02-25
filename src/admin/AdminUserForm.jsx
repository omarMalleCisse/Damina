import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { usersAPI } from '../utils/api';

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

const emptyForm = {
  username: '',
  email: '',
  phone: '',
  address: '',
  is_active: true,
  is_admin: false
};

const AdminUserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let active = true;
    const token = getToken();
    const loadUser = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await usersAPI.getById(id, token);
        if (active) {
          setForm({
            username: data.username ?? '',
            email: data.email ?? '',
            phone: data.phone ?? '',
            address: data.address ?? '',
            is_active: data.is_active ?? true,
            is_admin: data.is_admin ?? false
          });
        }
      } catch (err) {
        if (active) setError(err?.message || 'Impossible de charger cet utilisateur.');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadUser();
    return () => {
      active = false;
    };
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setError('');
    const token = getToken();
    try {
      const payload = {
        username: form.username.trim() || undefined,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        address: form.address.trim() || undefined,
        is_active: form.is_active,
        is_admin: form.is_admin
      };
      await usersAPI.update(id, payload, token);
      navigate('/admin/users');
    } catch (err) {
      setError(err?.message || 'Échec de la mise à jour.');
    } finally {
      setSaving(false);
    }
  };

  if (!id) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <p className="text-gray-600">ID utilisateur manquant.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Modifier l&apos;utilisateur</h1>
          <Link to="/admin/users" className="text-sm text-gray-500 hover:text-gray-900">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom d&apos;utilisateur</label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#fd4d08]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#fd4d08]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#fd4d08]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#fd4d08]/20"
              />
            </div>
            <div className="flex flex-wrap gap-6">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-[#fd4d08] focus:ring-[#fd4d08]"
                />
                <span className="text-sm font-medium text-gray-700">Compte actif</span>
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_admin"
                  checked={form.is_admin}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-[#fd4d08] focus:ring-[#fd4d08]"
                />
                <span className="text-sm font-medium text-gray-700">Administrateur</span>
              </label>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-[#fd4d08] text-white py-2.5 font-medium hover:bg-[#e04300] transition disabled:opacity-60"
            >
              {saving ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-gray-200 border-t-[#fd4d08] inline-block" aria-hidden /> Enregistrement...
                </span>
              ) : (
                'Mettre à jour'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminUserForm;
