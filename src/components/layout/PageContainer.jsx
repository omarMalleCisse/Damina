import React from 'react';

/**
 * Conteneur de page admin : fond gris, max-width, padding.
 */
const PageContainer = ({ children, className = '', maxWidth = 'max-w-7xl' }) => (
  <div className={`bg-gray-50 min-h-screen ${className}`}>
    <div className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12`}>
      {children}
    </div>
  </div>
);

export default PageContainer;
