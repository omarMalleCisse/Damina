import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, ArrowLeft, CreditCard } from 'lucide-react';
import { designsAPI, resolveApiUrl } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { getToken } from '../utils/auth';
import { LoadingState } from '../components/ui';
import { authAPI } from '../utils/api';

const DownloadPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadRecorded, setDownloadRecorded] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);
  const [accessChecked, setAccessChecked] = useState(false);
  const [canDownload, setCanDownload] = useState(false);

  const token = getToken();

  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthChecked(true);
      if (!isAuthenticated && !token) {
        // Rediriger vers la fiche design (pas la page download) : l'utilisateur ne doit arriver sur DownloadPage qu'après paiement (via success_url)
        const returnPath = `/designs/${id}`;
        navigate(`/login?redirect=${encodeURIComponent(returnPath)}`, {
          state: { from: returnPath },
          replace: true,
        });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [isAuthenticated, token, navigate, id]);

  useEffect(() => {
    if (!token) {
      setAdminChecked(true);
      return;
    }
    authAPI
      .me(token)
      .then((me) => {
        const u = me?.user ?? me?.data ?? me;
        const admin =
          u?.is_admin === true ||
          u?.is_admin === 1 ||
          u?.admin === true ||
          u?.role === 'admin' ||
          u?.is_staff === true ||
          u?.type === 'admin' ||
          me?.is_admin === true ||
          me?.is_admin === 1 ||
          me?.admin === true ||
          me?.role === 'admin' ||
          me?.is_staff === true ||
          me?.type === 'admin';
        setIsAdmin(!!admin);
        setAdminChecked(true);
      })
      .catch(() => {
        setIsAdmin(false);
        setAdminChecked(true);
      });
  }, [token]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await designsAPI.getById(id);
        if (active) setDesign(data);
      } catch (err) {
        if (active) setError(err?.message || 'Design introuvable.');
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [id]);

  const isPremium = design?.is_premium === true;
  const mustPay = isPremium && !isAdmin && isAuthenticated;

  useEffect(() => {
    if (!design?.id || !authChecked || !adminChecked || !isAuthenticated || !token) {
      if (authChecked && adminChecked && design && !mustPay) setAccessChecked(true);
      return;
    }
    if (!mustPay) {
      setCanDownload(true);
      setAccessChecked(true);
      return;
    }
    let active = true;
    designsAPI
      .checkDownloadAccess(design.id, token)
      .then(({ allowed, status }) => {
        if (active) {
          setCanDownload(allowed);
          if (allowed && status === 200) setDownloadRecorded(true);
          setAccessChecked(true);
        }
      })
      .catch(() => {
        if (active) {
          setCanDownload(false);
          setAccessChecked(true);
        }
      });
    return () => { active = false; };
  }, [design, authChecked, adminChecked, isAuthenticated, token, mustPay]);

  useEffect(() => {
    if (!design?.id || !accessChecked) return;
    if (mustPay && !canDownload) {
      navigate(`/designs/${design.id}`, { replace: true });
    }
  }, [design?.id, accessChecked, mustPay, canDownload, navigate]);

  useEffect(() => {
    if (!design?.id || downloadRecorded || !canDownload) return;
    let active = true;
    designsAPI
      .download(design.id)
      .then(() => { if (active) setDownloadRecorded(true); })
      .catch(() => { if (active) setDownloadRecorded(true); });
    return () => { active = false; };
  }, [design?.id, downloadRecorded, canDownload]);

  const downloadUrls = React.useMemo(() => {
    if (!design) return [];
    const list =
      Array.isArray(design.download_files) && design.download_files.length > 0
        ? design.download_files
        : design.file_url
          ? [design.file_url]
          : [];
    return list.map((u) => {
      const url = typeof u === 'string' && u.startsWith('http') ? u : resolveApiUrl(u);
      const ext = (url.split('.').pop() || '').split(/[?#]/)[0].toLowerCase();
      const filename = (url.split('/').pop() || '').split('?')[0] || `fichier.${ext}`;
      return { url, ext, filename };
    });
  }, [design]);

  if (!authChecked) {
    return (
      <section className="px-4 py-12">
        <LoadingState message="Vérification de l'authentification..." variant="full" />
      </section>
    );
  }

  if (!isAuthenticated && !token) {
    return (
      <section className="px-4 py-12">
        <LoadingState message="Redirection vers la connexion..." variant="full" />
      </section>
    );
  }

  if (loading) {
    return (
      <section className="px-4 py-12">
        <LoadingState message="Chargement..." variant="full" />
      </section>
    );
  }

  if (token && !adminChecked) {
    return (
      <section className="px-4 py-12">
        <LoadingState message="Vérification des droits..." variant="full" />
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

  const showPaymentGate = mustPay && accessChecked && !canDownload;

  return (
    <section className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl py-8 sm:py-12">
      <button
        type="button"
        onClick={() => navigate(`/designs/${design.id}`)}
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#fd4d08] transition-colors mb-6 bg-transparent border-0 cursor-pointer p-0"
      >
        <ArrowLeft className="w-4 h-4" /> Retour au design
      </button>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Téléchargement
          </h1>
          <p className="text-gray-600 mb-6">
            <span className="font-medium text-gray-900">{design.title}</span>
            {design.is_premium && (
              <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-medium rounded">
                Premium
              </span>
            )}
          </p>

          {showPaymentGate ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
              <p className="text-gray-800 font-medium mb-2">
                Ce design premium est payant. Cliquez sur <strong>Acheter</strong> pour accéder au paiement PayTech.
              </p>
              <p className="text-gray-600 text-sm mb-4">
                Montant : <span className="font-semibold text-gray-900">{design.price ?? '—'} XOF</span>
              </p>
              <button
                type="button"
                onClick={() => navigate(`/designs/${design.id}`)}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#fd4d08] text-white font-semibold rounded-lg hover:bg-[#e04300] transition border-0 cursor-pointer"
              >
                <CreditCard className="w-5 h-5" />
                Acheter
              </button>
            </div>
          ) : (
            <>
              {downloadUrls.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  Aucun fichier de téléchargement disponible pour ce design.
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">
                    Choisissez un format à télécharger :
                  </p>
                  <ul className="space-y-2">
                    {downloadUrls.map(({ url, ext, filename }, i) => (
                      <li key={`${ext}-${i}`}>
                        <button
                          type="button"
                          onClick={() => window.open(url, '_blank', 'noopener,noreferrer')}
                          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 hover:bg-[#fd4d08]/10 hover:border-[#fd4d08]/40 text-gray-900 font-medium transition-colors text-left cursor-pointer"
                        >
                          <Download className="w-5 h-5 text-[#fd4d08] shrink-0" />
                          Télécharger {filename}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate(`/designs/${design.id}`)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#fd4d08] hover:underline bg-transparent border-0 cursor-pointer p-0"
                >
                  <ArrowLeft className="w-4 h-4" /> Voir la fiche du design
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default DownloadPage;
