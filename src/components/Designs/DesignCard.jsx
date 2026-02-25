import React, { useState } from 'react';
import { Download, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDesignMainImage } from '../../utils/api';

const DesignCard = ({ design, disableLink = false, compact = false }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();

  const handleFavoriteToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  // ✅ Contenu de la carte (pour éviter la duplication)
  const cardContent = (
    <div className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300">
      {/* Image container */}
      <div className={`relative ${compact ? 'aspect-[3/2]' : 'aspect-square'} overflow-hidden bg-gray-100`}>
        <img
          src={
            getDesignMainImage(design) ||
            'https://images.unsplash.com/photo-1618172193622-ae2d025f4032?w=600&h=600&fit=crop'
          }
          alt={design.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className={`absolute top-0 left-0 right-0 ${compact ? 'p-1.5' : 'p-2 sm:p-3 lg:p-4'} flex items-start justify-between`}>
          {!design.is_premium && (
            <span className={`${compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs'} bg-green-500 text-white font-semibold rounded-full shadow-lg`}>
              Gratuit
            </span>
          )}

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={handleFavoriteToggle}
              aria-label="Ajouter aux favoris"
              className={`${compact ? 'p-1' : 'p-1.5 sm:p-2'} bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-lg`}
            >
              <Heart className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5'} transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
            </button>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className={compact ? 'p-1.5 sm:p-2' : 'p-3 sm:p-4 lg:p-5'}>
        <div className={compact ? 'mb-1' : 'mb-2 sm:mb-3'}>
          <h3 className={`${compact ? 'text-xs' : 'text-sm sm:text-base lg:text-lg'} font-semibold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-600 transition-colors`}>
            {design.title}
          </h3>
          <p className="hidden">
            {design.description}
          </p>
          <div className="flex items-center gap-1 text-[10px] text-gray-500">
            <Download className={`${compact ? 'w-2.5 h-2.5' : 'w-3 h-3 sm:w-3.5 sm:h-3.5'}`} />
            <span className="text-[10px]">{design.download_count ?? design.downloads ?? 0}</span>
          </div>
          {(design.longueur || design.largeur || design.color) && (
            <div className={`${compact ? 'text-[9px]' : 'text-[10px]'} text-gray-500 mt-0.5`}>
              {design.longueur && design.largeur && (
                <span>{design.longueur} × {design.largeur} cm</span>
              )}
              {design.color && (
                <span className={design.longueur && design.largeur ? ' ml-1.5' : ''}>
                  {design.color} couleur{design.color > 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}
        </div>

        <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0 ${compact ? 'pt-1.5' : 'pt-2 sm:pt-3'} border-t border-gray-100`}>
          <div className="flex flex-col">
            <span className={`${compact ? 'hidden' : 'text-xs'} text-gray-500 mb-0.5 hidden sm:block`}>Prix</span>
            <span className={`${compact ? 'text-sm' : 'text-lg sm:text-xl lg:text-2xl'} font-bold text-gray-900`}>
              {design.price || (design.is_premium ? 'Premium' : 'Gratuit')}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex gap-2 items-center">
            {design.is_premium ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  navigate(`/designs/${design.id}`);
                }}
                className={`${compact ? 'px-1.5 py-1 text-[10px]' : 'px-3 py-2 text-sm'} rounded font-medium text-white bg-[#fd4d08] hover:bg-[#fda708] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/40 inline-flex items-center justify-center`}
              >
                Acheter
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  navigate(`/designs/${design.id}/download`);
                }}
                className={`${compact ? 'px-1.5 py-1 text-[10px]' : 'px-3 py-2 text-sm'} rounded font-medium text-white bg-[#fd4d08] hover:bg-[#fda708] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/40 inline-flex items-center justify-center`}
              >
                Télécharger
              </button>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ✅ Retourner avec ou sans Link selon disableLink
  if (disableLink) {
    return <div className="block">{cardContent}</div>;
  }

  return (
    <div
      className="block cursor-pointer"
      role="link"
      tabIndex={0}
      onClick={() => navigate(`/designs/${design.id}`)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          navigate(`/designs/${design.id}`);
        }
      }}
    >
      {cardContent}
    </div>
  );
};

export default DesignCard;