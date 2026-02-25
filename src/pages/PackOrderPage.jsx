import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { usePack } from '../hooks/usePack'
import OrderForm from '../components/OrderForm/OrderForm'

const defaultPackData = { price: '' }

const PackOrderPage = () => {
  const { isAuthenticated } = useAuth()
  const { pack: apiPack, loading } = usePack()
  const data = apiPack || defaultPackData
  const price = data.price || ''
  const packItems = apiPack
    ? [{ title: apiPack.title || 'Pack', quantity: 1 }]
    : [{ title: 'Pack', quantity: 1 }]

  // Afficher la page en haut à chaque visite (ne pas rester en bas)
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-gray-200 border-t-[#fd4d08]" aria-hidden />
        <span className="ml-2 text-gray-600">Chargement...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4">
        {/* Prix uniquement */}
        <div className="text-center mb-6">
          <div className="inline-flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-[#fd4d08]">{price}</span>
            <span className="text-sm text-gray-600">paiement unique</span>
          </div>
        </div>

        {isAuthenticated ? (
          apiPack ? (
            <OrderForm compact title="" items={packItems} />
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm text-center text-gray-600">
              Aucun pack disponible pour le moment.
            </div>
          )
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
            <p className="text-gray-700 text-sm mb-4">Connectez-vous pour passer votre commande.</p>
            <Link
              to="/login"
              state={{ from: '/pack-order' }}
              className="block w-full px-4 py-3 bg-[#fd4d08] text-white rounded-lg font-medium text-center hover:bg-[#e04300] transition"
            >
              Se connecter
            </Link>
            <p className="text-xs text-gray-400 mt-3 text-center">
              Pas encore de compte ?{' '}
              <Link to="/register" state={{ from: '/pack-order' }} className="text-[#fd4d08] hover:underline">
                Créer un compte
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PackOrderPage
