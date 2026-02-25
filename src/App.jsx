import React, { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Hero from './components/Hero/Hero';
import SearchBar from './components/SearchBar/SearchBar';
import DesignsList, { DesignsListSlider } from './components/DesignsList';
import Features from './components/Features/Features';
import Footer from './components/Footer/Footer';
import DesignDetailPage from './pages/DesignDetailPage';
import DownloadPage from './pages/DownloadPage';
import OrdersPage from './pages/OrdersPage';
import PackOrderPage from './pages/PackOrderPage';
import MyPackOrdersPage from './pages/MyPackOrdersPage';
import { DesignCatigory } from './pages/DesignCatigory';
import { Toaster } from 'react-hot-toast';
import PackSection from './components/PackSection/PackSection';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ContactPage from './pages/ContactPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import CheckoutCancelPage from './pages/CheckoutCancelPage';
import AdminRoute from './components/AdminRoute';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';

const AdminDashboard = lazy(() => import('./admin/AdminDashboard'));
const AdminDesigns = lazy(() => import('./admin/AdminDesigns'));
const AdminDesignDetail = lazy(() => import('./admin/AdminDesignDetail'));
const AdminCategories = lazy(() => import('./admin/AdminCategories'));
const AdminDesignForm = lazy(() => import('./admin/AdminDesignForm'));
const AdminCategoryForm = lazy(() => import('./admin/AdminCategoryForm'));
const AdminFeatures = lazy(() => import('./admin/AdminFeatures'));
const AdminFeatureForm = lazy(() => import('./admin/AdminFeatureForm'));
const AdminPacks = lazy(() => import('./admin/AdminPacks'));
const AdminPackForm = lazy(() => import('./admin/AdminPackForm'));
const AdminPackOrders = lazy(() => import('./admin/AdminPackOrders'));
const AdminOrders = lazy(() => import('./admin/AdminOrders'));
const AdminDownloads = lazy(() => import('./admin/AdminDownloads'));
const AdminUsers = lazy(() => import('./admin/AdminUsers'));
const AdminUserForm = lazy(() => import('./admin/AdminUserForm'));

const AdminFallback = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <span className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#fd4d08] inline-block" aria-hidden />
  </div>
);

/** Fallback si la page d'accueil crash (ex: removeChild quand l'API est injoignable). */
const HomePageErrorFallback = () => (
  <div className="max-w-lg mx-auto px-4 py-16 text-center">
    <p className="text-gray-600 mb-4">Le contenu de cette page est temporairement indisponible.</p>
    <p className="text-sm text-gray-500 mb-6">Vérifiez votre connexion ou réessayez plus tard.</p>
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="inline-flex bg-[#fd4d08] hover:bg-[#e64507] text-white font-semibold px-6 py-2 rounded-lg"
    >
      Recharger la page
    </button>
  </div>
);

const GlobalErrorFallback = () => (
  <div className="p-8 text-center">
    <p className="text-gray-600 mb-4">Une erreur s&apos;est produite.</p>
    <button type="button" onClick={() => { window.location.href = '/'; }} className="text-[#fd4d08] hover:underline">
      Retour à l&apos;accueil
    </button>
  </div>
);

const DesignsSliderErrorFallback = () => (
  <div className="py-12 text-center text-gray-500">Designs temporairement indisponibles.</div>
);

