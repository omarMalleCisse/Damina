import React, { useEffect, useState } from 'react';
import { ordersAPI, authAPI } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';

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

const maskEmail = (email) => {
  if (!email || !String(email).trim()) return '•••';
  const e = String(email).trim();
  const at = e.indexOf('@');
  if (at <= 0) return '•••@•••';
  return e.slice(0, 2) + '•••' + e.slice(at);
};
const maskAddress = (address) => {
  if (!address || !String(address).trim()) return '';
  const a = String(address).trim();
  if (a.length <= 5) return '•••••';
  return a.slice(0, 4) + '••••••••';
};

const defaultOrderItems = [{ title: 'Pack', quantity: 1 }];

const OrderForm = ({
  compact = false,
  title = '',
  onSuccess,
  /** Liste d'items pour la commande (ex: [{ title: 'Pack', quantity: 1 }]). Envoyée à POST /api/orders. */
  items = defaultOrderItems,
}) => {
  const { isAuthenticated } = useAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [formError, setFormError] = useState(null);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoadingUser(false);
      return;
    }
    const fetchUser = async () => {
      try {
        const token = getToken();
        if (token) {
          const userData = await authAPI.me(token);
          setCurrentUser(userData);
          const name =
            userData.full_name ||
            userData.name ||
            userData.username ||
            userData.email ||
            '';
          setCustomerName(name);
          setCustomerEmail(userData.email || '');
          setCustomerPhone(userData.phone || userData.phone_number || '');
          setCustomerAddress(
            userData.address || userData.address_line || userData.address_line1 || ''
          );
        }
      } catch {
        setCurrentUser(null);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, [isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg(null);
    setFormError(null);
    if (!isAuthenticated) return;

    const token = getToken();
    const finalName =
      currentUser?.full_name ||
      currentUser?.name ||
      currentUser?.username ||
      currentUser?.email ||
      customerName.trim();
    const finalEmail = currentUser?.email || customerEmail.trim();

    setSubmitting(true);
    try {
      await ordersAPI.create(
        {
          customer_name: finalName,
          customer_email: finalEmail,
          customer_phone: customerPhone.trim(),
          customer_address: customerAddress.trim(),
          items: Array.isArray(items) ? items : defaultOrderItems,
        },
        token
      );
      setSuccessMsg('Commande envoyée avec succès.');
      setCustomerPhone('');
      setCustomerAddress('');
      setFocusedField(null);
      if (typeof onSuccess === 'function') onSuccess();
    } catch (err) {
      setFormError(err?.message || "Erreur lors de l'envoi de la commande.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className={compact ? '' : 'mb-6 bg-white border border-gray-200 p-6 rounded-lg shadow-sm'}>
      {title && <h3 className="text-lg font-semibold mb-3">{title}</h3>}
      {loadingUser && (
        <div className="mb-3 text-sm text-gray-500">Chargement de vos informations...</div>
      )}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
        {successMsg && <div className="text-green-600 text-sm">{successMsg}</div>}
        {formError && <div className="text-red-600 text-sm">{formError}</div>}

        {currentUser && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm font-medium text-blue-900 mb-1">Vos informations</div>
            <div className="text-sm text-blue-700">
              <div>
                <strong>Nom :</strong> {currentUser.full_name || currentUser.name || currentUser.username || currentUser.email || '—'}
              </div>
              <div>
                <strong>Téléphone :</strong> {customerPhone || (currentUser.phone || currentUser.phone_number) || '—'}
              </div>
              {currentUser.email && (
                <div>
                  <strong>Email :</strong> {maskEmail(currentUser.email)}
                </div>
              )}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Téléphone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            placeholder="Votre numéro de téléphone"
            value={customerPhone}
            onChange={(e) => {
              setCustomerPhone(e.target.value);
              setFormError(null);
            }}
            className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Adresse <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Votre adresse de livraison"
            value={focusedField === 'address' ? customerAddress : (customerAddress ? maskAddress(customerAddress) : '')}
            onFocus={() => setFocusedField('address')}
            onBlur={() => setFocusedField(null)}
            onChange={(e) => {
              setCustomerAddress(e.target.value);
              setFormError(null);
            }}
            className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-lg"
          />
        </div>
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-3 bg-[#fd4d08] text-white rounded-lg font-medium hover:bg-[#e04300] disabled:opacity-70 transition"
          >
            {submitting ? 'Envoi...' : 'Envoyer la commande'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;
