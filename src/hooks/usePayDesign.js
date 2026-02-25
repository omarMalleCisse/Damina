import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, paymentsAPI, ordersAPI } from '../utils/api';
import { getToken } from '../utils/auth';

/**
 * Hook pour déclencher le paiement PayTech pour un design premium.
 * Retourne handleBuy : au clic, crée la commande, le paiement, et redirige vers PayTech.
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
        const currentUser = await authAPI.me(token);
        const customerName = currentUser?.full_name || currentUser?.name || currentUser?.username || currentUser?.email || 'Client';
        const customerEmail = currentUser?.email || '';
        const customerPhone = currentUser?.phone || currentUser?.phone_number || '';
        const customerAddress = currentUser?.address || currentUser?.address_line || currentUser?.address_line1 || '';

        const orderPayload = {
          items: [{ design_id: design.id, quantity: 1 }],
          total: amount,
          customer_name: customerName,
          customer_email: customerEmail,
          customer_phone: customerPhone,
          customer_address: customerAddress,
        };
        const created = await ordersAPI.create(orderPayload, token);
        const orderId = created?.id ?? created?.order_id;
        if (!orderId) {
          setPayError('Impossible de créer la commande.');
          setPaying(false);
          return;
        }

        const baseUrl = window.location.origin;
        const redirectPath = `/designs/${design.id}/download`;
        const response = await paymentsAPI.create(
          {
            order_id: orderId,
            amount: Math.round(amount),
            currency: 'XOF',
            success_url: `${baseUrl}/payment/success?redirect=${encodeURIComponent(redirectPath)}`,
            cancel_url: `${baseUrl}/payment/cancel?from=download`,
            target_payment: 'Orange Money, Wave, Free Money',
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
