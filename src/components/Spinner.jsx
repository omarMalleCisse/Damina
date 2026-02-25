import React from 'react';

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-5 w-5 border-2',
  lg: 'h-6 w-6 border-[3px]'
};

/**
 * Spinner inline (évite les erreurs insertBefore en utilisant une structure DOM stable).
 */
const Spinner = ({ size = 'md' }) => {
  const classes = sizeClasses[size] || sizeClasses.md;
  return (
    <span
      className={`inline-block shrink-0 animate-spin rounded-full border-gray-200 border-t-[#fd4d08] ${classes}`}
      role="status"
      aria-hidden="true"
    />
  );
};

export default Spinner;
