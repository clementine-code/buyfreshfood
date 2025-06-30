"use client";

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as SubframeUtils from "../utils";
import { TopbarWithCenterSearch3 } from "../components/TopbarWithCenterSearch3";
import { Button } from "../components/Button";
import { IconButton } from "../components/IconButton";
import { FeatherUser } from "@subframe/core";
import { FeatherShoppingCart } from "@subframe/core";
import { FeatherMenu } from "@subframe/core";
import LocationButton from "../../components/LocationButton";
import MobileNavMenu from "../../components/MobileNavMenu";
import FoodSearchField from "../../components/FoodSearchField";
import LocationCollectionModal from "../../components/LocationCollectionModal";
import { type FoodSearchSuggestion } from "../../services/foodSearchService";
import { useWaitlistContext } from "../../contexts/WaitlistContext";
import { useLocationContext } from "../../contexts/LocationContext";

interface DefaultPageLayoutRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  enableMarketplaceMode?: boolean;
}

const DefaultPageLayoutRoot = React.forwardRef<HTMLDivElement, DefaultPageLayoutRootProps>(
  function DefaultPageLayoutRoot(
    { children, className, enableMarketplaceMode = false, ...otherProps }: DefaultPageLayoutRootProps,
    ref
  ) {
    const location = useLocation();
    const navigate = useNavigate();
    const [showMobileNav, setShowMobileNav] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [cartItemCount, setCartItemCount] = useState(0);
    
    // Waitlist integration
    const { openSignInWaitlistFlow } = useWaitlistContext();
    const { state: locationState } = useLocationContext();

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
    }, []);

    const handleFoodItemSelect = (suggestion: FoodSearchSuggestion) => {
      console.log('Selected food item:', suggestion);
      
      // Navigate based on suggestion type
      switch (suggestion.type) {
        case 'product':
          // Navigate to shop with product search
          navigate(`/shop?search=${encodeURIComponent(suggestion.title)}`);
          break;
        case 'category':
          // Extract category name from "All [Category]" format
          const categoryName = suggestion.title.replace(/^All\s+/, '');
          navigate(`/shop?category=${encodeURIComponent(categoryName)}`);
          break;
        case 'seller':
          // Navigate to shop with seller filter
          navigate(`/shop?seller=${encodeURIComponent(suggestion.title)}`);
          break;
        default:
          // Navigate to search results
          navigate(`/shop?search=${encodeURIComponent(suggestion.title)}`);
      }
    };

    const handleFoodSearchSubmit = (query: string) => {
      console.log('Food search submitted:', query);
      // Navigate to search results page
      navigate(`/shop?search=${encodeURIComponent(query)}`);
    };

    const handleLocationButtonClick = () => {
      setIsLocationModalOpen(true);
    };
    
    // NEW: Handle sign in button click - trigger waitlist flow
    const handleSignInClick = (e: React.MouseEvent) => {
      e.preventDefault();
      openSignInWaitlistFlow();
    };

    return (
      <div
        className={SubframeUtils.twClassNames(
          enableMarketplaceMode 
            ? "flex h-screen w-full flex-col bg-default-background"
            : "flex min-h-screen w-full flex-col bg-default-background",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        {/* Desktop Topbar - Only show on large screens (1280px+) */}
        <div className="hidden xl:block w-full" style={{position: 'fixed', top: '0', left: '0', right: '0', zIndex: 50}}>
          <TopbarWithCenterSearch3
            className="w-full bg-default-background border-b border-neutral-border"
            leftSlot={
              <>
                <Link to="/">
                  <img
                    className="h-6 flex-none object-cover cursor-pointer"
                    src="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4aye54aye.png"
                    alt="Logo"
                  />
                </Link>
                <div className="flex items-center gap-2">
                  <Link to="/">
                    <TopbarWithCenterSearch3.NavItem selected={location.pathname === "/"}>
                      Home
                    </TopbarWithCenterSearch3.NavItem>
                  </Link>
                  <Link to="/shop">
                    <TopbarWithCenterSearch3.NavItem selected={location.pathname === "/shop"}>
                      Shop
                    </TopbarWithCenterSearch3.NavItem>
                  </Link>
                  <Link to="/sell">
                    <TopbarWithCenterSearch3.NavItem selected={location.pathname === "/sell"}>
                      Sell
                    </TopbarWithCenterSearch3.NavItem>
                  </Link>
                </div>
              </>
            }
            centerSlot={
              <FoodSearchField
                className="h-auto grow shrink-0 basis-0"
                onItemSelect={handleFoodItemSelect}
                onSearchSubmit={handleFoodSearchSubmit}
                placeholder="Search for fresh local food..."
                showTrending={true}
              />
            }
            rightSlot={
              <>
                <LocationButton className="flex-shrink-0" onClick={handleLocationButtonClick} />
                <Button 
                  variant="brand-secondary" 
                  icon={<FeatherUser />}
                  onClick={handleSignInClick}
                >
                  Sign In
                </Button>
                <div className="relative">
                  <Button 
                    icon={<FeatherShoppingCart />}
                    onClick={() => navigate('/cart')}
                  >
                    Cart
                  </Button>
                  {cartItemCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-neutral-300 text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                      {cartItemCount > 9 ? '9+' : cartItemCount}
                    </div>
                  )}
                </div>
              </>
            }
          />
        </div>

        {/* Mobile/Tablet Topbar - Show for all screens below 1280px */}
        <div className="xl:hidden w-full bg-default-background border-b border-neutral-border fixed-navbar">
          <nav className="flex w-full items-center gap-4 bg-default-background px-6 py-6 h-full">
            {/* Hamburger Menu Button */}
            <button
              className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-neutral-100 transition-colors"
              onClick={() => setShowMobileNav(true)}
            >
              <FeatherMenu className="w-5 h-5 text-default-font" />
            </button>

            {/* Center Search */}
            <div className="flex grow shrink-0 basis-0 items-center justify-center gap-4">
              <FoodSearchField
                className="h-auto grow shrink-0 basis-0"
                onItemSelect={handleFoodItemSelect}
                onSearchSubmit={handleFoodSearchSubmit}
                placeholder="Search fresh food..."
                showTrending={false}
              />
            </div>

            {/* Right Actions - Location and Cart */}
            <div className="flex items-center justify-end gap-2">
              <LocationButton className="flex-shrink-0" onClick={handleLocationButtonClick} />
              <div className="flex-shrink-0 relative">
                <IconButton
                  variant="brand-primary"
                  icon={<FeatherShoppingCart />}
                  onClick={() => navigate('/cart')}
                />
                {cartItemCount > 0 && (
                  <div className="absolute -top-1 -right-1 bg-neutral-300 text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    {cartItemCount > 9 ? '9+' : cartItemCount}
                  </div>
                )}
              </div>
            </div>
          </nav>
        </div>

        {/* Mobile Navigation Menu */}
        <MobileNavMenu
          isOpen={showMobileNav}
          onClose={() => setShowMobileNav(false)}
        />

        {/* Location Modal */}
        <LocationCollectionModal
          open={isLocationModalOpen}
          onOpenChange={setIsLocationModalOpen}
          mode="create"
        />

        {/* Main Content - Conditional overflow based on marketplace mode */}
        {children ? (
          <div className={
            enableMarketplaceMode 
              ? "flex-1 w-full bg-default-background overflow-hidden pt-12" 
              : "flex-1 w-full bg-default-background overflow-y-auto pt-12"
          }>
            {children}
          </div>
        ) : null}
      </div>
    );
  }
);

export const DefaultPageLayout = DefaultPageLayoutRoot;