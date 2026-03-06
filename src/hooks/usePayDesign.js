import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentsAPI } from '../utils/api';
import { getToken } from '../utils/auth';

/**
 * Hook pour déclencher le paiement PayTech pour un design premium.
 * Paiement par design : POST /api/payments/create avec { design_id, amount, currency } puis redirection vers redirect_url.
 * Après succès PayTech, l'utilisateur est redirigé vers /designs/:id/download.
 */
export const usePayDesign = (design) => {
  const navigate = useNavigate();
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState(null);

  const handleBuy = useCallback(
    async (e) => {
      e?.preventDefault?.();
      e?.stopPropagation?.();

      if (!design?.id) return;

      const token = getToken();
      if (!token) {
        navigate('/login', { state: { from: `/designs/${design.id}` }, replace: false });
        return;
      }

      const price = design.price ?? design.Price;
      const amount = typeof price === 'number' ? price : parseInt(String(price || '').replace(/[^\d]/g, ''), 10) || 0;
      if (amount <= 0) {
        setPayError('Prix du design non défini.');
        return;
      }

      setPayError(null);
      setPaying(true);

      try {
        const baseUrl = window.location.origin;
        const response = await paymentsAPI.create(
          {
            design_id: design.id,
            amount: Math.round(amount),
            currency: 'XOF',
            success_url: `${baseUrl}/designs/${design.id}/download`,
            cancel_url: `${baseUrl}/payment/cancel?from=download`,
          },
          token
        );

        const redirectUrl = response?.redirect_url;
        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          setPayError('Aucune URL de redirection reçue. Réessayez.');
        }
      } catch (err) {
        setPayError(err?.message ?? 'Erreur lors de la création du paiement.');
      } finally {
        setPaying(false);
      }
    },
    [design, navigate]
  );

  return { handleBuy, paying, payError };
};
