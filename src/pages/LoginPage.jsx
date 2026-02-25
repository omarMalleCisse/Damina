import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { CenteredCard } from '../components/layout';
import { Button, Input, ErrorMessage } from '../components/ui';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectParam = new URLSearchParams(location.search || '').get('redirect');
  const from =
    location.state?.from || (redirectParam && redirectParam.startsWith('/') ? redirectParam : null) || '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authAPI.login(form);
      const token = data?.access_token ?? data?.token ?? data?.accessToken;
      if (token) {
        localStorage.setItem('access_token', token);
        sessionStorage.setItem('access_token', token);
      }
      navigate(from, { replace: true });
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      setError(err?.message || 'Identifiants incorrects.');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4 py-10">
        <p className="text-gray-600">Redirection...</p>
      </div>
    );
  }

  return (
    <CenteredCard>
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Connexion</h1>
      <p className="text-sm text-gray-500 mb-6">Connectez-vous pour accéder à votre compte.</p>

      <ErrorMessage message={error} className="mb-4" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <Input
          label="Mot de passe"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <Button type="submit" disabled={loading} loading={loading} loadingLabel="Connexion..." className="w-full">
          Se connecter
        </Button>
      </form>

      <div className="mt-4 text-sm text-gray-600">
        Pas encore de compte ?{' '}
        <button type="button" onClick={() => navigate('/register', { state: { from } })} className="text-[#fd4d08] font-semibold hover:underline bg-transparent border-0 cursor-pointer p-0">
          Créer un compte
        </button>
      </div>
    </CenteredCard>
  );
};

export default LoginPage;
