import React from 'react'
import { useNavigate } from 'react-router-dom'
import { usePack } from '../../hooks/usePack'

// Valeurs par défaut minimales en cas de fallback
const defaultPackData = {
  title: '',
  subtitle: '',
  delivery: '',
  price: '',
  image: '/assets/image/pack.png',
  ctaLabel: 'Passer la commande',
  ctaTo: '/pack-order',
  badges: [],
}

const PackSection = ({
  data: propData,
  hideCTA = false,
}) => {
  const navigate = useNavigate();
  // Récupérer les données du pack depuis l'API
  const { pack: apiPack, loading } = usePack()
  
  // Utiliser les données de l'API si disponibles, sinon les props, sinon les valeurs par défaut (pour que le bouton s'affiche même si l'API est lente ou en erreur)
  const data = apiPack || propData || defaultPackData
  const { title, subtitle, delivery, price, image, ctaLabel, ctaTo, badges } = {
    ...defaultPackData,
    ...data,
    ctaLabel: data.ctaLabel || defaultPackData.ctaLabel,
    ctaTo: data.ctaTo || defaultPackData.ctaTo,
  }
  
  return (
    <section
      className="relative w-full bg-center bg-cover flex items-center justify-center"
      style={{
        backgroundImage: image ? `url(${image})` : undefined,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        minHeight: '100vh',
        backgroundColor: image ? undefined : '#1f2937', // Fond gris foncé si pas d'image
      }}
      aria-label={title || 'Section pack'}
    >
      {/* Overlay sombre */}
      <div className="absolute inset-0 bg-black/25" />

      {/* Contenu centré sur l'image */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-4 py-10 sm:py-16 text-center">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg mb-4">
          {title}
        </h2>
        <p className="text-lg sm:text-xl md:text-2xl font-semibold text-white drop-shadow mb-3 max-w-xl mx-auto">
          {subtitle}
        </p>
        <p className="text-sm text-white/60 mb-6">
          {delivery}
        </p>

        {/* Prix */}
        <div className="inline-flex items-baseline gap-2 mb-8">
          <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#fd4d08] drop-shadow">{price || '—'}</span>
          <span className="text-sm sm:text-base text-white/70">paiement unique</span>
          {loading && <span className="text-xs text-white/60 ml-2">(chargement…)</span>}
        </div>

        {/* Bouton passer la commande — style action */}
        {!hideCTA && (
          <div className="mb-8">
            <button
              type="button"
              onClick={() => navigate(ctaTo || '/pack-order')}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-w-[220px] bg-[#fd4d08] hover:bg-[#e04300] active:bg-[#c73a00] text-white px-8 py-4 sm:py-5 rounded-xl font-bold text-base sm:text-lg uppercase tracking-wide shadow-xl shadow-[#fd4d08]/40 hover:shadow-2xl hover:shadow-[#fd4d08]/50 hover:scale-105 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-[#fd4d08]/50 focus:ring-offset-2 focus:ring-offset-[#1f2937] border-2 border-white/20 transition-all duration-200"
              aria-label={ctaLabel}
            >
              <span className="inline-block">{ctaLabel}</span>
              <svg className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        )}

        {/* Badges */}
        {badges && badges.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {badges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white text-xs sm:text-sm font-medium px-4 py-2 rounded-full border border-white/20"
              >
                {badge}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default PackSection
