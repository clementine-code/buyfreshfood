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
  exiting?: boolean;
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
    
    // Replace existing snackbar of same type to avoid stacking too many
    setSnackbars(prev => {
      const filtered = prev.filter(sb => sb.type !== type);
      return [...filtered, newSnackbar];
    });
    
    // Auto-dismiss after 4 seconds (reduced from 5)
    const timerId = setTimeout(() => {
      dismissSnackbar(id);
    }, 4000);
    
    return id;
  }, []);

  // Dismiss snackbar
  const dismissSnackbar = useCallback((id: string) => {
    setSnackbars(prev => {
      const snackbar = prev.find(sb => sb.id === id);
      if (snackbar) {
        // Add exit animation class
        const updatedSnackbars = prev.map(sb => 
          sb.id === id ? { ...sb, exiting: true } : sb
        );
        
        // Remove after animation completes
        setTimeout(() => {
          setSnackbars(current => current.filter(sb => sb.id !== id));
        }, 300);
        
        return updatedSnackbars;
      }
      return prev.filter(sb => sb.id !== id);
    });
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
      
      {/* Snackbar Container - Fixed position at top center with z-index */}
      <div className="fixed top-4 left-0 right-0 z-[1000] flex justify-center pointer-events-none">
        <div className="space-y-2 pointer-events-none">
          {snackbars.map((snackbar, index) => (
            <div
              key={snackbar.id}
              className={`transition-all duration-300 ease-in-out pointer-events-auto ${snackbar.exiting ? 'snackbar-exit' : 'snackbar-enter'}`}
              style={{
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