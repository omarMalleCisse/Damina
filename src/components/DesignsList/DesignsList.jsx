import React, { useEffect, useState } from 'react';
import DesignCard from "../Designs/DesignCard";
import { useNavigate } from 'react-router-dom';
import { useDesignsData } from './useDesignsData';

const DesignsList = ({ designs: designsProp, searchTerm = '', activeFilter = 'all' }) => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 12;

  const {
    loading,
    error,
    designs: limitedDesigns,
    hasMoreDesigns,
    totalPages,
    totalDesigns,
    currentPage,
  } = useDesignsData({
    designsProp,
    searchTerm,
    activeFilter,
    page,
    limit,
  });

  useEffect(() => {
    setPage(1);
  }, [searchTerm, activeFilter]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  return (

    
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-5 max-w-5xl pt-4 pb-8 sm:pt-6 sm:pb-10 lg:pt-8 lg:pb-12">

       {/* Breadcrumb */}
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <button type="button" onClick={() => navigate('/')} className="hover:text-blue-600 transition bg-transparent border-0 cursor-pointer p-0">
            Accueil
          </button>
          <span>{'>'}</span>
        </nav>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500 flex items-center justify-center gap-2">
          <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-gray-200 border-t-[#fd4d08]" aria-hidden />
          Chargement...
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">
          {error}
        </div>
      ) : limitedDesigns.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Aucun design trouvé
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {limitedDesigns.map((design) => (
              <DesignCard 
                key={`design-${design.id}`} // ✅ Key plus unique
                design={design}
                compact
              />
            ))}
          </div>
          
          <div className="flex items-center justify-center gap-3 mt-6 sm:mt-8 flex-wrap">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="px-4 py-2 text-sm rounded-lg bg-[#fd4d08] text-white font-semibold shadow hover:bg-[#e04300] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#fd4d08]"
              disabled={currentPage <= 1}
            >
              Précédent
            </button>
            <span className="text-sm text-gray-700 font-medium">
              Page {currentPage} {totalPages > 1 ? `/ ${totalPages}` : ''}
              {totalDesigns > 0 && (
                <span className="text-gray-500 font-normal ml-1">
                  ({totalDesigns} design{totalDesigns !== 1 ? 's' : ''})
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              className="px-4 py-2 text-sm rounded-lg bg-[#fd4d08] text-white font-semibold shadow hover:bg-[#e04300] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#fd4d08]"
              disabled={!hasMoreDesigns}
            >
              Suivant
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DesignsList;