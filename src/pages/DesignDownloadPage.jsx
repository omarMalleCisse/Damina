import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Download, CreditCard, ArrowLeft, Loader2 } from 'lucide-react';
import { designsAPI, paymentsAPI } from '../utils/api';
import { getToken } from '../utils/auth';
import toast from 'react-hot-toast';

/**
 * Page /designs/:designId/download
 * - Vérifie l'accès via POST /api/designs/:id/download (sans déclencher le téléchargement).
 * - 402 : affiche "Paiement requis" + bouton pour lancer le paiement.
 * - 200 : affiche uniquement le bouton "Télécharger" ; le téléchargement ne se fait qu'au clic.
 */
const DesignDownloadPage = () => {
  const { id: designIdParam } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const designId = designIdParam != null ? parseInt(designIdParam, 10) : null;
  const retryAfterPayRef = useRef(false);

  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canDownload, setCanDownload] = useState(false);
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [paying, setPaying] = useState(false);
  const [downloadingFileIndex, setDownloadingFileIndex] = useState(null);
  const [error, setError] = useState(null);
  const [waitingPaymentCheck, setWaitingPaymentCheck] = useState(false);

  const token = getToken();

  useEffect(() => {
    if (!designId || Number.isNaN(designId)) {
      setError('Design invalide.');
      setLoading(false);
      return;
    }

    if (!token) {
      setError('Connectez-vous pour télécharger.');
      setLoading(false);
      return;
    }

    let cancelled = false;

    const run = async (isRetry = false) => {
      setLoading(true);
      setError(null);
      setPaymentRequired(false);
      setCanDownload(false);
      setWaitingPaymentCheck(false);

      try {
        let designRes = null;
        let downloadRes = null;
        try {
          [designRes, downloadRes] = await Promise.all([
            designsAPI.getById(designId).catch(() => null),
            designsAPI.requestDownload(designId, token).catch((err) => {
              return { ok: false, status: 0, json: { detail: err?.message ?? 'Erreur réseau' } };
            })
          ]);
        } catch (e) {
          if (!cancelled) setError(e?.message ?? 'Erreur lors de la vérification.');
          return;
        }

        if (cancelled) return;
        if (!downloadRes || typeof downloadRes.status !== 'number') {
          if (!cancelled) setError(downloadRes?.json?.detail ?? 'Erreur lors de la vérification.');
          return;
        }

        if (designRes) setDesign(designRes);

        if (downloadRes.status === 402) {
          const paymentId = searchParams.get('payment_id') ?? searchParams.get('paymentId');
          if (!isRetry && paymentId) {
            setWaitingPaymentCheck(true);
            setLoading(false);
            retryAfterPayRef.current = true;
            setTimeout(() => {
              if (!cancelled) run(true);
            }, 2500);
            return;
          }
          setPaymentRequired(true);
          setLoading(false);
          return;
        }

        if (!downloadRes.ok) {
          setError(downloadRes.json?.detail ?? downloadRes.json?.message ?? 'Téléchargement refusé.');
          setLoading(false);
          return;
        }

        setCanDownload(true);
      } catch (err) {
        if (!cancelled) {
          setError(err?.message ?? 'Erreur lors du chargement.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [designId, token, searchParams]);

  const fileList = design?.download_files && Array.isArray(design.download_files) ? design.download_files : [];
  const fileCount = fileList.length;

  const getFileLabel = useCallback((index) => {
    const item = fileList[index];
    if (item == null) return `Fichier ${index + 1}`;
    if (typeof item === 'string') {
      const ext = item.split('.').pop()?.toUpperCase() || '';
      return ext ? `Fichier ${index + 1} (.${ext})` : `Fichier ${index + 1}`;
    }
    return `Fichier ${index + 1}`;
  }, [fileList]);

  const handleDownloadFile = useCallback(async (fileIndex) => {
    if (!designId || !token || !canDownload) return;
    setDownloadingFileIndex(fileIndex);
    try {
      const suggested = fileList[fileIndex];
      const suggestedFilename = typeof suggested === 'string' ? suggested : null;
      await designsAPI.getFileDownload(designId, fileIndex, token, suggestedFilename);
      toast.success('Téléchargement lancé.');
    } catch (err) {
      toast.error(err?.message ?? 'Impossible de télécharger.');
    } finally {
      setDownloadingFileIndex(null);
    }
  }, [designId, token, canDownload, fileList]);

  const handlePayAndDownload = useCallback(async () => {
    if (!designId || !token) return;
    const amount = design?.price ?? design?.Price ?? 0;
    const numAmount = typeof amount === 'number' ? amount : parseInt(String(amount).replace(/[^\d]/g, ''), 10) || 0;
    if (numAmount <= 0) {
      toast.error('Prix du design non défini.');
      return;
    }

    setPaying(true);
    try {
      const baseUrl = window.location.origin;
      const response = await paymentsAPI.create(
        {
          design_id: designId,
          amount: Math.round(numAmount),
          currency: 'XOF',
          success_url: `${baseUrl}/designs/${designId}/download`,
          cancel_url: `${baseUrl}/payment/cancel?from=download`
        },
        token
      );
      const redirectUrl = response?.redirect_url;
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        toast.error('Aucune URL de redirection reçue.');
        setPaying(false);
      }
    } catch (err) {
      toast.error(err?.message ?? 'Erreur lors de la création du paiement.');
      setPaying(false);
    }
  }, [designId, token, design]);

  if (!designId || Number.isNaN(designId)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <p className="text-red-600">Design invalide.</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md text-center">
          <p className="text-gray-700 mb-4">Connectez-vous pour accéder au téléchargement.</p>
          <button
            type="button"
            onClick={() => navigate('/login', { state: { from: `/designs/${designId}/download` } })}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#fd4d08] text-white font-medium rounded-lg hover:bg-[#e04300]"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-12">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Téléchargement du design</h1>

          {loading && (
            <div className="flex items-center justify-center gap-2 py-8 text-gray-500">
              <Loader2 className="w-6 h-6 animate-spin shrink-0" />
              <span>Vérification de l&apos;accès...</span>
            </div>
          )}

          {waitingPaymentCheck && !loading && (
            <div className="flex items-center justify-center gap-2 py-8 text-gray-600">
              <Loader2 className="w-6 h-6 animate-spin shrink-0" />
              <span>Paiement reçu, vérification en cours...</span>
            </div>
          )}

          {error && !loading && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 mb-4">
              {error}
            </div>
          )}

          {paymentRequired && !loading && (
            <>
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 mb-6">
                <p className="font-medium">Ce design est premium.</p>
                <p className="text-sm mt-1">Vous devez payer avec PayTech (Orange Money, Wave, etc.) avant de pouvoir le télécharger.</p>
              </div>
              <button
                type="button"
                onClick={handlePayAndDownload}
                disabled={paying}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#fd4d08] text-white font-bold rounded-xl hover:bg-[#e04300] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {paying ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Redirection vers PayTech...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Payer avec PayTech puis télécharger
                  </>
                )}
              </button>
            </>
          )}

          {!loading && !error && !paymentRequired && canDownload && (
            <div className="py-4">
              <p className="text-gray-600 mb-4">
                Téléchargez chaque fichier (DST, PES, etc.) un par un.
              </p>
              {fileCount === 0 ? (
                <p className="text-gray-500 text-sm">Aucun fichier à télécharger pour ce design.</p>
              ) : (
                <ul className="space-y-2">
                  {Array.from({ length: fileCount }, (_, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => handleDownloadFile(i)}
                        disabled={downloadingFileIndex !== null}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#fd4d08] text-white font-medium rounded-xl hover:bg-[#e04300] disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {downloadingFileIndex === i ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                            Téléchargement...
                          </>
                        ) : (
                          <>
                            <Download className="w-5 h-5 shrink-0" />
                            {getFileLabel(i)}
                          </>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DesignDownloadPage;
