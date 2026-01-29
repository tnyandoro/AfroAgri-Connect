import React, { useState } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Modal } from '@/components/ui/Modal';
import { FarmerRegistration } from '@/components/registration/FarmerRegistration';
import { MarketRegistration } from '@/components/registration/MarketRegistration';
import { TransporterRegistration } from '@/components/registration/TransporterRegistration';
import { LoginModal } from '@/components/auth/LoginModal';
import { HomePage } from '@/components/pages/HomePage';
import { MarketplacePage } from '@/components/pages/MarketplacePage';
import { FarmersPage } from '@/components/pages/FarmersPage';
import { TransportPage } from '@/components/pages/TransportPage';
import { FarmerDashboard } from '@/components/dashboard/FarmerDashboard';
import { MarketDashboard } from '@/components/dashboard/MarketDashboard';
import { TransporterDashboard } from '@/components/dashboard/TransporterDashboard';
import { ShoppingCart } from '@/components/cart/ShoppingCart';
import { CheckoutFlow } from '@/components/checkout/CheckoutFlow';

const AppContent: React.FC = () => {
  const {
    activeView,
    setActiveView,
    showAuthModal,
    setShowAuthModal,
    authModalType,
    setAuthModalType,
    showLoginModal,
    setShowLoginModal,
    userRole,
    setCurrentUser,
    setUserRole,
    isAuthLoading,
  } = useApp();

  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const handleOpenAuth = (type: 'farmer' | 'market' | 'transporter') => {
    setAuthModalType(type);
    setShowAuthModal(true);
    setShowLoginModal(false);
  };

  const handleOpenLogin = () => {
    setShowLoginModal(true);
    setShowAuthModal(false);
    setAuthModalType(null);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setAuthModalType(null);
    setShowLoginModal(false);
    setActiveView('dashboard');
  };

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user.profile);
    setUserRole(user.role);
    setShowLoginModal(false);
    setActiveView('dashboard');
  };

  const handleSwitchToLogin = () => {
    setShowAuthModal(false);
    setAuthModalType(null);
    setShowLoginModal(true);
  };

  const handleSwitchToRegister = () => {
    setShowLoginModal(false);
    setShowAuthModal(true);
    setAuthModalType('market'); // Default to market registration
  };

  const handleNavigate = (view: string) => {
    if (view === 'checkout') {
      setShowCart(false);
      setShowCheckout(true);
    } else {
      setActiveView(view);
      setShowCheckout(false);
    }
  };

  const handleOpenCart = () => {
    setShowCart(true);
  };

  const handleCheckout = () => {
    setShowCart(false);
    setShowCheckout(true);
  };

  const handleCheckoutComplete = () => {
    setShowCheckout(false);
    setActiveView('dashboard');
  };

  const getAuthModalTitle = () => {
    switch (authModalType) {
      case 'farmer':
        return 'Register as a Farmer';
      case 'market':
        return 'Register as a Buyer';
      case 'transporter':
        return 'Register as a Transporter';
      default:
        return 'Register';
    }
  };

  // Show loading state while checking auth
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    // Show checkout flow if active
    if (showCheckout) {
      return (
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
              </div>
              <CheckoutFlow
                onComplete={handleCheckoutComplete}
                onBack={() => {
                  setShowCheckout(false);
                  setShowCart(true);
                }}
              />
            </div>
          </div>
        </div>
      );
    }

    // Show dashboard based on user role
    if (activeView === 'dashboard') {
      switch (userRole) {
        case 'farmer':
          return <FarmerDashboard />;
        case 'market':
          return <MarketDashboard onNavigate={handleNavigate} />;
        case 'transporter':
          return <TransporterDashboard />;
        default:
          return <HomePage onOpenAuth={handleOpenAuth} onNavigate={handleNavigate} />;
      }
    }

    // Regular page routing
    switch (activeView) {
      case 'marketplace':
        return <MarketplacePage />;
      case 'farmers':
        return <FarmersPage onNavigate={handleNavigate} />;
      case 'transport':
        return <TransportPage onOpenAuth={handleOpenAuth} />;
      default:
        return <HomePage onOpenAuth={handleOpenAuth} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onOpenCart={handleOpenCart}
        onOpenAuth={handleOpenAuth}
        onOpenLogin={handleOpenLogin}
        onNavigate={handleNavigate}
      />

      <main className="flex-1">{renderPage()}</main>

      <Footer />

      {/* Login Modal */}
      <Modal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="Sign In"
        size="md"
      >
        <LoginModal
          onSuccess={handleLoginSuccess}
          onClose={() => setShowLoginModal(false)}
          onSwitchToRegister={handleSwitchToRegister}
        />
      </Modal>

      {/* Registration Modal */}
      <Modal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setAuthModalType(null);
        }}
        title={getAuthModalTitle()}
        size="lg"
      >
        {authModalType === 'farmer' && (
          <FarmerRegistration
            onSuccess={handleAuthSuccess}
            onCancel={() => {
              setShowAuthModal(false);
              setAuthModalType(null);
            }}
            onSwitchToLogin={handleSwitchToLogin}
          />
        )}
        {authModalType === 'market' && (
          <MarketRegistration
            onSuccess={handleAuthSuccess}
            onCancel={() => {
              setShowAuthModal(false);
              setAuthModalType(null);
            }}
            onSwitchToLogin={handleSwitchToLogin}
          />
        )}
        {authModalType === 'transporter' && (
          <TransporterRegistration
            onSuccess={handleAuthSuccess}
            onCancel={() => {
              setShowAuthModal(false);
              setAuthModalType(null);
            }}
            onSwitchToLogin={handleSwitchToLogin}
          />
        )}
      </Modal>

      {/* Cart Modal */}
      <Modal
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        title="Shopping Cart"
        size="lg"
      >
        <ShoppingCart
          onCheckout={handleCheckout}
          onClose={() => setShowCart(false)}
        />
      </Modal>
    </div>
  );
};

const AppLayout: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default AppLayout;