const AdminDashboardErrorFallback = () => (
  <div className="p-8 text-center text-gray-600">
    Erreur de chargement du dashboard.{' '}
    <a href="/" className="text-[#fd4d08] hover:underline">Retour à l&apos;accueil</a>
  </div>
);

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Ajout des filtres pour la barre de recherche
  const filters = [
    { id: 'all', label: 'Tous' },
    { id: 'free', label: 'Gratuit' },
    { id: 'premium', label: 'Premium' },
    { id: 'popular', label: 'Les plus téléchargés' }
  ];

  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-white">
        <Header />
        <ErrorBoundary fallback={<GlobalErrorFallback />}>
          <Routes>
          <Route path="/" element={
            <ErrorBoundary fallback={<HomePageErrorFallback />}>
              <div>
                <Hero />
                <SearchBar 
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  activeFilter={activeFilter}
                  onFilterChange={setActiveFilter}
                  filters={filters}
                />
                <ErrorBoundary fallback={<DesignsSliderErrorFallback />}>
                  <DesignsListSlider searchTerm={searchTerm} activeFilter={activeFilter} />
                </ErrorBoundary>
                <PackSection />
                <Features />
              </div>
            </ErrorBoundary>
          } />
          <Route path="/designs" element={
            <div>
              <SearchBar 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                filters={filters}
              />
              <DesignsList searchTerm={searchTerm} activeFilter={activeFilter} />
            </div>
          } />
         
          <Route path="/categories/:category" element={<DesignCatigory/>} />
          <Route path="/designs/:id" element={<DesignDetailPage />} />
          <Route path="/designs/:id/download" element={<DownloadPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/pack-order" element={<PackOrderPage />} />
          <Route path="/mes-commandes-pack" element={<MyPackOrdersPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/payment/success" element={<CheckoutSuccessPage />} />
          <Route path="/payment/cancel" element={<CheckoutCancelPage />} />
          <Route path="/admin" element={<AdminRoute><ErrorBoundary fallback={<AdminDashboardErrorFallback />}><Suspense fallback={<AdminFallback />}><AdminDashboard /></Suspense></ErrorBoundary></AdminRoute>} />
          <Route path="/admin/designs" element={<AdminRoute><Suspense fallback={<AdminFallback />}><AdminDesigns /></Suspense></AdminRoute>} />
          <Route path="/admin/designs/new" element={<AdminRoute><Suspense fallback={<AdminFallback />}><AdminDesignForm /></Suspense></AdminRoute>} />
          <Route path="/admin/designs/:id/edit" element={<AdminRoute><Suspense fallback={<AdminFallback />}><AdminDesignForm /></Suspense></AdminRoute>} />
          <Route path="/admin/designs/:id" element={<AdminRoute><Suspense fallback={<AdminFallback />}><AdminDesignDetail /></Suspense></AdminRoute>} />
          <Route path="/admin/categories" element={<AdminRoute><Suspense fallback={<AdminFallback />}><AdminCategories /></Suspense></AdminRoute>} />
          <Route path="/admin/categories/new" element={<AdminRoute><Suspense fallback={<AdminFallback />}><AdminCategoryForm /></Suspense></AdminRoute>} />
          <Route path="/admin/categories/:id/edit" element={<AdminRoute><Suspense fallback={<AdminFallback />}><AdminCategoryForm /></Suspense></AdminRoute>} />
          <Route path="/admin/features" element={<AdminRoute><Suspense fallback={<AdminFallback />}><AdminFeatures /></Suspense></AdminRoute>} />
          <Route path="/admin/features/new" element={<AdminRoute><Suspense fallback={<AdminFallback />}><AdminFeatureForm /></Suspense></AdminRoute>} />
          <Route path="/admin/features/:id/edit" element={<AdminRoute><Suspense fallback={<AdminFallback />}><AdminFeatureForm /></Suspense></AdminRoute>} />
          <Route path="/admin/packs" element={<AdminRoute><Suspense fallback={<AdminFallback />}><AdminPacks /></Suspense></AdminRoute>} />
          <Route path="/admin/packs/new" element={<AdminRoute><Suspense fallback={<AdminFallback />}><AdminPackForm /></Suspense></AdminRoute>} />
          <Route path="/admin/packs/:id/edit" element={<AdminRoute><Suspense fallback={<AdminFallback />}><AdminPackForm /></Suspense></AdminRoute>} />
          <Route path="/admin/pack-orders" element={<AdminRoute><Suspense fallback={<AdminFallback />}><AdminPackOrders /></Suspense></AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute><Suspense fallback={<AdminFallback />}><AdminOrders /></Suspense></AdminRoute>} />
          <Route path="/admin/downloads" element={<AdminRoute><Suspense fallback={<AdminFallback />}><AdminDownloads /></Suspense></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><Suspense fallback={<AdminFallback />}><AdminUsers /></Suspense></AdminRoute>} />
          <Route path="/admin/users/:id/edit" element={<AdminRoute><Suspense fallback={<AdminFallback />}><AdminUserForm /></Suspense></AdminRoute>} />
          </Routes>
        </ErrorBoundary>
        <Footer />
      </div>
    </Router>
  );
};

export default App;