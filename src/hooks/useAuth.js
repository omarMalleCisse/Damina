import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { authAPI } from '../utils/api';

const getToken = () =>
  typeof window === 'undefined'
    ? ''
    : localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('access_token') ||
      sessionStorage.getItem('token') ||
      sessionStorage.getItem('accessToken') ||
      '';

const clearToken = () => {
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
};

export const useAuth = () => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const check = async () => {
      const token = getToken();
      if (!token) {
        if (isMounted) setIsAuthenticated(false);
        return;
      }
      try {
        await authAPI.me(token);
        if (isMounted) setIsAuthenticated(true);
      } catch {
        clearToken();
        if (isMounted) setIsAuthenticated(false);
      }
    };
    check();
    const onAuthChange = () => check();
    window.addEventListener('storage', onAuthChange);
    window.addEventListener('focus', onAuthChange);
    window.addEventListener('auth-change', onAuthChange);
    return () => {
      isMounted = false;
      window.removeEventListener('storage', onAuthChange);
      window.removeEventListener('focus', onAuthChange);
      window.removeEventListener('auth-change', onAuthChange);
    };
  }, [location.pathname]);

  return { isAuthenticated };
};
