import React from 'react';

/**
 * État vide : message centré dans une zone (liste vide, etc.).
 */
const EmptyState = ({ message, className = '', box = true }) => {
  const content = <p className="text-gray-500">{message}</p>;
  if (box) {
    return (
      <div
        className={`rounded-lg border border-gray-200 bg-white px-4 py-8 text-center ${className}`}
      >
        {content}
      </div>
    );
  }
  return <div className={`text-center ${className}`}>{content}</div>;
};

export default EmptyState;
