import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DesignCard from '../Designs/DesignCard';
import { useDesignsData } from './useDesignsData';

const CARD_WIDTH = 250;
const GAP = 24;
const STEP = CARD_WIDTH + GAP;

const DesignsListSlider = ({
  designs: designsProp,
  searchTerm = '',
  activeFilter = 'all',
  title = 'Nouveaux designs',
  showViewAll = true,
  showViewAllCard = true,
  limit = 8,
  compactWrapper = false,
}) => {
  const [translateX, setTranslateX] = useState(0);
  const [setWidth, setSetWidth] = useState(0);
  const setARef = useRef(null);
  const navigate = useNavigate();

  const {
    loading,
    error,
    designs: sliderDesigns,
  } = useDesignsData({
    designsProp,
    searchTerm,
    activeFilter,
    limit,
  });

  useEffect(() => {
    if (!setARef.current) return;
    const w = setARef.current.offsetWidth;
    setSetWidth(w);
  }, [sliderDesigns?.length, showViewAllCard]);

  const scrollLeft = () => {
    setTranslateX((prev) => {
      const next = prev + STEP;
      if (setWidth && next > 0) return prev - setWidth;
      return next;
    });
  };

  const scrollRight = () => {
    setTranslateX((prev) => {
      const next = prev - STEP;
      if (setWidth && next < -setWidth) return prev + setWidth;
      return next;
    });
  };

  return (
    <div className={compactWrapper ? 'w-full pt-4 pb-6' : 'w-full mx-auto px-4 sm:px-6 lg:px-5 max-w-7xl pt-4 pb-8 sm:pt-6 sm:pb-10 lg:pt-8 lg:pb-12'}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">{title}</h2>
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
      ) : sliderDesigns.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Aucun design trouve
        </div>
      ) : (
        <>
          <div className="flex items-stretch gap-6 overflow-hidden pb-4 relative">
            {/* Bouton gauche */}
            <button
              type="button"
              onClick={scrollLeft}
              aria-label="Défiler à gauche"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-[#fd4d08] hover:text-white hover:border-[#fd4d08] transition-colors focus:outline-none focus:ring-2 focus:ring-[#fd4d08]"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            {/* Bouton droite */}
            <button
              type="button"
              onClick={scrollRight}
              aria-label="Défiler à droite"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/95 shadow-lg border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-[#fd4d08] hover:text-white hover:border-[#fd4d08] transition-colors focus:outline-none focus:ring-2 focus:ring-[#fd4d08]"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div
              className="flex items-stretch gap-6 shrink-0 transition-transform duration-300 ease-out"
              style={{
                width: 'max-content',
                transform: `translateX(${translateX}px)`,
                willChange: 'transform'
              }}
            >
              {/* Premier set */}
              <div ref={setARef} className="flex items-stretch gap-6 shrink-0">
                {sliderDesigns.map((design) => (
                  <div
                    key={`design-a-${design.id}`}
                    className="shrink-0 w-[200px] sm:w-[220px] lg:w-[250px]"
                  >
                    <DesignCard design={design} compact />
                  </div>
                ))}
                {showViewAllCard && (
                  <div className="shrink-0 w-[200px] sm:w-[220px] lg:w-[250px] flex items-center justify-center self-stretch">
                    <button
                      type="button"
                      onClick={() => navigate('/designs')}
                      className="inline-flex items-center justify-center w-full h-full border border-dashed border-[#fd4d08] text-[#fd4d08] font-semibold rounded-xl hover:bg-[#fd4d08] hover:text-white transition-colors text-sm cursor-pointer"
                    >
                      Voir tous
                    </button>
                  </div>
                )}
              </div>
              {/* Second set (dupliqué pour défilement fluide) */}
              <div className="flex items-stretch gap-6 shrink-0">
                {sliderDesigns.map((design) => (
                  <div
                    key={`design-b-${design.id}`}
                    className="shrink-0 w-[200px] sm:w-[220px] lg:w-[250px]"
                  >
                    <DesignCard design={design} compact />
                  </div>
                ))}
                {showViewAllCard && (
                  <div className="shrink-0 w-[200px] sm:w-[220px] lg:w-[250px] flex items-center justify-center self-stretch">
                    <button
                      type="button"
                      onClick={() => navigate('/designs')}
                      className="inline-flex items-center justify-center w-full h-full border border-dashed border-[#fd4d08] text-[#fd4d08] font-semibold rounded-xl hover:bg-[#fd4d08] hover:text-white transition-colors text-sm cursor-pointer"
                    >
                      Voir tous
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>


          {showViewAll && (
            <div className="text-center mt-8 sm:mt-12">
              <button
                type="button"
                onClick={() => navigate('/designs')}
                className="inline-flex bg-[#fd4d08] hover:bg-[#f1ad2e] text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-200"
              >
                Voir plus de designs
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DesignsListSlider;
