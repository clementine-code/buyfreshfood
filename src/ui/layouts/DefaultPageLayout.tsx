"use client";
/*
 * Documentation:
 * Default Page Layout — https://app.subframe.com/6b5c53cba769/library?component=Default+Page+Layout_a57b1c43-310a-493f-b807-8cc88e2452cf
 * Topbar with center search3 — https://app.subframe.com/6b5c53cba769/library?component=Topbar+with+center+search3_2cf578a5-28e7-4c6a-9cae-fd7f815e3509
 * Topbar with center search2 — https://app.subframe.com/6b5c53cba769/library?component=Topbar+with+center+search2_b7addef3-c5e9-4667-af46-c01b7b1bf439
 */

import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import * as SubframeUtils from "../utils";
import { TopbarWithCenterSearch3 } from "../components/TopbarWithCenterSearch3";
import { TextField } from "../components/TextField";
import { Button } from "../components/Button";
import { IconButton } from "../components/IconButton";
import { DropdownMenu } from "../components/DropdownMenu";
import * as SubframeCore from "@subframe/core";
import { FeatherSearch } from "@subframe/core";
import { FeatherMapPin } from "@subframe/core";
import { FeatherUser } from "@subframe/core";
import { FeatherShoppingCart } from "@subframe/core";
import { FeatherLocateFixed } from "@subframe/core";
import { FeatherMenu } from "@subframe/core";
import { FeatherX } from "@subframe/core";
import { FeatherEdit3 } from "@subframe/core";
import MobileNavMenu from "../../components/MobileNavMenu";
import LocationSearch from "../../components/LocationSearch";
import { type LocationData, formatLocationDisplay } from "../../services/locationService";

interface DefaultPageLayoutRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

