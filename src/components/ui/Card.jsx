import React from 'react';

/**
 * Carte générique : conteneur avec bordure et ombre optionnelles.
 * @param {React.ReactNode} children
 * @param {string} className - classes additionnelles
 * @param {boolean} padding - padding interne (défaut true)
 * @param {boolean} bordered - bordure (défaut true)
 */
const Card = ({ children, className = '', padding = true, bordered = true }) => {
  const base = 'bg-white rounded-xl shadow-sm';
  const pad = padding ? 'p-6' : '';
  const border = bordered ? 'border border-gray-200' : '';
  return <div className={`${base} ${pad} ${border} ${className}`}>{children}</div>;
};

export default Card;
