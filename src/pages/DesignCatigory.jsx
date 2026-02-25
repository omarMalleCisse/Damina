import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DesignsList from '../components/DesignsList/DesignsList';
import SearchBar from '../components/SearchBar/SearchBar';
import { categoriesAPI, designsAPI } from '../utils/api';

export const DesignCatigory = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categoryId, setCategoryId] = useState('');

  const filters = [
    { id: 'all', label: 'Tous' },
    { id: 'free', label: 'Gratuit' },
    { id: 'premium', label: 'Premium' },
    { id: 'popular', label: 'Les plus téléchargés' }
  ];

  useEffect(() => {
    let active = true;
    const loadCategory = async () => {
      try {
        const categories = await categoriesAPI.list();
        const decodedCategory = decodeURIComponent(category);
        const asNumber = Number(decodedCategory);
        if (!Number.isNaN(asNumber)) {
          if (active) {
            setCategoryId(String(asNumber));
          }
          return;
        }
        const match = (categories || []).find(
          (cat) => cat.name?.toLowerCase() === decodedCategory.toLowerCase()
        );
        if (active) {
          setCategoryId(match?.id ? String(match.id) : '');
        }
      } catch (err) {
        if (active) {
          setCategoryId('');
        }
      }
    };

    loadCategory();
    return () => {
      active = false;
    };
  }, [category]);

  useEffect(() => {
    let active = true;
    const loadDesigns = async () => {
      setLoading(true);
      setError('');
      try {
        const result = await designsAPI.list({
          filter: activeFilter,
          category: categoryId,
          page: 1,
          limit: 100,
        });
        if (active) {
          setDesigns(result?.items ?? result ?? []);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Impossible de charger les designs.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDesigns();
    return () => {
      active = false;
    };
  }, [activeFilter, categoryId]);

  // ✅ Utiliser useMemo pour stabiliser les calculs
  const filteredDesigns = useMemo(() => {
    let filtered = designs;
    if (searchTerm) {
      filtered = filtered.filter(design =>
        design.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        design.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [designs, searchTerm]);

  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
  
  // ✅ Mémoriser le texte du compteur pour éviter les re-rendus
  const countText = useMemo(() => {
    const count = filteredDesigns.length;
    return `${count} design${count > 1 ? 's' : ''} disponible${count > 1 ? 's' : ''}`;
  }, [filteredDesigns.length]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <button type="button" onClick={() => navigate('/')} className="hover:text-blue-600 transition bg-transparent border-0 cursor-pointer p-0">
            Accueil
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium">{categoryTitle}</span>
        </nav>
      </div>

      {/* En-tête de la catégorie */}
          <div className="w-full bg-gradient-to-r from-[#ec9c23] via-[#eb4f11] to-[#ee1313] shadow-md m-1">
            <div className="container mx-auto px-4 py-3">
              <h1 className="text-2xl font-bold mb-1 text-white">
                Designs {categoryTitle}
              </h1>
              <p className="text-white text-opacity-90 text-sm">
                {countText}
              </p>
            </div>
          </div>

      {/* Barre de recherche et filtres */}
      <div className="container mx-auto px-4 py-6">
        <SearchBar 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          filters={filters}
        />
      </div>

      {/* Liste des designs */}
      <div className="container mx-auto px-4 pb-12">
        {loading ? (
          <div className="text-center py-20 text-gray-500 flex items-center justify-center gap-2">
            <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-gray-200 border-t-[#fd4d08]" aria-hidden />
            Chargement...
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : filteredDesigns.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">😕</div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              Aucun design trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              Essayez de modifier vos filtres ou votre recherche
            </p>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition border-0 cursor-pointer"
            >
              Retour à l'accueil
            </button>
          </div>
        ) : (
          <DesignsList 
            key={`list-${activeFilter}-${filteredDesigns.length}`}
            designs={filteredDesigns} 
          />
        )}
      </div>
    </div>
  );
};