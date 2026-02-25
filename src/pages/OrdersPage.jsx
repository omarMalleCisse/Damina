import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Image as ImageIcon } from 'lucide-react';
import { packOrdersAPI, packsAPI, authAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';

const getToken = () =>
  localStorage.getItem('access_token') ||
  localStorage.getItem('token') ||
  localStorage.getItem('accessToken') ||
  sessionStorage.getItem('access_token') ||
  sessionStorage.getItem('token') ||
  sessionStorage.getItem('accessToken') ||
  '';

// Masquer les données sensibles à l'affichage (confidentialité)
const maskName = (name) => {
  if (!name || !name.trim()) return '•••';
  const s = name.trim();
  if (s.length <= 2) return s[0] + '•••';
  return s[0] + '••••••';
};
const maskEmail = (email) => {
  if (!email || !email.trim()) return '•••';
  const e = email.trim();
  const at = e.indexOf('@');
  if (at <= 0) return '•••@•••';
  return e.slice(0, 2) + '•••' + e.slice(at);
};
const maskPhone = (phone) => {
  if (!phone || !String(phone).trim()) return '';
  const p = String(phone).replace(/\s/g, '');
  if (p.length <= 4) return '••••';
  return p.slice(0, 2) + '••••••' + p.slice(-2);
};
const maskAddress = (address) => {
  if (!address || !String(address).trim()) return '';
  const a = String(address).trim();
  if (a.length <= 5) return '•••••';
  return a.slice(0, 4) + '••••••••';
};

const OrdersPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [packId, setPackId] = useState(null);
  const [loadingPack, setLoadingPack] = useState(true);

  // pack_id: priorité au paramètre URL ?pack_id=, sinon premier pack de la liste
  useEffect(() => {
    const urlPackId = searchParams.get('pack_id');
    if (urlPackId) {
      const id = parseInt(urlPackId, 10);
      if (!Number.isNaN(id)) {
        setPackId(id);
        setLoadingPack(false);
        return;
      }
    }
    let cancelled = false;
    packsAPI.list().then((list) => {
      if (cancelled || !Array.isArray(list) || list.length === 0) {
        if (!cancelled) setPackId(null);
        return;
      }
      setPackId(list[0].id);
    }).catch(() => setPackId(null)).finally(() => { if (!cancelled) setLoadingPack(false); });
    return () => { cancelled = true; };
  }, [searchParams]);

  // Récupérer les informations de l'utilisateur connecté
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!isAuthenticated) {
        setLoadingUser(false);
        return;
      }
      
      try {
        const token = getToken();
        if (token) {
          const userData = await authAPI.me(token);
          setCurrentUser(userData);
        }
      } catch (err) {
        console.warn('Erreur lors de la récupération des informations utilisateur:', err);
        setCurrentUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchCurrentUser();
  }, [isAuthenticated]);

  // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié (après vérification)
  useEffect(() => {
    // Ne pas rediriger pendant le chargement initial
    if (loadingUser) return;
    
    // Attendre un peu pour laisser le temps à useAuth de vérifier le token
    const timer = setTimeout(() => {
      const token = getToken();
      // Ne rediriger que si on est sûr qu'il n'y a pas de token ET que isAuthenticated est false
      if (!isAuthenticated && !token) {
        navigate('/login', { 
          replace: true,
          state: { from: '/orders', message: 'Vous devez être connecté pour passer une commande.' }
        });
      }
    }, 300); // Délai de 300ms pour laisser le temps à useAuth de vérifier

    return () => clearTimeout(timer);
  }, [isAuthenticated, navigate, loadingUser]);

  // Form state for creating a new order
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [itemsText, setItemsText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [formError, setFormError] = useState(null);
  // Champ focalisé : afficher la valeur réelle, sinon masquée
  const [focusedField, setFocusedField] = useState(null);

  // Mettre à jour les champs client avec les informations de l'utilisateur connecté
  useEffect(() => {
    if (currentUser && isAuthenticated) {
      const userName = currentUser.full_name || 
                      currentUser.name || 
                      currentUser.username || 
                      currentUser.email || 
                      '';
      setCustomerName(userName);
      setCustomerEmail(currentUser.email || '');
      setCustomerPhone(currentUser.phone || currentUser.phone_number || '');
      setCustomerAddress(currentUser.address || currentUser.address_line || currentUser.address_line1 || '');
    }
  }, [currentUser, isAuthenticated]);

  // cleanup preview URL when it changes or when component unmounts
  useEffect(() => {
    return () => {
      if (photoPreview) {
        try { URL.revokeObjectURL(photoPreview); } catch { /* ignore revoke errors */ }
      }
    };
  }, [photoPreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg(null);
    setFormError(null);

    // Vérifier l'authentification avant de soumettre
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    // Déterminer les infos client (utilisateur connecté ou champs saisis)
    let finalCustomerName = '';
    let finalCustomerEmail = '';
    let finalCustomerPhone = '';
    let finalCustomerAddress = '';
    
    if (isAuthenticated && currentUser) {
      finalCustomerName = currentUser.full_name || 
                         currentUser.name || 
                         currentUser.username || 
                         currentUser.email || 
                         '';
      finalCustomerEmail = currentUser.email || '';
    } else {
      finalCustomerName = customerName.trim();
      finalCustomerEmail = customerEmail.trim();
    }
    finalCustomerPhone = customerPhone.trim();
    finalCustomerAddress = customerAddress.trim();

    if (packId == null) {
      setFormError('Aucun pack disponible. Réessayez plus tard.');
      return;
    }

    // parse items: one item per line, format: title x qty (or just title)
    const items = itemsText.split('\n').map(line => {
      const trimmed = line.trim();
      if (!trimmed) return null;
      const parts = trimmed.split(/\s+x\s+/i);
      if (parts.length === 2) return { title: parts[0].trim(), quantity: parseInt(parts[1], 10) || 1 };
      return { title: trimmed, quantity: 1 };
    }).filter(Boolean);

    const notesOrDescription = itemsText.trim() || null;

    setSubmitting(true);
    try {
      const token = getToken();

      if (photoFile) {
        const formData = new FormData();
        formData.append('pack_id', String(packId));
        formData.append('customer_name', finalCustomerName);
        formData.append('customer_email', finalCustomerEmail || '');
        formData.append('customer_phone', finalCustomerPhone || '');
        formData.append('customer_address', finalCustomerAddress || '');
        formData.append('items', JSON.stringify(items));
        if (notesOrDescription) {
          formData.append('notes', notesOrDescription);
          formData.append('description', notesOrDescription);
        }
        formData.append('quantity', '1');
        formData.append('photo', photoFile);
        await packOrdersAPI.createWithFormData(formData, token);
      } else {
        await packOrdersAPI.create(
          {
            pack_id: packId,
            customer_name: finalCustomerName,
            customer_email: finalCustomerEmail || '',
            customer_phone: finalCustomerPhone || '',
            customer_address: finalCustomerAddress || '',
            items,
            notes: notesOrDescription,
            description: notesOrDescription,
            quantity: 1,
          },
          token
        );
      }
      
      setSuccessMsg('Commande envoyée avec succès.');
      
      // Vider tous les champs du formulaire après envoi
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setCustomerAddress('');
      setItemsText('');
      setPhotoFile(null);
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
        setPhotoPreview(null);
      }
      setFormError(null);
      setFocusedField(null);
    } catch (err) {
      console.error('Erreur lors de l\'envoi de la commande:', err);
      // S'assurer que le message d'erreur est une chaîne
      const errorMessage = err?.message 
        ? String(err.message)
        : (typeof err === 'string' ? err : 'Erreur lors de l\'envoi de la commande');
      setFormError(errorMessage);
      setSuccessMsg(null);
    } finally {
      setSubmitting(false);
    }
  };

  // Ne pas afficher le message de redirection si on a un token (en cours de vérification)
  const token = getToken();
  if (!isAuthenticated && !token && !loadingUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center">
        <p className="text-gray-600">Redirection vers la page de connexion...</p>
      </div>
    );
  }
  if (loadingPack) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center">
        <p className="text-gray-600">Chargement du pack...</p>
      </div>
    );
  }
  if (packId == null) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center">
        <p className="text-gray-600">Aucun pack disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Commandez votre design personnalisé</h2>
      {/* Formulaire de création de commande */}
      <div className="mb-6 bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-3">Création de designs broderie personnalisés et entièrement optimisés pour vos besoins. </h3>
        {successMsg && <div className="text-green-600 mb-3">{successMsg}</div>}
        {loadingUser && isAuthenticated && (
          <div className="mb-3 text-sm text-gray-500">Chargement de vos informations...</div>
        )}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          {formError && <div className="text-red-600 mb-2">{formError}</div>}
          
          {/* Afficher les informations de l'utilisateur connecté ou le champ de saisie */}
          {isAuthenticated && currentUser ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="text-sm font-medium text-blue-900 mb-1">Informations client (masquées)</div>
              <div className="text-sm text-blue-700">
                <div><strong>Nom:</strong> {maskName(currentUser.full_name || currentUser.name || currentUser.username || '')}</div>
                {currentUser.email && (
                  <div><strong>Email:</strong> {maskEmail(currentUser.email)}</div>
                )}
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">Téléphone <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  placeholder="Votre numéro de téléphone"
                  value={focusedField === 'phone' ? customerPhone : (customerPhone ? maskPhone(customerPhone) : '')}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                  onChange={e => { setCustomerPhone(e.target.value); setFormError(null); }}
                  className="mt-1 w-full border px-3 py-2 rounded"
                />
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">Adresse <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Votre adresse de livraison"
                  value={focusedField === 'address' ? customerAddress : (customerAddress ? maskAddress(customerAddress) : '')}
                  onFocus={() => setFocusedField('address')}
                  onBlur={() => setFocusedField(null)}
                  onChange={e => { setCustomerAddress(e.target.value); setFormError(null); }}
                  className="mt-1 w-full border px-3 py-2 rounded"
                />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nom du client
                </label>
                <input
                  type="text"
                  placeholder="Votre nom complet"
                  value={focusedField === 'name' ? customerName : (customerName ? maskName(customerName) : '')}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  onChange={e => { setCustomerName(e.target.value); setFormError(null); }}
                  className="mt-1 w-full border px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Votre adresse email"
                  value={focusedField === 'email' ? customerEmail : (customerEmail ? maskEmail(customerEmail) : '')}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  onChange={e => { setCustomerEmail(e.target.value); setFormError(null); }}
                  className="mt-1 w-full border px-3 py-2 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Téléphone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="Votre numéro de téléphone"
                  value={focusedField === 'phone' ? customerPhone : (customerPhone ? maskPhone(customerPhone) : '')}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                  onChange={e => { setCustomerPhone(e.target.value); setFormError(null); }}
                  className="mt-1 w-full border px-3 py-2 rounded"
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
                  onChange={e => { setCustomerAddress(e.target.value); setFormError(null); }}
                  className="mt-1 w-full border px-3 py-2 rounded"
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description des articles</label>
            <textarea placeholder='Décrivez-nous votre modèle' value={itemsText} onChange={e => { setItemsText(e.target.value); setFormError(null); }} rows={3} className="mt-1 w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Photo modèle (optionnel)</label>
            <div className="mt-1 flex items-center gap-3">
              <label className="inline-flex items-center px-3 py-2 bg-gray-50 border border-gray-200 rounded cursor-pointer hover:bg-gray-100">
                <ImageIcon className="w-5 h-5 text-gray-600 mr-2" />
                <span className="text-sm text-gray-700">envoyer nous un modèle si vous levez svp</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files && e.target.files[0];
                    if (f) {
                      const maxSize = 5 * 1024 * 1024; // 5MB
                      if (!f.type || !f.type.startsWith('image/')) {
                        setFormError('Le fichier doit être une image.');
                        if (photoPreview) { URL.revokeObjectURL(photoPreview); setPhotoPreview(null); }
                        setPhotoFile(null);
                        return;
                      }
                      if (f.size > maxSize) {
                        setFormError('Image trop grande (max 5MB).');
                        if (photoPreview) { URL.revokeObjectURL(photoPreview); setPhotoPreview(null); }
                        setPhotoFile(null);
                        return;
                      }
                      if (photoPreview) { URL.revokeObjectURL(photoPreview); }
                      setPhotoFile(f);
                      setPhotoPreview(URL.createObjectURL(f));
                      setFormError(null);
                    } else {
                      if (photoPreview) { URL.revokeObjectURL(photoPreview); }
                      setPhotoFile(null);
                      setPhotoPreview(null);
                      setFormError(null);
                    }
                  }}
                  className="sr-only"
                />
              </label>
              <div className="text-sm text-gray-500">{photoFile ? photoFile.name : 'Aucune image sélectionnée'}</div>
            </div>
            {photoPreview && (
              <img src={photoPreview} alt="aperçu" className="mt-3 w-32 h-32 object-contain border rounded" />
            )}
          </div>
          <div className="pt-2">
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#fd4d08] text-white rounded hover:bg-[#e04300]">
              {submitting ? 'Envoi...' : 'Envoyer la commande'}
            </button>
          </div>
        </form>
        <h3 className="text-lg font-semibold mt-6 mb-3">Délai : 12–24h</h3>
        <p  className="text-sm text-gray-500">Vous recevrez votre commande directement sur WhatsApp, dès qu’elle sera prête. dans les 24 heures, vous recevrez un appel de confirmation.</p>
      </div>
    </div>
  );
};

export default OrdersPage;
