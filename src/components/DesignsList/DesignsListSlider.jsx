import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DesignCard from '../Designs/DesignCard';
import { useDesignsData } from './useDesignsData';

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
  const [isHovered, setIsHovered] = useState(false);
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
          <div
            className="flex items-stretch gap-6 overflow-hidden pb-4 relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <style>{`
              @keyframes designs-slider-scroll {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
            `}</style>
            <div
              className="flex items-stretch gap-6 shrink-0"
              style={{
                width: 'max-content',
                animation: 'designs-slider-scroll 30s linear infinite',
                animationPlayState: isHovered ? 'paused' : 'running',
                willChange: 'transform'
              }}
            >
              {/* Premier set */}
              {sliderDesigns.map((design) => (
                <div
                  key={`design-a-${design.id}`}
                  className="shrink-0 w-[200px] sm:w-[220px] lg:w-[250px]"
                >
                  <DesignCard design={design} compact />
                </div>
              ))}
              {showViewAllCard && (
                <div key="voir-tous-a" className="shrink-0 w-[200px] sm:w-[220px] lg:w-[250px] flex items-center justify-center self-stretch">
                  <button
                    type="button"
                    onClick={() => navigate('/designs')}
                    className="inline-flex items-center justify-center w-full h-full border border-dashed border-[#fd4d08] text-[#fd4d08] font-semibold rounded-xl hover:bg-[#fd4d08] hover:text-white transition-colors text-sm cursor-pointer"
                  >
                    Voir tous
                  </button>
                </div>
              )}
              {/* Second set (dupliqué pour boucle infinie) */}
              {sliderDesigns.map((design) => (
                <div
                  key={`design-b-${design.id}`}
                  className="shrink-0 w-[200px] sm:w-[220px] lg:w-[250px]"
                >
                  <DesignCard design={design} compact />
                </div>
              ))}
              {showViewAllCard && (
                <div key="voir-tous-b" className="shrink-0 w-[200px] sm:w-[220px] lg:w-[250px] flex items-center justify-center self-stretch">
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
