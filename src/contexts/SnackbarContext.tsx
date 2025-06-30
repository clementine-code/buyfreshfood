import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import CartActionSnackbar from '../components/CartActionSnackbar';
import SaveForLaterActionSnackbar from '../components/SaveForLaterActionSnackbar';
import { useNavigate } from 'react-router-dom';

// Product data interface for snackbars
export interface SnackbarProductData {
  id: string;
  name: string;
  quantity?: number;
  unit?: string;
  image: string;
}

// Snackbar item interface
interface SnackbarItem {
  id: string;
  type: 'cart' | 'saved';
  product: SnackbarProductData;
  timestamp: number;
}

// Context interface
interface SnackbarContextType {
  showSnackbar: (type: 'cart' | 'saved', productData: SnackbarProductData) => void;
  dismissSnackbar: (id: string) => void;
}

// Create context
const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

// Provider component
interface SnackbarProviderProps {
  children: ReactNode;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
  const [snackbars, setSnackbars] = useState<SnackbarItem[]>([]);
  const navigate = useNavigate();
  
  // Clean up timers on unmount
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, []);

  // Show snackbar
  const showSnackbar = useCallback((type: 'cart' | 'saved', productData: SnackbarProductData) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const newSnackbar: SnackbarItem = {
      id,
      type,
      product: productData,
      timestamp: Date.now()
    };
    
    setSnackbars(prev => [...prev, newSnackbar]);
    
    // Auto-dismiss after 5 seconds
    const timerId = setTimeout(() => {
      dismissSnackbar(id);
    }, 5000);
    
    return id;
  }, []);

  // Dismiss snackbar
  const dismissSnackbar = useCallback((id: string) => {
    setSnackbars(prev => prev.filter(snackbar => snackbar.id !== id));
  }, []);

  // Handle continue shopping
  const handleContinueShopping = useCallback((id: string) => {
    dismissSnackbar(id);
  }, [dismissSnackbar]);

  // Handle go to checkout/cart
  const handleGoToCheckout = useCallback((id: string) => {
    dismissSnackbar(id);
    navigate('/cart');
  }, [dismissSnackbar, navigate]);

  return (
    <SnackbarContext.Provider value={{ showSnackbar, dismissSnackbar }}>
      {children}
      
      {/* Snackbar Container */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 space-y-3 pointer-events-none">
        {snackbars.map((snackbar, index) => (
          <div
            key={snackbar.id}
            className="transition-all duration-300 ease-in-out pointer-events-auto"
            style={{
              transform: `translateY(${index * 10}px)`,
              zIndex: 1000 - index
            }}
          >
            {snackbar.type === 'cart' ? (
              <CartActionSnackbar
                product={snackbar.product}
                onDismiss={() => dismissSnackbar(snackbar.id)}
                onContinueShopping={() => handleContinueShopping(snackbar.id)}
                onGoToCheckout={() => handleGoToCheckout(snackbar.id)}
              />
            ) : (
              <SaveForLaterActionSnackbar
                product={snackbar.product}
                onDismiss={() => dismissSnackbar(snackbar.id)}
                onContinueShopping={() => handleContinueShopping(snackbar.id)}
                onGoToCheckout={() => handleGoToCheckout(snackbar.id)}
              />
            )}
          </div>
        ))}
      </div>
    </SnackbarContext.Provider>
  );
};

// Custom hook for using the snackbar context
export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (context === undefined) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};