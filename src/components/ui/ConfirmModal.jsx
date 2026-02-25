import React from 'react';
import Button from './Button';

/**
 * Modal de confirmation (ex: suppression).
 * @param {boolean} open
 * @param {string} title
 * @param {React.ReactNode} description
 * @param {string} confirmLabel - ex. "Supprimer"
 * @param {string} variant - 'danger' | 'primary'
 * @param {function} onConfirm
 * @param {function} onCancel
 * @param {boolean} loading - désactive boutons et affiche chargement sur confirm
 */
const ConfirmModal = ({
  open,
  title,
  description,
  confirmLabel = 'Confirmer',
  confirmLoadingLabel = 'Chargement...',
  variant = 'danger',
  onConfirm,
  onCancel,
  loading = false
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 id="confirm-modal-title" className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        <div className="text-sm text-gray-600 mb-6">{description}</div>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" size="md" onClick={onCancel} disabled={loading}>
            Annuler
          </Button>
          <Button
            variant={variant}
            size="md"
            onClick={onConfirm}
            loading={loading}
            loadingLabel={confirmLoadingLabel}
            disabled={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
