import React, { useState } from 'react';
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
import AdminDashboard from './admin/AdminDashboard';
import AdminDesigns from './admin/AdminDesigns';
import AdminDesignDetail from './admin/AdminDesignDetail';
import AdminCategories from './admin/AdminCategories';
import AdminDesignForm from './admin/AdminDesignForm';
import AdminCategoryForm from './admin/AdminCategoryForm';
import AdminFeatures from './admin/AdminFeatures';
import AdminFeatureForm from './admin/AdminFeatureForm';
import AdminPacks from './admin/AdminPacks';
import AdminPackForm from './admin/AdminPackForm';
import AdminPackOrders from './admin/AdminPackOrders';
import AdminOrders from './admin/AdminOrders';
import AdminDownloads from './admin/AdminDownloads';
import AdminUsers from './admin/AdminUsers';
import AdminUserForm from './admin/AdminUserForm';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ContactPage from './pages/ContactPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import CheckoutCancelPage from './pages/CheckoutCancelPage';
import AdminRoute from './components/AdminRoute';
import ScrollToTop from './components/ScrollToTop';
import ErrorBoundary from './components/ErrorBoundary';

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
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/designs" element={<AdminRoute><AdminDesigns /></AdminRoute>} />
          <Route path="/admin/designs/new" element={<AdminRoute><AdminDesignForm /></AdminRoute>} />
          <Route path="/admin/designs/:id/edit" element={<AdminRoute><AdminDesignForm /></AdminRoute>} />
          <Route path="/admin/designs/:id" element={<AdminRoute><AdminDesignDetail /></AdminRoute>} />
          <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
          <Route path="/admin/categories/new" element={<AdminRoute><AdminCategoryForm /></AdminRoute>} />
          <Route path="/admin/categories/:id/edit" element={<AdminRoute><AdminCategoryForm /></AdminRoute>} />
          <Route path="/admin/features" element={<AdminRoute><AdminFeatures /></AdminRoute>} />
          <Route path="/admin/features/new" element={<AdminRoute><AdminFeatureForm /></AdminRoute>} />
          <Route path="/admin/features/:id/edit" element={<AdminRoute><AdminFeatureForm /></AdminRoute>} />
          <Route path="/admin/packs" element={<AdminRoute><AdminPacks /></AdminRoute>} />
          <Route path="/admin/packs/new" element={<AdminRoute><AdminPackForm /></AdminRoute>} />
          <Route path="/admin/packs/:id/edit" element={<AdminRoute><AdminPackForm /></AdminRoute>} />
          <Route path="/admin/pack-orders" element={<AdminRoute><AdminPackOrders /></AdminRoute>} />
          <Route path="/admin/orders" element={<AdminRoute><AdminOrders /></AdminRoute>} />
          <Route path="/admin/downloads" element={<AdminRoute><AdminDownloads /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/users/:id/edit" element={<AdminRoute><AdminUserForm /></AdminRoute>} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
};

export default App;