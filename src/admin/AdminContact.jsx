import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { contactAPI } from '../utils/api';

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

const AdminContact = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMessages = async () => {
    setLoading(true);
    setError('');
    const token = getToken();
    if (!token) {
      setError('Non connecté.');
      setLoading(false);
      return;
    }
    try {
      const data = await contactAPI.list(token);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || 'Impossible de charger les messages de contact.');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const formatDate = (value) => {
    if (!value) return '—';
    try {
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? value : d.toLocaleString('fr-FR');
    } catch {
      return value;
    }
  };

  const truncate = (str, max = 60) => {
    if (!str) return '—';
    const s = String(str).trim();
    return s.length <= max ? s : `${s.slice(0, max)}…`;
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Messages de contact</h1>
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="inline-flex items-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Retour au dashboard
            </button>
          </div>
          <p className="text-gray-600">
            Liste des messages envoyés depuis le formulaire de contact.
          </p>
        </div>

        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h2 className="text-xl font-semibold text-gray-900">Liste des messages</h2>
            <button
              type="button"
              onClick={fetchMessages}
              className="text-sm text-gray-500 hover:text-gray-900 px-2 py-1.5"
            >
              Rafraîchir
            </button>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-gray-500 flex items-center justify-center gap-2">
              <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-gray-200 border-t-[#fd4d08] inline-block" aria-hidden />
              Chargement des messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-gray-500">
              Aucun message de contact.
            </div>
          ) : (
            <>
              {/* Vue mobile : cartes */}
              <div className="space-y-3 md:hidden">
                {messages.map((row, index) => (
                  <div
                    key={row.id ?? index}
                    className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-gray-100">
                      <span className="font-semibold text-gray-900">
                        {row.subject ?? 'Sans sujet'}
                      </span>
                      {row.is_read === false && (
                        <span className="rounded-full bg-[#fd4d08]/10 px-2 py-0.5 text-xs font-medium text-[#fd4d08]">
                          Non lu
                        </span>
                      )}
                    </div>
                    <dl className="grid gap-2 text-sm">
                      <div>
                        <dt className="text-gray-500">Nom</dt>
                        <dd className="text-gray-900">{row.name ?? '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Email</dt>
                        <dd className="text-gray-900 break-all">{row.email ?? '—'}</dd>
                      </div>
                      {row.phone && (
                        <div>
                          <dt className="text-gray-500">Téléphone</dt>
                          <dd className="text-gray-900">{row.phone}</dd>
                        </div>
                      )}
                      <div>
                        <dt className="text-gray-500">Message</dt>
                        <dd className="text-gray-700 whitespace-pre-wrap">{row.message ?? '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-gray-500">Date</dt>
                        <dd className="text-gray-500">{formatDate(row.created_at ?? row.date)}</dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>

              {/* Vue desktop : tableau */}
              <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sujet</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {messages.map((row, index) => (
                      <tr key={row.id ?? index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                          {formatDate(row.created_at ?? row.date)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {row.name ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 break-all">
                          {row.email ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.subject ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                          {truncate(row.message, 80)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {row.is_read === false ? (
                            <span className="rounded-full bg-[#fd4d08]/10 px-2 py-0.5 text-xs font-medium text-[#fd4d08]">
                              Non lu
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminContact;