const DefaultPageLayoutRoot = React.forwardRef<HTMLElement, DefaultPageLayoutRootProps>(function DefaultPageLayoutRoot(
  { children, className, ...otherProps }: DefaultPageLayoutRootProps,
  ref
) {
  const location = useLocation();
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const handleLocationSelect = (locationData: LocationData) => {
    setSelectedLocation(locationData);
    setShowLocationDropdown(false);
    console.log('Selected location in navbar:', locationData);
    
    // Store in localStorage for persistence
    localStorage.setItem('userLocation', JSON.stringify(locationData));
    
    // Here you could also update global state, trigger analytics, etc.
  };

  const handleLocationError = (error: string) => {
    console.warn('Location error in navbar:', error);
    // Could show a toast notification here
  };

  const handleRemoveLocation = () => {
    setSelectedLocation(null);
    localStorage.removeItem('userLocation');
    setShowLocationDropdown(false);
  };

  const handleEditLocation = () => {
    // Keep dropdown open for editing
    setShowLocationDropdown(true);
  };

  // Load saved location on mount
  React.useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        const locationData = JSON.parse(savedLocation);
        setSelectedLocation(locationData);
      } catch (error) {
        console.error('Error loading saved location:', error);
        localStorage.removeItem('userLocation');
      }
    }
  }, []);

  // Determine location button variant and icon color
  const getLocationButtonVariant = () => {
    if (selectedLocation?.isNWA) {
      return "destructive-primary"; // Fully red for service area
    }
    return "destructive-secondary"; // Light red for no location or outside service area
  };

  const getLocationButtonIcon = () => {
    return <FeatherMapPin className={selectedLocation?.isNWA ? "text-white" : "text-error-700"} />;
  };

  const getLocationDisplayText = () => {
    if (!selectedLocation) return null;
    
    if (selectedLocation.city && selectedLocation.state) {
      return `${selectedLocation.city}, ${selectedLocation.state}`;
    }
    
    if (selectedLocation.zipCode && selectedLocation.state) {
      return `${selectedLocation.zipCode}, ${selectedLocation.state}`;
    }
    
    return formatLocationDisplay(selectedLocation);
  };

  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex min-h-screen w-full flex-col items-center bg-default-background",
        className
      )}
      ref={ref as any}
      {...otherProps}
    >
      {/* Desktop Topbar - Only show on large screens (1280px+) */}
      <div className="hidden xl:block fixed-navbar w-full bg-default-background border-b border-neutral-border">
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
            <TextField
              className="h-auto grow shrink-0 basis-0"
              variant="filled"
              label=""
              helpText=""
              icon={<FeatherSearch />}
            >
              <TextField.Input
                placeholder="Search fresh local food..."
                value=""
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
              />
            </TextField>
          }
          rightSlot={
            <div className="flex items-center justify-end gap-2">
              {/* Location Button with Dropdown */}
              <SubframeCore.DropdownMenu.Root 
                open={showLocationDropdown} 
                onOpenChange={setShowLocationDropdown}
              >
                <SubframeCore.DropdownMenu.Trigger asChild={true}>
                  <div className="flex-shrink-0">
                    <Button
                      variant={getLocationButtonVariant()}
                      icon={getLocationButtonIcon()}
                      onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                      className="relative"
                    >
                      {selectedLocation?.isNWA ? (
                        <span className="hidden sm:inline ml-1 text-white font-medium">
                          {getLocationDisplayText()}
                        </span>
                      ) : selectedLocation ? (
                        <span className="hidden sm:inline ml-1 text-error-700 font-medium">
                          Outside Area
                        </span>
                      ) : null}
                    </Button>
                  </div>
                </SubframeCore.DropdownMenu.Trigger>
                <SubframeCore.DropdownMenu.Portal>
                  <SubframeCore.DropdownMenu.Content
                    side="bottom"
                    align="end"
                    sideOffset={8}
                    className="z-[200]"
                    asChild={true}
                  >
                    <DropdownMenu className="w-96">
                      <div className="p-4">
                        {/* Current Location Display */}
                        {selectedLocation && (
                          <div className="mb-4 p-3 bg-neutral-50 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <FeatherMapPin className="w-4 h-4 text-subtext-color" />
                                  <span className="text-body-bold font-body-bold text-default-font">
                                    Current Location
                                  </span>
                                </div>
                                <div className="text-body font-body text-default-font">
                                  {formatLocationDisplay(selectedLocation)}
                                </div>
                                <div className={`text-caption font-caption mt-1 ${
                                  selectedLocation.isNWA ? 'text-success-700' : 'text-error-700'
                                }`}>
                                  {selectedLocation.isNWA ? '✓ We deliver to this area' : '⚠ Outside our service area'}
                                </div>
                              </div>
                              <div className="flex gap-1 ml-2">
                                <IconButton
                                  variant="neutral-tertiary"
                                  size="small"
                                  icon={<FeatherEdit3 />}
                                  onClick={handleEditLocation}
                                  title="Edit location"
                                />
                                <IconButton
                                  variant="neutral-tertiary"
                                  size="small"
                                  icon={<FeatherX />}
                                  onClick={handleRemoveLocation}
                                  title="Remove location"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Location Search */}
                        <div className="space-y-3">
                          <div className="text-body-bold font-body-bold text-default-font">
                            {selectedLocation ? 'Change Location' : 'Set Your Location'}
                          </div>
                          <LocationSearch 
                            className="w-full"
                            onLocationSelect={handleLocationSelect}
                            onLocationError={handleLocationError}
                            placeholder="Enter your address or zip code..."
                            showValidation={true}
                          />
                          <div className="text-caption font-caption text-subtext-color">
                            We currently serve the Northwest Arkansas metro area including Fayetteville, Rogers, Bentonville, and Springdale.
                          </div>
                        </div>
                      </div>
                    </DropdownMenu>
                  </SubframeCore.DropdownMenu.Content>
                </SubframeCore.DropdownMenu.Portal>
              </SubframeCore.DropdownMenu.Root>

              <div className="flex-shrink-0">
                <Button
                  variant="brand-secondary"
                  icon={<FeatherUser />}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                >
                  Sign In
                </Button>
              </div>
              <div className="flex-shrink-0">
                <Button
                  icon={<FeatherShoppingCart />}
                  onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                >
                  Cart
                </Button>
              </div>
            </div>
          }
        />
      </div>

      {/* Mobile/Tablet Topbar - Show for all screens below 1280px */}
      <div className="xl:hidden fixed-navbar w-full bg-default-background border-b border-neutral-border z-[100]">
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
            <TextField
              className="h-auto grow shrink-0 basis-0"
              variant="filled"
              label=""
              helpText=""
              icon={<FeatherSearch />}
            >
              <TextField.Input
                placeholder="Search fresh local food..."
                value=""
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
              />
            </TextField>
          </div>

          {/* Right Actions */}
          <div className="flex items-center justify-end gap-2">
            {/* Mobile Location Button */}
            <SubframeCore.DropdownMenu.Root 
              open={showLocationDropdown} 
              onOpenChange={setShowLocationDropdown}
            >
              <SubframeCore.DropdownMenu.Trigger asChild={true}>
                <div className="flex-shrink-0">
                  <IconButton
                    variant={getLocationButtonVariant()}
                    icon={getLocationButtonIcon()}
                    onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                  />
                </div>
              </SubframeCore.DropdownMenu.Trigger>
              <SubframeCore.DropdownMenu.Portal>
                <SubframeCore.DropdownMenu.Content
                  side="bottom"
                  align="end"
                  sideOffset={8}
                  className="z-[200]"
                  asChild={true}
                >
                  <DropdownMenu className="w-80">
                    <div className="p-4">
                      {/* Current Location Display */}
                      {selectedLocation && (
                        <div className="mb-4 p-3 bg-neutral-50 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <FeatherMapPin className="w-4 h-4 text-subtext-color" />
                                <span className="text-body-bold font-body-bold text-default-font">
                                  Current Location
                                </span>
                              </div>
                              <div className="text-body font-body text-default-font">
                                {formatLocationDisplay(selectedLocation)}
                              </div>
                              <div className={`text-caption font-caption mt-1 ${
                                selectedLocation.isNWA ? 'text-success-700' : 'text-error-700'
                              }`}>
                                {selectedLocation.isNWA ? '✓ We deliver to this area' : '⚠ Outside our service area'}
                              </div>
                            </div>
                            <div className="flex gap-1 ml-2">
                              <IconButton
                                variant="neutral-tertiary"
                                size="small"
                                icon={<FeatherEdit3 />}
                                onClick={handleEditLocation}
                                title="Edit location"
                              />
                              <IconButton
                                variant="neutral-tertiary"
                                size="small"
                                icon={<FeatherX />}
                                onClick={handleRemoveLocation}
                                title="Remove location"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Location Search */}
                      <div className="space-y-3">
                        <div className="text-body-bold font-body-bold text-default-font">
                          {selectedLocation ? 'Change Location' : 'Set Your Location'}
                        </div>
                        <LocationSearch 
                          className="w-full"
                          onLocationSelect={handleLocationSelect}
                          onLocationError={handleLocationError}
                          placeholder="Enter your address or zip code..."
                          showValidation={true}
                        />
                        <div className="text-caption font-caption text-subtext-color">
                          We currently serve the Northwest Arkansas metro area.
                        </div>
                      </div>
                    </div>
                  </DropdownMenu>
                </SubframeCore.DropdownMenu.Content>
              </SubframeCore.DropdownMenu.Portal>
            </SubframeCore.DropdownMenu.Root>

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

      {/* Main Content - Use main-content class for proper spacing */}
      {children ? (
        <div className="main-content flex w-full flex-col items-start bg-default-background">
          {children}
        </div>
      ) : null}
    </div>
  );
});

export const DefaultPageLayout = DefaultPageLayoutRoot;