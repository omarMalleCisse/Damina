import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { CenteredCard } from '../components/layout';
import { Button, Input, ErrorMessage } from '../components/ui';

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';
  const [form, setForm] = useState({
    username: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await authAPI.register(form);
      setSuccess('Compte créé avec succès. Connectez-vous.');
      setTimeout(() => navigate('/login', { state: { from } }), 800);
    } catch (err) {
      setError(err.message || 'Impossible de créer le compte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CenteredCard>
      <h1 className="text-2xl font-semibold text-gray-900 mb-2">Créer un compte</h1>
      <p className="text-sm text-gray-500 mb-6">Inscrivez-vous pour avoir accès à votre compte.</p>

      <ErrorMessage message={error} className="mb-4" />
      {success && <div className="mb-4 text-sm text-green-600">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nom d'utilisateur" name="username" value={form.username} onChange={handleChange} required />
        <Input label="Email" type="email" name="email" value={form.email} onChange={handleChange} required />
        <Input label="Téléphone" type="tel" name="phone" value={form.phone} onChange={handleChange} />
        <Input label="Adresse" name="address" value={form.address} onChange={handleChange} />
        <Input label="Mot de passe" type="password" name="password" value={form.password} onChange={handleChange} required />
        <Button type="submit" disabled={loading} loading={loading} loadingLabel="Création..." className="w-full">
          Créer un compte
        </Button>
      </form>

      <div className="mt-4 text-sm text-gray-600">
        Déjà un compte ?{' '}
        <button type="button" onClick={() => navigate('/login', { state: { from } })} className="text-[#fd4d08] font-semibold hover:underline bg-transparent border-0 cursor-pointer p-0">
          Se connecter
        </button>
      </div>
    </CenteredCard>
  );
};

export default RegisterPage;
