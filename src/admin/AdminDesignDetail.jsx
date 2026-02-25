import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, ExternalLink, Download, Image as ImageIcon, FileText } from 'lucide-react';
import { resolveApiUrl, getDesignImages } from '../utils/api';

const API_BASE_URL = 'http://localhost:8000';

const AdminDesignDetail = () => {
  const { id } = useParams();
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
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
          setDesign(data);
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
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/designs/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Suppression impossible.');
      }
      window.location.href = '/admin/designs';
    } catch (err) {
      setError(err.message || 'Erreur inconnue.');
      setDeleting(false);
      setShowConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-gray-500 flex items-center justify-center gap-2">
            <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-gray-200 border-t-[#fd4d08] inline-block" aria-hidden /> Chargement en cours...
          </div>
        </div>
      </div>
    );
  }

  if (error || !design) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error || 'Design introuvable.'}
          </div>
          <Link
            to="/admin/designs"
            className="mt-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  const designImages = getDesignImages(design);
  const downloadFiles = Array.isArray(design.download_files) ? design.download_files : [];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/admin/designs"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la liste
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{design.title}</h1>
              <p className="text-gray-600 mt-1">ID: {design.id}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to={`/designs/${design.id}`}
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Voir sur le site
              </Link>
              <Link
                to={`/admin/designs/${design.id}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#fd4d08] rounded-lg hover:bg-[#fda708] transition-colors"
              >
                <Edit className="w-4 h-4" />
                Modifier
              </Link>
              <button
                onClick={() => setShowConfirm(true)}
                disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-60 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            {designImages.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Images ({designImages.length})
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {designImages.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-[#fd4d08] transition-colors"
                    >
                      <img
                        src={url}
                        alt={`${design.title} - Image ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {design.description && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{design.description}</p>
              </div>
            )}

            {/* Fichiers de téléchargement */}
            {downloadFiles.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Fichiers de téléchargement ({downloadFiles.length})
                </h2>
                <div className="space-y-2">
                  {downloadFiles.map((url, index) => {
                    const filename = url.split('/').pop() || `Fichier ${index + 1}`;
                    return (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-[#fd4d08] hover:bg-gray-50 transition-colors group"
                      >
                        <Download className="w-5 h-5 text-gray-400 group-hover:text-[#fd4d08]" />
                        <span className="flex-1 text-sm font-medium text-gray-900 truncate">{filename}</span>
                        <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#fd4d08]" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Informations principales */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Prix</label>
                  <div className="mt-1 text-lg font-semibold text-gray-900">
                    {design.price || (design.is_premium ? 'Premium' : 'Gratuit')}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Type</label>
                  <div className="mt-1">
                    {design.is_premium ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fd4d08] text-white">
                        Premium
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500 text-white">
                        Gratuit
                      </span>
                    )}
                  </div>
                </div>

                {design.categories && design.categories.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Catégories</label>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {design.categories.map((cat) => (
                        <span
                          key={cat.id}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {cat.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(design.longueur != null || design.largeur != null || design.color != null) && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Spécifications techniques</label>
                    <div className="mt-1 space-y-1">
                      {design.longueur != null && design.largeur != null && (
                        <div className="text-sm text-gray-900">
                          <span className="font-medium">Dimensions:</span> {design.longueur} × {design.largeur} cm
                        </div>
                      )}
                      {design.color != null && (
                        <div className="text-sm text-gray-900">
                          <span className="font-medium">Couleurs:</span> {design.color} couleur{design.color !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {design.download_count != null && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Téléchargements</label>
                    <div className="mt-1 text-sm font-semibold text-gray-900">
                      {design.download_count}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* URLs */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">URLs</h2>
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Page publique</label>
                  <a
                    href={`/designs/${design.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block text-sm text-blue-600 hover:text-blue-800 hover:underline truncate"
                  >
                    /designs/{design.id}
                  </a>
                </div>
                {designImages.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Image principale</label>
                    <a
                      href={designImages[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block text-sm text-blue-600 hover:text-blue-800 hover:underline truncate"
                    >
                      {designImages[0].split('/').pop()}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Supprimer ce design ?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              "{design.title}" sera supprimé définitivement. Cette action est irréversible.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-60"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-60"
              >
                {deleting ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDesignDetail;
