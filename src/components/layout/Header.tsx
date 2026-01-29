import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  LeafIcon,
  CartIcon,
  UserIcon,
  MenuIcon,
  XIcon,
  HomeIcon,
  StoreIcon,
  TruckIcon,
  WheatIcon,
  LogOutIcon,
  ChevronDownIcon,
} from '@/components/icons/Icons';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenAuth: (type: 'farmer' | 'market' | 'transporter') => void;
  onOpenLogin: () => void;
  onNavigate: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCart, onOpenAuth, onOpenLogin, onNavigate }) => {
  const { cart, currentUser, userRole, logout, activeView } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
    onNavigate('home');
  };

  const getUserName = () => {
    if (!currentUser) return '';
    if ('name' in currentUser) return currentUser.name;
    if ('business_name' in currentUser) return currentUser.business_name;
    if ('company_name' in currentUser) return currentUser.company_name;
    return 'User';
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: HomeIcon },
    { id: 'marketplace', label: 'Marketplace', icon: StoreIcon },
    { id: 'farmers', label: 'Farmers', icon: WheatIcon },
    { id: 'transport', label: 'Transport', icon: TruckIcon },
  ];

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
              <LeafIcon className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Farm<span className="text-green-600">Connect</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeView === item.id
                    ? 'bg-green-50 text-green-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Cart Button (for markets) */}
            {userRole === 'market' && (
              <button
                onClick={onOpenCart}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <CartIcon size={24} />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </button>
            )}

            {/* User Menu / Auth Buttons */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      userRole === 'farmer'
                        ? 'bg-green-600'
                        : userRole === 'market'
                        ? 'bg-blue-600'
                        : 'bg-orange-500'
                    }`}
                  >
                    <UserIcon className="text-white" size={18} />
                  </div>
                  <span className="hidden sm:block font-medium text-gray-700 max-w-[120px] truncate">
                    {getUserName()}
                  </span>
                  <ChevronDownIcon
                    className={`text-gray-400 transition-transform ${
                      isUserMenuOpen ? 'rotate-180' : ''
                    }`}
                    size={18}
                  />
                </button>

                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="font-medium text-gray-900">{getUserName()}</p>
                        <p className="text-sm text-gray-500 capitalize">{userRole}</p>
                      </div>
                      <button
                        onClick={() => {
                          onNavigate('dashboard');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <HomeIcon size={18} />
                        Dashboard
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOutIcon size={18} />
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={onOpenLogin}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('market')}
                  className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium transition-colors"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full px-4 py-3 rounded-lg font-medium flex items-center gap-3 transition-colors ${
                    activeView === item.id
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon size={20} />
                  {item.label}
                </button>
              ))}
            </nav>
            {!currentUser && (
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                <button
                  onClick={() => {
                    onOpenLogin();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-gray-700 bg-gray-100 rounded-lg font-medium"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    onOpenAuth('farmer');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-green-700 bg-green-50 rounded-lg font-medium"
                >
                  Register as Farmer
                </button>
                <button
                  onClick={() => {
                    onOpenAuth('market');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium"
                >
                  Register as Buyer
                </button>
                <button
                  onClick={() => {
                    onOpenAuth('transporter');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg font-medium"
                >
                  Register as Transporter
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
