import React from 'react';

/**
 * Bouton "Retour à l'accueil" sans Link pour éviter conflits removeChild avec animations.
 */
function FallbackHomeButton() {
  const navigate = React.useCallback(() => {
    window.location.href = '/';
  }, []);
  return (
    <button type="button" onClick={navigate} className="text-[#fd4d08] hover:underline bg-transparent border-0 cursor-pointer p-0 font-inherit">
      Retour à l'accueil
    </button>
  );
}

/**
 * Error Boundary pour capturer les erreurs React (ex: removeChild) et afficher un fallback.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 text-center text-gray-600">
          <p className="mb-4">Une erreur s'est produite.</p>
          <FallbackHomeButton />
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
