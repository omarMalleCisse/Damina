import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Home, Package, Download } from 'lucide-react';
import { paymentsAPI } from '../utils/api';

const getToken = () =>
  typeof window === 'undefined'
    ? ''
    : localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('access_token') ||
      sessionStorage.getItem('token') ||
      sessionStorage.getItem('accessToken') ||
      '';

const CheckoutSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paymentId = searchParams.get('payment_id') ?? searchParams.get('paymentId');
  const redirectPath = searchParams.get('redirect');
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!paymentId) {
      setLoading(false);
      return;
    }
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    paymentsAPI
      .getById(paymentId, token)
      .then((data) => setPayment(data))
      .catch((err) => setError(err?.message ?? 'Erreur lors de la récupération du statut.'))
      .finally(() => setLoading(false));
  }, [paymentId]);

  useEffect(() => {
    if (redirectPath && !loading) {
      const t = setTimeout(() => navigate(redirectPath, { replace: true }), 2500);
      return () => clearTimeout(t);
    }
  }, [redirectPath, loading, navigate]);

  const stateLabels = {
    COMPLETED: 'Paiement validé',
    PENDING: 'En attente',
    FAILED: 'Échec',
    CANCELLED: 'Annulé',
  };
  const stateLabel = payment?.state ? stateLabels[payment.state] ?? payment.state : null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Paiement effectué</h1>
        <p className="text-gray-600 mb-6">
          Merci pour votre commande. Votre paiement a bien été enregistré.
        </p>

        {loading && paymentId && (
          <div className="flex items-center justify-center gap-2 text-gray-500 mb-6">
            <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-gray-200 border-t-[#fd4d08]" aria-hidden />
            <span>Vérification du statut...</span>
          </div>
        )}

        {!loading && payment && stateLabel && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Statut du paiement</p>
            <p className="font-medium text-gray-900">{stateLabel}</p>
            {payment.reference_id && (
              <p className="text-xs text-gray-500 mt-1">Réf. {payment.reference_id}</p>
            )}
          </div>
        )}

        {error && (
          <p className="text-sm text-amber-600 mb-6">
            Impossible de récupérer le détail (vous pouvez ignorer ce message).
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
          {redirectPath && (
            <button
              type="button"
              onClick={() => navigate(redirectPath)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#fd4d08] text-white font-medium rounded-lg hover:bg-[#e04300] transition border-0 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Accéder au téléchargement
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate('/mes-commandes-pack')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#fd4d08] text-white font-medium rounded-lg hover:bg-[#e04300] transition border-0 cursor-pointer"
          >
            <Package className="w-4 h-4" />
            Mes commandes
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition bg-transparent cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Accueil
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
