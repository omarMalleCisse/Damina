import React, { useCallback, useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import { getToken } from '../../utils/auth';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated: isAuthed } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const go = useCallback((path) => {
    setMobileMenuOpen(false);
    navigate(path);
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const token = getToken();
      if (token) await authAPI.logout(token);
    } catch {
      // ignore
    }
    try {
      localStorage.removeItem('access_token');
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('accessToken');
    } catch {
      // ignore
    }
    window.dispatchEvent(new Event('auth-change'));
  };

  useEffect(() => {
    if (!isAuthed) {
      setIsAdmin(false);
      return;
    }
    let cancelled = false;
    const token = getToken();
    authAPI.me(token).then((me) => {
      if (!cancelled) setIsAdmin(Boolean(me?.is_admin));
    }).catch(() => {
      if (!cancelled) setIsAdmin(false);
    });
    return () => { cancelled = true; };
  }, [isAuthed, location.pathname]);

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center">
            <button type="button" onClick={() => go('/')} className="flex items-center bg-transparent border-0 p-0 cursor-pointer">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#ec9c23] via-[#eb4f11] to-[#fd4d08] bg-clip-text text-transparent tracking-tight" style={{ fontFamily: "'Bungee', cursive" }}>
                Damina+
              </span>
            </button>
            <nav className="hidden lg:flex items-center ml-8 xl:ml-12 space-x-6 xl:space-x-8">
              <button type="button" onClick={() => go('/designs')} className="text-sm text-gray-900 hover:text-gray-600 transition bg-transparent border-0 p-0 cursor-pointer">
                Designs
              </button>
              {isAdmin && (
                <button type="button" onClick={() => go('/admin')} className="text-sm text-gray-900 hover:text-gray-600 transition bg-transparent border-0 p-0 cursor-pointer">
                  Admin
                </button>
              )}
              <button type="button" onClick={() => go('/contact')} className="text-sm text-gray-900 hover:text-gray-600 transition bg-transparent border-0 p-0 cursor-pointer">
                Contact
              </button>
            </nav>
          </div>
          {/* Desktop: connexion + créer un compte */}
          <div className="hidden lg:flex items-center space-x-3 xl:space-x-4">
            <div className="flex items-center gap-2">
              {isAuthed ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-sm text-gray-900 hover:text-gray-600 transition px-3 py-2"
                >
                  Se déconnecter
                </button>
              ) : (
                <button type="button" onClick={() => go('/login')} className="text-sm text-gray-900 hover:text-gray-600 transition px-3 py-2 bg-transparent border-0 cursor-pointer">
                  Se connecter
                </button>
              )}
              {isAuthed && (
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" aria-label="Connecté" />
              )}
            </div>
            <button type="button" onClick={() => go('/register')} className="px-4 py-2 bg-[#fd4d08] text-white text-sm rounded-lg hover:bg-[#fda708] transition whitespace-nowrap border-0 cursor-pointer">
              Créer un compte
            </button>
          </div>

          {/* Petit écran: point connecté + boutons connexion / créer un compte + menu */}
          <div className="flex lg:hidden items-center gap-2 sm:gap-3">
            {isAuthed && (
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" aria-label="Connecté" title="Connecté" />
            )}
            {isAuthed ? (
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm text-gray-700 hover:text-gray-900 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition"
              >
                Déconnexion
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => go('/login')}
                  className="text-sm font-medium text-gray-700 hover:text-gray-900 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition bg-transparent border-0 cursor-pointer"
                >
                  Connexion
                </button>
                <button
                  type="button"
                  onClick={() => go('/register')}
                  className="px-3 py-2 bg-[#fd4d08] text-white text-sm font-medium rounded-lg hover:bg-[#e64507] transition whitespace-nowrap border-0 cursor-pointer"
                >
                  Inscription
                </button>
              </>
            )}
            <button
              type="button"
              className="p-2 text-gray-900 hover:bg-gray-100 rounded-lg transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <nav className="px-4 py-4 space-y-1">
            <button type="button" onClick={() => go('/designs')} className="block w-full text-left px-3 py-2 text-base text-gray-900 hover:bg-gray-50 rounded-lg transition bg-transparent border-0 cursor-pointer">
              Designs
            </button>
            {isAdmin && (
              <button type="button" onClick={() => go('/admin')} className="block w-full text-left px-3 py-2 text-base text-gray-900 hover:bg-gray-50 rounded-lg transition bg-transparent border-0 cursor-pointer">
                Admin
              </button>
            )}
            <button type="button" onClick={() => go('/contact')} className="block w-full text-left px-3 py-2 text-base text-gray-900 hover:bg-gray-50 rounded-lg transition bg-transparent border-0 cursor-pointer">
              Contact
            </button>
            <div className="pt-3 mt-3 border-t border-gray-200 space-y-2">
              <div className="flex items-center justify-between px-3 py-2">
                {isAuthed ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-base text-gray-900 hover:text-gray-600 transition bg-transparent border-0 cursor-pointer"
                  >
                    Se déconnecter
                  </button>
                ) : (
                  <button type="button" onClick={() => go('/login')} className="text-base text-gray-900 hover:text-gray-600 transition bg-transparent border-0 cursor-pointer">
                    Se connecter
                  </button>
                )}
                {isAuthed && (
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" aria-label="Connecté" />
                )}
              </div>
              <button type="button" onClick={() => go('/register')} className="block w-full px-3 py-2.5 bg-[#fd4d08] text-white text-base rounded-lg hover:bg-[#fda708] transition text-center border-0 cursor-pointer">
                Créer un compte
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
export default Header;