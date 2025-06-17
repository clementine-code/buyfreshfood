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
import MobileNavMenu from "../../components/MobileNavMenu";
import LocationSearch from "../../components/LocationSearch";

interface DefaultPageLayoutRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

const DefaultPageLayoutRoot = React.forwardRef<
  HTMLElement,
  DefaultPageLayoutRootProps
>(function DefaultPageLayoutRoot(
  { children, className, ...otherProps }: DefaultPageLayoutRootProps,
  ref
) {
  const location = useLocation();
  const [showMobileNav, setShowMobileNav] = useState(false);

  const handleLocationSelect = (selectedLocation: string) => {
    console.log('Selected location:', selectedLocation);
    // Here you could update global state, localStorage, or trigger a search
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
      <div className="hidden xl:block w-full fixed top-0 z-50 bg-default-background border-b border-neutral-border h-[73px]">
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
                <TopbarWithCenterSearch3.NavItem>
                  Sell
                </TopbarWithCenterSearch3.NavItem>
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
              <SubframeCore.DropdownMenu.Root>
                <SubframeCore.DropdownMenu.Trigger asChild={true}>
                  <div className="flex-shrink-0">
                    <Button
                      variant="destructive-secondary"
                      icon={<FeatherMapPin />}
                      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
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
                    <DropdownMenu>
                      <LocationSearch 
                        className="w-80"
                        onLocationSelect={handleLocationSelect}
                      />
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
      <div className="xl:hidden w-full fixed top-0 z-[100] bg-default-background border-b border-neutral-border h-[73px]">
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
            <SubframeCore.DropdownMenu.Root>
              <SubframeCore.DropdownMenu.Trigger asChild={true}>
                <div className="flex-shrink-0">
                  <Button
                    variant="destructive-secondary"
                    icon={<FeatherMapPin />}
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
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
                  <DropdownMenu>
                    <LocationSearch 
                      className="w-72"
                      onLocationSelect={handleLocationSelect}
                    />
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

      {/* Main Content - Add top padding to account for fixed navbar */}
      {children ? (
        <div className="flex w-full flex-col items-start bg-default-background pt-[73px]">
          {children}
        </div>
      ) : null}
    </div>
  );
});

export const DefaultPageLayout = DefaultPageLayoutRoot;