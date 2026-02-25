import React from 'react';
import Card from '../ui/Card';

/**
 * Page centrée avec une carte (login, register, etc.).
 */
const CenteredCard = ({ children, className = '', maxWidth = 'max-w-md' }) => (
  <div className={`min-h-screen bg-white flex items-center justify-center px-4 py-10 ${className}`}>
    <div className={`w-full ${maxWidth}`}>
      <Card>{children}</Card>
    </div>
  </div>
);

export default CenteredCard;
