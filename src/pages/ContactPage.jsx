import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { CenteredCard } from '../components/layout';
import { Button, Input, Textarea, Card } from '../components/ui';
import { contactAPI, authAPI } from '../utils/api';
import { getToken } from '../utils/auth';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ContactPage = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    authAPI.me(token).then((user) => {
      if (!user) return;
      setForm((prev) => ({
        ...prev,
        name: user.full_name || user.name || user.username || prev.name || '',
        email: user.email || prev.email || '',
        phone: user.phone || user.phone_number || prev.phone || ''
      }));
    }).catch(() => {});
  }, []);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const err = {};
    const name = form.name.trim();
    const email = form.email.trim();
    const subject = form.subject.trim();
    const message = form.message.trim();
    if (!name) err.name = 'Le nom est requis.';
    if (!email) err.email = "L'email est requis.";
    else if (!EMAIL_REGEX.test(email)) err.email = 'Format d\'email invalide.';
    if (!subject) err.subject = 'Le sujet est requis.';
    if (!message) err.message = 'Le message est requis.';
    setFieldErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!validate()) return;

    setLoading(true);
    try {
      await contactAPI.send(form);
      setSuccess(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      setFieldErrors({});
    } catch (err) {
      const msg = typeof err?.message === 'string' ? err.message : 'Erreur lors de l\'envoi du message. Veuillez réessayer.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl py-8 sm:py-12 lg:py-16">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
          <span className="bg-gradient-to-r from-[#ec9c23] via-[#eb4f11] to-[#fd4d08] bg-clip-text text-transparent">
            Contactez-nous
          </span>
        </h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          Une question ? Une suggestion ? Nous sommes là pour vous aider.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Informations de contact */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Informations de contact</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#fd4d08]/10 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-[#fd4d08]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Email</p>
                  <a href="mailto:contact@daminaplus.com" className="text-sm text-gray-600 hover:text-[#fd4d08] transition">
                    cissemalle58@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#fd4d08]/10 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-[#fd4d08]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Téléphone</p>
                  <a href="tel:+221773349652" className="text-sm text-gray-600 hover:text-[#fd4d08] transition">
                    +221 77 123 45 67
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#fd4d08]/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-[#fd4d08]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Adresse</p>
                  <p className="text-sm text-gray-600">
                    Dakar, Sénégal
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Horaires d'ouverture</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Lundi - Vendredi</span>
                <span className="font-medium text-gray-900">9h -22h</span>
              </div>
              <div className="flex justify-between">
                <span>Samedi</span>
                <span className="font-medium text-gray-900">9h - 19h</span>
              </div>
              <div className="flex justify-between">
                <span>Dimanche</span>
                <span className="font-medium text-gray-900">Fermé</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Formulaire */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Envoyez-nous un message</h2>
            
            {success && (
              <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-900">Message envoyé avec succès !</p>
                  <p className="text-sm text-green-700 mt-1">Nous vous répondrons dans les plus brefs délais.</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nom complet"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Votre nom"
                  error={fieldErrors.name}
                />
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="votre@email.com"
                  error={fieldErrors.email}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Téléphone (optionnel)"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+221 77 123 45 67"
                />
                <Input
                  label="Sujet"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  placeholder="Objet de votre message"
                  error={fieldErrors.subject}
                />
              </div>

              <Textarea
                label="Message"
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                rows={6}
                placeholder="Décrivez votre demande ou votre question..."
                error={fieldErrors.message}
              />

              <Button
                type="submit"
                disabled={loading}
                loading={loading}
                loadingLabel="Envoi en cours..."
                className="w-full sm:w-auto"
                size="lg"
              >
                <Send className="w-5 h-5" />
                Envoyer le message
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactPage;
