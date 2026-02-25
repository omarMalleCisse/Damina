import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, ArrowLeft, X, PlusCircle, MinusCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import SimilarDesigns from './SimilarDesigns';
import { designsAPI, resolveApiUrl, getDesignImages, getDesignMainImage } from '../utils/api';
import { LoadingState } from '../components/ui';
import { usePayDesign } from '../hooks/usePayDesign';

const DesignDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const designId = Number(id);
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showZoom, setShowZoom] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const imgRef = useRef(null);
  // ✅ SCROLL AUTOMATIQUE VERS LE HAUT
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // Animation fluide
    });
  }, [id]); // Se déclenche à chaque changement d'ID

  useEffect(() => {
    let active = true;
    const loadDesign = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await designsAPI.getById(id);
        if (active) {
          setDesign(data);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Design introuvable.');
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

  useEffect(() => {
    setGalleryIndex(0);
  }, [id]);

  useEffect(() => {
    if (!showZoom) setZoom(1);
  }, [showZoom]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setShowZoom(false);
    };
    if (showZoom) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showZoom]);

  const clampZoom = (v) => Math.max(1, Math.min(4, v));

  const handleWheel = (e) => {
    if (!showZoom) return;
    e.preventDefault();
    const delta = -e.deltaY * 0.0015;
    setZoom((z) => clampZoom(Number((z + delta).toFixed(2))));
  };

  /**
   * URLs de téléchargement : champ download_files (tableau d'URLs complètes) ou file_url en fallback.
   * Chaque entrée = { url, ext } pour afficher des liens « Télécharger » par format.
   */
  const downloadUrls = React.useMemo(() => {
    const list =
      Array.isArray(design?.download_files) && design.download_files.length > 0
        ? design.download_files
        : design?.file_url
          ? [design.file_url]
          : [];
    return list.map((u) => {
      const url = typeof u === 'string' && u.startsWith('http') ? u : resolveApiUrl(u);
      const ext = (url.split('.').pop() || '').split(/[?#]/)[0].toLowerCase();
      return { url, ext };
    });
  }, [design?.download_files, design?.file_url]);

  const designImages = React.useMemo(() => getDesignImages(design), [design]);
  const mainImageUrl = getDesignMainImage(design) || design?.image;
  const zoomImageUrl = designImages[galleryIndex] || mainImageUrl;

  const { handleBuy, paying, payError } = usePayDesign(design);

  if (loading) {
    return (
      <section className="px-4 py-12">
        <LoadingState message="Chargement du design..." variant="full" />
      </section>
    );
  }

  if (error || !design) {
    return (
      <section className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <p className="text-gray-700 mb-4">{error || 'Design introuvable.'}</p>
          <button
            type="button"
            onClick={() => navigate('/designs')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#fd4d08] text-white text-sm font-semibold rounded-xl hover:bg-[#e64507] transition-colors border-0 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Retour aux designs
          </button>
        </div>
      </section>
    );
  }

  const priceLabel = design.price || (design.is_premium ? 'Premium' : 'Gratuit');
  const downloadCount = design.download_count ?? design.downloads ?? 0;

  return (
    <section className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-6 sm:py-8 lg:py-10">
      <button
        type="button"
        onClick={() => navigate('/designs')}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#fd4d08] transition-colors mb-6 sm:mb-8 bg-transparent border-0 cursor-pointer p-0"
      >
        <ArrowLeft className="w-4 h-4" /> Retour aux designs
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 lg:items-start">
        {/* Galerie : images[] ou image_path en fallback */}
        <div className="relative group">
          <div className="relative overflow-hidden rounded-2xl border border-gray-200/80 bg-gray-50 shadow-sm">
            {mainImageUrl ? (
              <>
                <button
                  type="button"
                  onClick={() => setShowZoom(true)}
                  className="w-full block cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-[#fd4d08]/40 focus:ring-offset-2 rounded-2xl"
                >
                  <img
                    ref={imgRef}
                    src={designImages[galleryIndex] || mainImageUrl}
                    alt={`${design.title} ${designImages.length > 1 ? `(${galleryIndex + 1}/${designImages.length})` : ''}`}
                    className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </button>
              </>
            ) : (
              <div className="w-full aspect-square flex items-center justify-center text-gray-400">
                Pas d&apos;image
              </div>
            )}
          </div>
          {design.is_premium && (
            <span className="absolute top-3 right-3 px-2.5 py-1 bg-gradient-to-r from-[#ec9c23] to-[#eb4f11] text-white text-xs font-semibold rounded-lg shadow z-10">
              Premium
            </span>
          )}
          {designImages.length > 1 && (
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setGalleryIndex((i) => (i === 0 ? designImages.length - 1 : i - 1))}
                className="shrink-0 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-200 flex items-center justify-center text-gray-700 transition"
                aria-label="Image précédente"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex-1 flex gap-2 overflow-x-auto pb-1 scrollbar-hide min-w-0">
                {designImages.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setGalleryIndex(i)}
                    className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-[#fd4d08]/50 focus:ring-offset-2 ${
                      i === galleryIndex
                        ? 'border-[#fd4d08] ring-2 ring-[#fd4d08]/30'
                        : 'border-gray-200 hover:border-gray-300 opacity-80 hover:opacity-100'
                    }`}
                    aria-label={`Voir image ${i + 1}`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setGalleryIndex((i) => (i === designImages.length - 1 ? 0 : i + 1))}
                className="shrink-0 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-200 flex items-center justify-center text-gray-700 transition"
                aria-label="Image suivante"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Infos */}
        <div className="lg:sticky lg:top-24">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight mb-3">
            {design.title}
          </h1>
          {design.description && (
            <p className="text-gray-600 leading-relaxed mb-6 text-base sm:text-lg">
              {design.description}
            </p>
          )}

          {/* Spécifications techniques */}
          {(design.longueur != null || design.largeur != null || design.color != null) && (
            <div className="mb-6 p-4 sm:p-5 rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white shadow-sm">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1 h-5 bg-gradient-to-b from-[#ec9c23] to-[#fd4d08] rounded-full"></span>
                Spécifications techniques
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {(design.longueur != null || design.largeur != null) && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 font-medium mb-0.5">Dimensions</div>
                      <div className="text-sm sm:text-base font-semibold text-gray-900">
                        {design.longueur != null && design.largeur != null ? (
                          <span>{design.longueur} × {design.largeur} cm</span>
                        ) : design.longueur != null ? (
                          <span>Longueur: {design.longueur} cm</span>
                        ) : design.largeur != null ? (
                          <span>Largeur: {design.largeur} cm</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )}
                {design.color != null && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 font-medium mb-0.5">Couleurs</div>
                      <div className="text-sm sm:text-base font-semibold text-gray-900">
                        {design.color} couleur{design.color !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-[#ec9c23] via-[#eb4f11] to-[#fd4d08] bg-clip-text text-transparent">
              {priceLabel}
            </span>
            {downloadCount > 0 && (
              <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-medium">
                {downloadCount} téléchargement{downloadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* CTA principal : Acheter (PayTech) ou Télécharger gratuitement */}
          <div className="flex flex-col gap-3">
            {design.is_premium ? (
              <>
                {payError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {payError}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleBuy}
                  disabled={paying}
                  className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 bg-gradient-to-r from-[#ec9c23] via-[#eb4f11] to-[#fd4d08] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-base sm:text-lg hover:opacity-95 disabled:opacity-70"
                >
                  {paying ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden />
                      Redirection vers PayTech...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <Download className="w-6 h-6 shrink-0" />
                      Acheter ce design
                    </span>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => navigate(`/designs/${design.id}/download`)}
                className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 bg-gradient-to-r from-[#ec9c23] via-[#eb4f11] to-[#fd4d08] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-base sm:text-lg hover:opacity-95 border-0 cursor-pointer"
              >
                <Download className="w-6 h-6 shrink-0" />
                Télécharger gratuitement
              </button>
            )}
            {downloadUrls.length > 0 && (
              <div className="text-sm text-gray-500 space-y-1">
                <p>
                  {downloadUrls.length} fichier{downloadUrls.length > 1 ? 's' : ''} à télécharger — cliquez sur le bouton ci-dessus pour choisir le format.
                </p>
                <p className="text-xs text-gray-600 flex flex-wrap gap-x-2 gap-y-0.5">
                  {downloadUrls.map(({ filename }, i) => (
                    <span key={i} className="bg-gray-100 px-2 py-0.5 rounded">
                      {filename}
                    </span>
                  ))}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <SimilarDesigns currentId={designId} />

      {/* Zoom modal */}
      {showZoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onWheel={handleWheel}
        >
          <div className="absolute inset-0" onClick={() => setShowZoom(false)} aria-hidden="true" />

          <div className="relative w-full max-w-5xl flex flex-col items-center">
            <button
              aria-label="Fermer"
              onClick={() => setShowZoom(false)}
              className="absolute -top-12 right-0 sm:right-4 bg-white/95 hover:bg-white rounded-full p-2.5 shadow-lg z-50 transition-colors"
            >
              <X className="w-5 h-5 text-gray-800" />
            </button>

            <div className="flex items-center gap-2 mb-3 z-40 px-3 py-2 rounded-full bg-white/10 backdrop-blur-md text-white">
              <button
                onClick={() => setZoom((z) => clampZoom(Number((z - 0.25).toFixed(2))))}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Zoom moins"
              >
                <MinusCircle className="w-5 h-5" />
              </button>
              <span className="min-w-[4rem] text-center text-sm font-medium">x{zoom.toFixed(2)}</span>
              <button
                onClick={() => setZoom((z) => clampZoom(Number((z + 0.25).toFixed(2))))}
                className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Zoom plus"
              >
                <PlusCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full max-h-[85vh] flex items-center justify-center overflow-hidden rounded-2xl bg-gray-900/95 shadow-2xl border border-white/10">
              <img
                src={zoomImageUrl}
                alt={design.title}
                style={{ transform: `scale(${zoom})`, transition: 'transform 160ms ease' }}
                className="max-w-none max-h-[80vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default DesignDetailPage;