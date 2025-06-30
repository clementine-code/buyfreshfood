"use client";
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FeatherX, FeatherHome, FeatherShoppingBag, FeatherStore, FeatherUser, FeatherShoppingCart, FeatherClock } from "@subframe/core";
import { IconButton } from "@/ui/components/IconButton";
import { Button } from "@/ui/components/Button";
import { useWaitlistContext } from "../contexts/WaitlistContext";

interface MobileNavMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileNavMenu: React.FC<MobileNavMenuProps> = ({
  isOpen,
  onClose
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [cartItemCount, setCartItemCount] = useState(0);
  const { openSignInWaitlistFlow, openWaitlistFlow } = useWaitlistContext();

  // Get cart item count from localStorage
  useEffect(() => {
    const getCartItemCount = () => {
      try {
        const savedCart = localStorage.getItem('freshFoodCart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          const count = Object.values(parsedCart.sellers).reduce((total: number, seller: any) => {
            return total + seller.items.reduce((itemCount: number, item: any) => itemCount + item.quantity, 0);
          }, 0);
          setCartItemCount(count);
        } else {
          setCartItemCount(0);
        }
      } catch (error) {
        console.error('Error parsing saved cart:', error);
        setCartItemCount(0);
      }
    };

    // Initial count
    getCartItemCount();

    // Set up storage event listener to update count when cart changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'freshFoodCart') {
        getCartItemCount();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Custom event for same-tab updates
    const handleCustomEvent = () => getCartItemCount();
    window.addEventListener('cartUpdated', handleCustomEvent);

    // Check for cart updates every 2 seconds (fallback)
    const intervalId = setInterval(getCartItemCount, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCustomEvent);
      clearInterval(intervalId);
    };
  }, [isOpen]);
  
  // Handle join waitlist click
  const handleJoinWaitlistClick = () => {
    onClose();
    openWaitlistFlow('geographic', undefined, { collectLocationInModal: true });
  };
  
  // Handle sign in click
  const handleSignInClick = () => {
    onClose();
    openSignInWaitlistFlow();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] bg-black bg-opacity-50 flex">
      {/* Menu Panel - Slides from left */}
      <div className="w-80 h-full bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <img
              className="h-6 flex-none object-cover"
              src="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4aye54aye.png"
            />
            <span className="text-heading-3 font-heading-3 text-default-font">
              Fresh Local Food
            </span>
          </div>
          <IconButton
            variant="neutral-tertiary"
            icon={<FeatherX />}
            onClick={onClose}
          />
        </div>

        {/* Navigation Items */}
        <div className="flex-1 p-6">
          <nav className="space-y-2">
            {/* NEW: Join Waitlist - Prominent placement */}
            <div 
              className="flex items-center gap-4 p-4 rounded-lg bg-brand-50 border border-brand-100 text-brand-700 mb-4 cursor-pointer"
              onClick={handleJoinWaitlistClick}
            >
              <FeatherClock className="w-5 h-5" />
              <span className="text-body-bold font-body-bold">Join Waitlist</span>
            </div>
            
            <Link to="/" onClick={onClose}>
              <div className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                location.pathname === "/" 
                  ? "bg-brand-100 text-brand-700" 
                  : "hover:bg-neutral-50 text-default-font"
              }`}>
                <FeatherHome className="w-5 h-5" />
                <span className="text-body-bold font-body-bold">Home</span>
              </div>
            </Link>

            <Link to="/shop" onClick={onClose}>
              <div className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                location.pathname === "/shop" 
                  ? "bg-brand-100 text-brand-700" 
                  : "hover:bg-neutral-50 text-default-font"
              }`}>
                <FeatherShoppingBag className="w-5 h-5" />
                <span className="text-body-bold font-body-bold">Shop</span>
              </div>
            </Link>

            <Link to="/sell" onClick={onClose}>
              <div className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                location.pathname === "/sell" 
                  ? "bg-brand-100 text-brand-700" 
                  : "hover:bg-neutral-50 text-default-font"
              }`}>
                <FeatherStore className="w-5 h-5" />
                <span className="text-body-bold font-body-bold">Sell</span>
              </div>
            </Link>
            
            <Link to="/cart" onClick={onClose}>
              <div className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                location.pathname === "/cart" 
                  ? "bg-brand-100 text-brand-700" 
                  : "hover:bg-neutral-50 text-default-font"
              }`}>
                <div className="relative">
                  <FeatherShoppingCart className="w-5 h-5" />
                  {cartItemCount > 0 && (
                    <div className="absolute -top-2 -right-2 bg-brand-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                      {cartItemCount > 9 ? '9+' : cartItemCount}
                    </div>
                  )}
                </div>
                <span className="text-body-bold font-body-bold">Cart</span>
              </div>
            </Link>
          </nav>

          {/* Auth and Cart Actions */}
          <div className="mt-8 space-y-3">
            <Button 
              variant="brand-tertiary" 
              icon={<FeatherUser />}
              className="w-full justify-start"
              onClick={handleSignInClick}
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Footer with Slogan */}
        <div className="p-6 border-t border-neutral-200">
          <div className="text-center">
            <span className="text-body-bold font-body-bold text-brand-700">
              Where fresh means local.
            </span>
          </div>
        </div>
      </div>
      
      {/* Overlay - clicking closes menu */}
      <div 
        className="flex-1" 
        onClick={onClose}
      />
    </div>
  );
};

export default MobileNavMenu;