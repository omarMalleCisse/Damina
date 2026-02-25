import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authAPI } from '../utils/api';

const getToken = () =>
  localStorage.getItem('access_token') ||
  localStorage.getItem('token') ||
  localStorage.getItem('accessToken') ||
  sessionStorage.getItem('access_token') ||
  sessionStorage.getItem('token') ||
  sessionStorage.getItem('accessToken') ||
  '';

const AdminRoute = ({ children }) => {
  const [status, setStatus] = useState('loading'); // loading | admin | denied

  useEffect(() => {
    const check = async () => {
      const token = getToken();
      if (!token) {
        setStatus('denied');
        return;
      }
      try {
        const me = await authAPI.me(token);
        setStatus(me?.is_admin ? 'admin' : 'denied');
      } catch {
        setStatus('denied');
      }
    };
    check();
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-20 text-gray-500 gap-2">
        <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-gray-200 border-t-[#fd4d08]" aria-hidden />
        Vérification...
      </div>
    );
  }

  if (status === 'denied') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminRoute;
