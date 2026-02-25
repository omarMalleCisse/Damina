import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { XCircle, Home, Download } from 'lucide-react';

const CheckoutCancelPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fromDownload = searchParams.get('from') === 'download';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-amber-600" />
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Paiement annulé</h1>
        <p className="text-gray-600 mb-6">
          {fromDownload
            ? "Le paiement n'a pas été effectué. Vous pouvez réessayer depuis la page du design."
            : "Votre paiement n'a pas été effectué. Vous pouvez revenir au panier et réessayer."}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => navigate('/designs')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#fd4d08] text-white font-medium rounded-lg hover:bg-[#e04300] transition border-0 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            {fromDownload ? 'Retour aux designs' : 'Réessayer'}
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

export default CheckoutCancelPage;
