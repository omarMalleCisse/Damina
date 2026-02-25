import React from 'react';

const spinnerSizes = { sm: 'h-4 w-4 border-2', md: 'h-5 w-5 border-2', lg: 'h-6 w-6 border-[3px]' };

/**
 * Indicateur de chargement inline (évite insertBefore en n'utilisant pas de composant Spinner).
 */
const InlineSpinner = ({ size = 'md' }) => (
  <span
    className={`inline-block shrink-0 animate-spin rounded-full border-gray-200 border-t-[#fd4d08] ${spinnerSizes[size] || spinnerSizes.md}`}
    role="status"
    aria-hidden="true"
  />
);

/**
 * État de chargement réutilisable (spinner + message).
 * @param {string} message - Texte affiché (défaut "Chargement...")
 * @param {string} variant - 'inline' | 'block' | 'full' (centré avec min-height)
 */
const LoadingState = ({ message = 'Chargement...', variant = 'block', size = 'md' }) => {
  const spinnerSize = size === 'sm' && variant === 'full' ? 'md' : size;
  const content = (
    <div className="flex items-center justify-center gap-2 text-gray-500">
      <InlineSpinner size={spinnerSize} />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );

  if (variant === 'full') {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4 py-12">
        <div className="flex flex-col items-center gap-4 text-gray-500">
          <InlineSpinner size={spinnerSize} />
          <span className="text-sm font-medium">{message}</span>
        </div>
      </div>
    );
  }

  if (variant === 'box') {
    return (
      <div className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingState;
