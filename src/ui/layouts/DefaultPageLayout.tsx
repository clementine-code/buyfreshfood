"use client";
/*
 * Documentation:
 * Default Page Layout — https://app.subframe.com/6b5c53cba769/library?component=Default+Page+Layout_a57b1c43-310a-493f-b807-8cc88e2452cf
 * Topbar with center search3 — https://app.subframe.com/6b5c53cba769/library?component=Topbar+with+center+search3_2cf578a5-28e7-4c6a-9cae-fd7f815e3509
 * Topbar with center search2 — https://app.subframe.com/6b5c53cba769/library?component=Topbar+with+center+search2_b7addef3-c5e9-4667-af46-c01b7b1bf439
 */

import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import * as SubframeUtils from "../utils";
import { TopbarWithCenterSearch3 } from "../components/TopbarWithCenterSearch3";
import { Button } from "../components/Button";
import { IconButton } from "../components/IconButton";
import { FeatherUser } from "@subframe/core";
import { FeatherShoppingCart } from "@subframe/core";
import { FeatherMenu } from "@subframe/core";
import MobileNavMenu from "../../components/MobileNavMenu";
import FoodSearchField from "../../components/FoodSearchField";
import { type FoodSearchSuggestion } from "../../services/foodSearchService";

interface DefaultPageLayoutRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  enableMarketplaceMode?: boolean; // Add marketplace mode prop
}

const DefaultPageLayoutRoot = React.forwardRef<HTMLDivElement, DefaultPageLayoutRootProps>(function DefaultPageLayoutRoot(
  { children, className, enableMarketplaceMode = false, ...otherProps }: DefaultPageLayoutRootProps,
  ref
) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMobileNav, setShowMobileNav] = useState(false);

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
      <div className="hidden xl:block w-full bg-default-background border-b border-neutral-border" style={{position: 'fixed', top: '0', left: '0', right: '0', zIndex: 50}}>
        <TopbarWithCenterSearch3
          className="py-3 h-full"
          leftSlot={
            <>
              <Link to="/">
                <img
                  className="h-6 flex-none object-cover cursor-pointer"
                  src="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4aye54aye.png"
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
    <LocationButton className="flex-shrink-0" />
    <Button variant="brand-secondary" icon={<FeatherUser />}>
      Sign In
    </Button>
    <Button icon={<FeatherShoppingCart />}>
      Cart
    </Button>
  </>
}
        />
      </div>

      {/* Mobile/Tablet Topbar - Show for all screens below 1280px */}
      <div className="xl:hidden w-full bg-default-background border-b border-neutral-border" style={{position: 'fixed', top: '0', left: '0', right: '0', zIndex: 50}}>

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

          {/* Right Actions */}
          <div className="flex items-center justify-end gap-2">
            <LocationButton className="flex-shrink-0" />
            <div className="flex-shrink-0">
              <IconButton
                variant="brand-secondary"
                icon={<FeatherUser />}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              />
            </div>
            <div className="flex-shrink-0">
              <IconButton
                variant="brand-primary"
                icon={<FeatherShoppingCart />}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              />
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Navigation Menu */}
      <MobileNavMenu
        isOpen={showMobileNav}
        onClose={() => setShowMobileNav(false)}
      />

      {/* Main Content - Conditional overflow based on marketplace mode */}
      {children ? (
  <div className={
    enableMarketplaceMode 
      ? "flex-1 w-full bg-default-background overflow-hidden" 
      : "flex-1 w-full bg-default-background overflow-y-auto pt-20"
  }>
    {children}
  </div>
) : null}
    </div>
  );
});

export const DefaultPageLayout = DefaultPageLayoutRoot;