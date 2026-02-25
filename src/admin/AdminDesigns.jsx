import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { resolveApiUrl } from '../utils/api';

import { API_BASE_URL } from '../utils/api';

const normalizeDesigns = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.designs)) return payload.designs;
  return [];
};

const AdminDesigns = () => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const imageCacheBust = useMemo(() => Date.now(), []);

  const categories = useMemo(() => {
    const map = new Map();
    designs.forEach((design) => {
      (design.categories || []).forEach((cat) => {
        if (!map.has(cat.id)) {
          map.set(cat.id, { id: String(cat.id), name: cat.name || `Catégorie ${cat.id}` });
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [designs]);

  const filteredDesigns = useMemo(() => {
    if (selectedCategory === 'all') {
      return [...designs].sort((a, b) => {
        const aName = a.categories?.[0]?.name || '';
        const bName = b.categories?.[0]?.name || '';
        return aName.localeCompare(bName);
      });
    }
    return designs.filter((design) =>
      Array.isArray(design.categories) &&
      design.categories.some((cat) => String(cat.id) === selectedCategory)
    );
  }, [designs, selectedCategory]);

  // Pagination
  const totalPages = useMemo(() => Math.ceil(filteredDesigns.length / itemsPerPage), [filteredDesigns.length, itemsPerPage]);
  const paginatedDesigns = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredDesigns.slice(startIndex, endIndex);
  }, [filteredDesigns, currentPage, itemsPerPage]);

  // Reset à la page 1 quand la catégorie change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  // Scroll vers le haut quand la page, la catégorie ou le nombre d'éléments par page change
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [currentPage, selectedCategory, itemsPerPage]);

  const fetchDesigns = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/designs`);
      if (!response.ok) {
        throw new Error('Impossible de charger les designs.');
      }
      const data = await response.json();
      setDesigns(normalizeDesigns(data));
    } catch (err) {
      setError(err.message || 'Erreur inconnue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  const handleDelete = async (designId) => {
    setDeletingId(designId);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/designs/${designId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Suppression impossible.');
      }
      setDesigns((prev) => prev.filter((design) => design.id !== designId));
    } catch (err) {
      setError(err.message || 'Erreur inconnue.');
    } finally {
      setDeletingId(null);
    }
  };

  const requestDelete = (design) => {
    setConfirmTarget(design);
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

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Designs</h1>
            <Link
              to="/admin/designs/new"
              className="inline-flex items-center rounded-lg bg-[#fd4d08] text-white px-4 py-2 text-sm font-medium hover:bg-[#fda708]"
            >
              Nouveau design
            </Link>
          </div>
          <p className="text-gray-600">
            Gérez vos designs de broderie (création, modification, suppression).
          </p>
        </div>

        <div className="grid gap-6">
          <section id="designs" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-gray-900">
                Liste des designs
                {filteredDesigns.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({filteredDesigns.length} design{filteredDesigns.length > 1 ? 's' : ''})
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-3">
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700"
                >
                  <option value="5">5 par page</option>
                  <option value="10">10 par page</option>
                  <option value="20">20 par page</option>
                  <option value="50">50 par page</option>
                </select>
                <select
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700"
                >
                  <option value="all">Toutes les catégories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={fetchDesigns}
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Rafraîchir
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {loading ? (
              <div className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-gray-500 flex items-center justify-center gap-2">
                <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-gray-200 border-t-[#fd4d08] inline-block" aria-hidden /> Chargement en cours...
              </div>
            ) : filteredDesigns.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-gray-500">
                Aucun design disponible.
              </div>
            ) : (
              <div>
                {/* Vue mobile - Cartes */}
                <div className="block md:hidden space-y-4">
                  {paginatedDesigns.map((design) => (
                    <div
                      key={design.id}
                      className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        {(design.images?.[0] || design.image_path || design.image_url) ? (
                          <img
                            src={`${resolveApiUrl(design.images?.[0] || design.image_path || design.image_url)}?v=${imageCacheBust}`}
                            alt={design.title}
                            className="h-16 w-16 object-cover rounded border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="h-16 w-16 bg-gray-100 rounded border border-gray-200 flex items-center justify-center shrink-0">
                            <span className="text-xs text-gray-400">-</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-mono text-gray-500 mb-0.5">ID: {design.id}</div>
                              <div className="text-sm font-semibold text-gray-900 line-clamp-1">
                                {design.title}
                              </div>
                            </div>
                            {design.is_premium && (
                              <span className="text-xs font-semibold bg-[#fd4d08] text-white px-2 py-0.5 rounded-full shrink-0">
                                Premium
                              </span>
                            )}
                          </div>
                          {design.description && (
                            <div className="text-xs text-gray-500 line-clamp-1 mb-2">
                              {design.description}
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                            {design.categories?.[0]?.name && (
                              <span className="bg-gray-100 px-2 py-0.5 rounded">Cat: {design.categories[0].name}</span>
                            )}
                            <span className="bg-gray-100 px-2 py-0.5 rounded">
                              {design.price || (design.is_premium ? 'Premium' : 'Gratuit')}
                            </span>
                            {design.longueur != null && design.largeur != null && (
                              <span className="bg-gray-100 px-2 py-0.5 rounded">
                                {design.longueur}×{design.largeur}cm
                              </span>
                            )}
                            {design.color != null && (
                              <span className="bg-gray-100 px-2 py-0.5 rounded">
                                {design.color} couleur{design.color !== 1 ? 's' : ''}
                              </span>
                            )}
                            {(Array.isArray(design.images) && design.images.length > 0) && (
                              <span className="bg-gray-100 px-2 py-0.5 rounded">
                                {design.images.length} img
                              </span>
                            )}
                            {(Array.isArray(design.download_files) && design.download_files.length > 0) && (
                              <span className="bg-gray-100 px-2 py-0.5 rounded">
                                {design.download_files.length} fichier{design.download_files.length > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                        <Link
                          to={`/admin/designs/${design.id}`}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Détail
                        </Link>
                        <Link
                          to={`/admin/designs/${design.id}/edit`}
                          className="flex-1 inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          Modifier
                        </Link>
                        <button
                          type="button"
                          onClick={() => requestDelete(design)}
                          disabled={deletingId === design.id}
                          className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-md hover:bg-red-600 disabled:opacity-60 transition-colors"
                        >
                          {deletingId === design.id ? '...' : 'Supp'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Vue desktop - Tableau */}
                <div className="hidden md:block bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Image
                          </th>
                          <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Titre
                          </th>
                          <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Catégorie
                          </th>
                          <th className="px-3 md:px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Prix
                          </th>
                          <th className="hidden xl:table-cell px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Dimensions
                          </th>
                          <th className="hidden xl:table-cell px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Couleurs
                          </th>
                          <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Images
                          </th>
                          <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Fichiers
                          </th>
                          <th className="px-3 md:px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedDesigns.map((design) => (
                        <tr key={design.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 md:px-4 py-3 whitespace-nowrap">
                            {(design.images?.[0] || design.image_path || design.image_url) ? (
                              <img
                                src={`${resolveApiUrl(design.images?.[0] || design.image_path || design.image_url)}?v=${imageCacheBust}`}
                                alt={design.title}
                                className="h-12 w-12 object-cover rounded border border-gray-200"
                              />
                            ) : (
                              <div className="h-12 w-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                                <span className="text-xs text-gray-400">-</span>
                              </div>
                            )}
                          </td>
                          <td className="px-3 md:px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-mono font-medium text-gray-600">
                              {design.id}
                            </div>
                          </td>
                          <td className="px-3 md:px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div>
                                <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                  {design.title}
                                </div>
                                {design.description && (
                                  <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                                    {design.description}
                                  </div>
                                )}
                              </div>
                              {design.is_premium && (
                                <span className="text-xs font-semibold bg-[#fd4d08] text-white px-2 py-0.5 rounded-full shrink-0">
                                  Premium
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="hidden lg:table-cell px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {design.categories?.[0]?.name || '-'}
                            </div>
                          </td>
                          <td className="px-3 md:px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {design.price || (design.is_premium ? 'Premium' : 'Gratuit')}
                            </div>
                          </td>
                          <td className="hidden xl:table-cell px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {design.longueur != null && design.largeur != null ? (
                                <span>{design.longueur} × {design.largeur} cm</span>
                              ) : design.longueur != null ? (
                                <span>L: {design.longueur} cm</span>
                              ) : design.largeur != null ? (
                                <span>l: {design.largeur} cm</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </div>
                          </td>
                          <td className="hidden xl:table-cell px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {design.color != null ? (
                                <span>{design.color} couleur{design.color !== 1 ? 's' : ''}</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </div>
                          </td>
                          <td className="hidden lg:table-cell px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {(Array.isArray(design.images) && design.images.length > 0) ? (
                                <span className="font-medium">{design.images.length}</span>
                              ) : (design.image_path || design.image_url) ? (
                                <span className="font-medium">1</span>
                              ) : (
                                <span className="text-gray-400">0</span>
                              )}
                            </div>
                          </td>
                          <td className="hidden lg:table-cell px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-600">
                              {(Array.isArray(design.download_files) && design.download_files.length > 0) ? (
                                <span className="font-medium">{design.download_files.length}</span>
                              ) : design.file_url ? (
                                <span className="font-medium">1</span>
                              ) : (
                                <span className="text-gray-400">0</span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 md:px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end gap-1 md:gap-2">
                              <Link
                                to={`/admin/designs/${design.id}`}
                                className="inline-flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                                title="Voir en détail"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Voir en détail</span>
                              </Link>
                              <Link
                                to={`/admin/designs/${design.id}/edit`}
                                className="inline-flex items-center px-2 md:px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                              >
                                <span className="hidden sm:inline">Modifier</span>
                                <span className="sm:hidden">Modif</span>
                              </Link>
                              <button
                                type="button"
                                onClick={() => requestDelete(design)}
                                disabled={deletingId === design.id}
                                className="inline-flex items-center px-2 md:px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-md hover:bg-red-600 disabled:opacity-60 transition-colors"
                              >
                                {deletingId === design.id ? (
                                  '...'
                                ) : (
                                  <>
                                    <span className="hidden sm:inline">Supprimer</span>
                                    <span className="sm:hidden">Supp</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-200">
                    <div className="text-sm text-gray-600">
                      Affichage de {(currentPage - 1) * itemsPerPage + 1} à {Math.min(currentPage * itemsPerPage, filteredDesigns.length)} sur {filteredDesigns.length} design{filteredDesigns.length > 1 ? 's' : ''}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Précédent
                      </button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 7) {
                            pageNum = i + 1;
                          } else if (currentPage <= 4) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 3) {
                            pageNum = totalPages - 6 + i;
                          } else {
                            pageNum = currentPage - 3 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                currentPage === pageNum
                                  ? 'bg-[#fd4d08] text-white'
                                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Suivant
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

        </div>
      </div>

      {confirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Supprimer ce design ?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              "{confirmTarget.title}" sera supprimé définitivement.
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

export default AdminDesigns;
