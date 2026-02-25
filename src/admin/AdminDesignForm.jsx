import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { resolveApiUrl } from '../utils/api';

import { API_BASE_URL } from '../utils/api';

const emptyForm = {
  title: '',
  description: '',
  price: '',
  is_premium: false,
  longueur: '',
  largeur: '',
  color: ''
};

const AdminDesignForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageFileList, setImageFileList] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [fileFile, setFileFile] = useState(null);
  const [existingFileUrl, setExistingFileUrl] = useState('');
  const [downloadFileList, setDownloadFileList] = useState([]);
  const [existingDownloadFiles, setExistingDownloadFiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  /** Formats broderie acceptés (download_files) : DST, JEF, PES, PEC, HUS, VIP, VP3, SEW, XXX, EXP, PCS, PSC, EMD, PHC, SHV */
  const EMBROIDERY_ACCEPT = '.dst,.jef,.pes,.pec,.hus,.vip,.vp3,.sew,.xxx,.exp,.pcs,.psc,.emd,.phc,.shv';

  useEffect(() => {
    if (!isEditing) return;
    let active = true;
    const loadDesign = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${API_BASE_URL}/api/designs/${id}`);
        if (!response.ok) {
          throw new Error('Impossible de charger ce design.');
        }
        const data = await response.json();
        if (active) {
          setForm({
            title: data.title || '',
            description: data.description || '',
            price: data.price || '',
            is_premium: Boolean(data.is_premium),
            longueur: data.longueur ?? '',
            largeur: data.largeur ?? '',
            color: data.color ?? ''
          });
          setExistingFileUrl(data.file_url || '');
          setExistingDownloadFiles(Array.isArray(data.download_files) ? data.download_files : []);
          setSelectedCategories((data.categories || []).map((cat) => String(cat.id)));
          const imgs = Array.isArray(data.images) && data.images.length > 0
            ? data.images.map((u) => (typeof u === 'string' && u.startsWith('http') ? u : resolveApiUrl(u)))
            : data.image_path || data.image_url
              ? [resolveApiUrl(data.image_path || data.image_url)]
              : [];
          setExistingImages(imgs);
          if (imgs[0]) setImagePreview(imgs[0]);
          else if (data.image_url || data.image_path) {
            setImagePreview(resolveApiUrl(data.image_url || data.image_path));
          }
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

    loadDesign();
    return () => {
      active = false;
    };
  }, [id, isEditing]);

  useEffect(() => {
    let active = true;
    const loadCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/categories`);
        if (!response.ok) return;
        const data = await response.json();
        if (active) {
          setCategories(Array.isArray(data) ? data : data?.items || []);
        }
      } catch {
        // ignore category load errors
      }
    };
    loadCategories();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) {
        try {
          URL.revokeObjectURL(imagePreview);
        } catch {
          // ignore revoke errors
        }
      }
    };
  }, [imagePreview]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleCategory = (idValue) => {
    setSelectedCategories((prev) => {
      if (prev.includes(idValue)) {
        return prev.filter((item) => item !== idValue);
      }
      return [...prev, idValue];
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const url = isEditing
        ? `${API_BASE_URL}/api/designs/${id}`
        : `${API_BASE_URL}/api/designs`;
      const method = isEditing ? 'PUT' : 'POST';

      let response;
      if (imageFile || imageFileList.length > 0 || fileFile || downloadFileList.length > 0) {
        const payload = new FormData();
        payload.append('title', form.title.trim());
        payload.append('description', form.description.trim());
        payload.append('price', form.price.trim());
        payload.append('is_premium', String(form.is_premium));
        if (form.longueur) payload.append('longueur', String(form.longueur));
        if (form.largeur) payload.append('largeur', String(form.largeur));
        if (form.color) payload.append('color', String(form.color));
        selectedCategories.forEach((catId) => payload.append('category_ids', catId));
        if (imageFile) {
          payload.append('image', imageFile);
        }
        imageFileList.forEach((file) => {
          payload.append('images', file);
        });
        if (fileFile) {
          payload.append('file', fileFile);
          payload.append('design_file', fileFile);
        }
        downloadFileList.forEach((file) => {
          payload.append('download_files', file);
        });

        response = await fetch(url, {
          method,
          body: payload
        });

        if (!response.ok && isEditing) {
          // fallback for backends that don't accept multipart PUT
          response = await fetch(url, {
            method: 'POST',
            headers: {
              'X-HTTP-Method-Override': 'PUT'
            },
            body: payload
          });
        }
      } else {
        response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: form.title.trim(),
            description: form.description.trim(),
            price: form.price.trim(),
            is_premium: form.is_premium,
            longueur: form.longueur ? Number(form.longueur) : undefined,
            largeur: form.largeur ? Number(form.largeur) : undefined,
            color: form.color ? Number(form.color) : undefined,
            category_ids: selectedCategories.map((catId) => Number(catId))
          })
        });
      }

      if (!response.ok) {
        const text = await response.text().catch(() => null);
        throw new Error(text || 'Échec de la sauvegarde.');
      }

      let savedDesign = null;
      const responseType = response.headers.get('content-type') || '';
      if (responseType.includes('application/json')) {
        savedDesign = await response.json().catch(() => null);
      }

      if (Array.isArray(savedDesign?.images) && savedDesign.images.length > 0) {
        const urls = savedDesign.images.map((u) => (typeof u === 'string' && u.startsWith('http') ? u : resolveApiUrl(u)));
        setExistingImages(urls);
        setImagePreview(`${urls[0]}?v=${Date.now()}`);
      } else if (savedDesign?.image_url || savedDesign?.image_path) {
        const nextUrl = resolveApiUrl(savedDesign.image_url || savedDesign.image_path);
        setImagePreview(`${nextUrl}?v=${Date.now()}`);
      }
      if (typeof savedDesign?.file_url === 'string') {
        setExistingFileUrl(savedDesign.file_url);
      }
      if (Array.isArray(savedDesign?.download_files)) {
        setExistingDownloadFiles(savedDesign.download_files);
      }

      navigate('/admin/designs');
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
            {isEditing ? 'Modifier un design' : 'Créer un design'}
          </h1>
          <Link
            to="/admin/designs"
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
                Titre
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Ex: Motif floral"
                className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#fd4d08]/20"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description du design"
                rows="4"
                className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#fd4d08]/20"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix
              </label>
              <input
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="Ex: 9.99"
                className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#fd4d08]/20"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longueur (cm)
                </label>
                <input
                  type="number"
                  name="longueur"
                  value={form.longueur}
                  onChange={handleChange}
                  placeholder="Ex: 15"
                  min="0"
                  step="0.1"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#fd4d08]/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Largeur (cm)
                </label>
                <input
                  type="number"
                  name="largeur"
                  value={form.largeur}
                  onChange={handleChange}
                  placeholder="Ex: 10"
                  min="0"
                  step="0.1"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#fd4d08]/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de couleurs
                </label>
                <input
                  type="number"
                  name="color"
                  value={form.color}
                  onChange={handleChange}
                  placeholder="Ex: 5"
                  min="0"
                  step="1"
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#fd4d08]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Images (plusieurs) — création ou ajout en édition
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = e.target.files ? Array.from(e.target.files) : [];
                  setImageFileList((prev) => (files.length ? [...prev, ...files] : prev));
                  if (files.length && !imagePreview) {
                    setImagePreview(URL.createObjectURL(files[0]));
                  }
                }}
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm"
              />
              {imageFileList.length > 0 && (
                <ul className="mt-2 text-xs text-gray-600 space-y-1">
                  {imageFileList.map((f, i) => (
                    <li key={`img-${i}`} className="flex items-center justify-between">
                      <span>{f.name}</span>
                      <button
                        type="button"
                        onClick={() => setImageFileList((prev) => prev.filter((_, j) => j !== i))}
                        className="text-red-600 hover:underline"
                      >
                        Retirer
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {existingImages.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    Images actuelles ({existingImages.length})
                  </p>
                  <ul className="space-y-2">
                    {existingImages.map((url, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 rounded border border-gray-200 overflow-hidden focus:ring-2 focus:ring-[#fd4d08]/40"
                        >
                          <img src={`${url}?v=${Date.now()}`} alt="" className="h-14 w-14 object-cover" />
                        </a>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#fd4d08] hover:underline"
                        >
                          Ouvrir l&apos;image {i + 1}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image principale (1 fichier, optionnel)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files && event.target.files[0];
                  if (!file) {
                    setImageFile(null);
                    if (imageFileList.length === 0 && existingImages.length === 0) setImagePreview('');
                    return;
                  }
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }}
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Envoyée en &quot;image&quot;. Si vous utilisez &quot;Images (plusieurs)&quot;, la première peut servir d&apos;image principale.
              </p>
              {imagePreview && (
                <img src={imagePreview} alt="Aperçu" className="mt-2 h-40 w-full object-cover rounded-lg border" />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fichiers broderie (download_files) — création : plusieurs fichiers ; mise à jour : ajout à la liste
              </label>
              <input
                type="file"
                accept={EMBROIDERY_ACCEPT}
                multiple
                onChange={(e) => {
                  const files = e.target.files ? Array.from(e.target.files) : [];
                  setDownloadFileList((prev) => (files.length ? [...prev, ...files] : prev));
                }}
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm"
              />
              {downloadFileList.length > 0 && (
                <ul className="mt-2 text-xs text-gray-600 space-y-1">
                  {downloadFileList.map((f, i) => (
                    <li key={`${f.name}-${i}`} className="flex items-center justify-between">
                      <span>{f.name}</span>
                      <button
                        type="button"
                        onClick={() => setDownloadFileList((prev) => prev.filter((_, j) => j !== i))}
                        className="text-red-600 hover:underline"
                      >
                        Retirer
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {existingDownloadFiles.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-600 mb-1">
                    Fichiers actuels ({existingDownloadFiles.length})
                  </p>
                  <ul className="space-y-1">
                    {existingDownloadFiles.map((url, i) => {
                      const name = url.split('/').pop() || url;
                      return (
                        <li key={i} className="flex items-center justify-between gap-2 text-xs">
                          <a
                            href={url.startsWith('http') ? url : resolveApiUrl(url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#fd4d08] hover:underline truncate"
                          >
                            {name}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload fichier (legacy, optionnel)
              </label>
              <input
                type="file"
                onChange={(event) => {
                  const file = event.target.files && event.target.files[0];
                  if (!file) {
                    setFileFile(null);
                    return;
                  }
                  setFileFile(file);
                }}
                className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm"
              />
              {existingFileUrl && (
                <p className="text-xs text-gray-500 mt-2">
                  Fichier actuel: {existingFileUrl}
                </p>
              )}
            </div>

            <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                name="is_premium"
                checked={form.is_premium}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-[#fd4d08] focus:ring-[#fd4d08]/20"
              />
              Premium
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégories
              </label>
              {categories.length === 0 ? (
                <div className="text-sm text-gray-500">Aucune catégorie disponible.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categories.map((category) => {
                    const value = String(category.id);
                    return (
                      <label key={category.id} className="inline-flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(value)}
                          onChange={() => toggleCategory(value)}
                          className="h-4 w-4 rounded border-gray-300 text-[#fd4d08] focus:ring-[#fd4d08]/20"
                        />
                        <span>{category.name}</span>
                      </label>
                    );
                  })}
                </div>
              )}
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

export default AdminDesignForm;
