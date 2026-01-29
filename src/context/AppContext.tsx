import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Farmer, Market, Transporter, CartItem, UserRole, ProduceListing } from '@/types';
import { getSession, onAuthStateChange, signOut as authSignOut } from '@/lib/auth';

interface AppContextType {
  // User state
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  currentUser: Farmer | Market | Transporter | null;
  setCurrentUser: (user: Farmer | Market | Transporter | null) => void;
  isAuthLoading: boolean;
  
  // Cart state
  cart: CartItem[];
  addToCart: (produce: ProduceListing, quantity: number) => void;
  removeFromCart: (produceId: string) => void;
  updateCartQuantity: (produceId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  
  // UI state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  activeView: string;
  setActiveView: (view: string) => void;
  
  // Modal state
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authModalType: 'farmer' | 'market' | 'transporter' | null;
  setAuthModalType: (type: 'farmer' | 'market' | 'transporter' | null) => void;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  
  // Auth actions
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [currentUser, setCurrentUser] = useState<Farmer | Market | Transporter | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState('home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalType, setAuthModalType] = useState<'farmer' | 'market' | 'transporter' | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      setIsAuthLoading(true);
      try {
        const { user } = await getSession();
        if (user) {
          setCurrentUser(user.profile);
          setUserRole(user.role);
        }
      } catch (err) {
        console.error('Error checking session:', err);
      } finally {
        setIsAuthLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = onAuthStateChange((user) => {
      if (user) {
        setCurrentUser(user.profile);
        setUserRole(user.role);
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('farmconnect_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error parsing cart:', e);
      }
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('farmconnect_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (produce: ProduceListing, quantity: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.produce.id === produce.id);
      if (existing) {
        return prev.map(item =>
          item.produce.id === produce.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { produce, quantity }];
    });
  };

  const removeFromCart = (produceId: string) => {
    setCart(prev => prev.filter(item => item.produce.id !== produceId));
  };

  const updateCartQuantity = (produceId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(produceId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.produce.id === produceId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const logout = async () => {
    await authSignOut();
    setCurrentUser(null);
    setUserRole(null);
    setActiveView('home');
  };

  const cartTotal = cart.reduce(
    (total, item) => total + item.produce.price_per_unit * item.quantity,
    0
  );

  return (
    <AppContext.Provider
      value={{
        userRole,
        setUserRole,
        currentUser,
        setCurrentUser,
        isAuthLoading,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        isLoading,
        setIsLoading,
        activeView,
        setActiveView,
        showAuthModal,
        setShowAuthModal,
        authModalType,
        setAuthModalType,
        showLoginModal,
        setShowLoginModal,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
