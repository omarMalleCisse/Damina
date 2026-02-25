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
        <Routes>
          <Route path="/" element={
            <div>
              <Hero />
              <SearchBar 
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                filters={filters}
              />
              <ErrorBoundary>
                <DesignsListSlider searchTerm={searchTerm} activeFilter={activeFilter} />
              </ErrorBoundary>
              <PackSection />
              <Features />
            </div>
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
          <Route path="/admin" element={<AdminRoute><ErrorBoundary fallback={<div className="p-8 text-center text-gray-600">Erreur de chargement du dashboard. <a href="/" className="text-[#fd4d08] hover:underline">Retour à l&apos;accueil</a></div>}><Suspense fallback={<AdminFallback />}><AdminDashboard /></Suspense></ErrorBoundary>} />
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
        <Footer />
      </div>
    </Router>
  );
};

export default App;