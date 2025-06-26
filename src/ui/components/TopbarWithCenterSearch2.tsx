"use client";

import React from "react";
import * as SubframeUtils from "../utils";
import { FeatherMenu } from "@subframe/core";

interface NavItemProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const NavItem = React.forwardRef<HTMLElement, NavItemProps>(function NavItem(
  {
    selected = false,
    icon = null,
    children,
    className,
    ...otherProps
  }: NavItemProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/249fe490 flex h-8 cursor-pointer items-center justify-center gap-2 rounded-md px-3 py-1 hover:bg-neutral-50 active:bg-neutral-100",
        {
          "bg-neutral-100 hover:bg-neutral-100 active:bg-neutral-50": selected,
        },
        className
      )}
      ref={ref as any}
      {...otherProps}
    >
      {icon ? (
        <div className={SubframeUtils.twClassNames(
          "text-heading-3 font-heading-3 text-subtext-color",
          { "text-default-font": selected }
        )}>
          {icon}
        </div>
      ) : null}
      {children ? (
        <span
          className={SubframeUtils.twClassNames(
            "text-body-bold font-body-bold text-subtext-color group-hover/249fe490:text-subtext-color",
            {
              "text-default-font group-hover/249fe490:text-default-font group-active/249fe490:text-default-font":
                selected,
            }
          )}
        >
          {children}
        </span>
      ) : null}
    </div>
  );
});

interface TopbarWithCenterSearch2RootProps extends React.HTMLAttributes<HTMLElement> {
  centerSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  mobile?: "default" | "phone" | "tablet";
  className?: string;
  onMenuClick?: () => void;
}

const TopbarWithCenterSearch2Root = React.forwardRef<
  HTMLElement,
  TopbarWithCenterSearch2RootProps
>(function TopbarWithCenterSearch2Root(
  {
    centerSlot,
    rightSlot,
    mobile = "default",
    className,
    onMenuClick,
    ...otherProps
  }: TopbarWithCenterSearch2RootProps,
  ref
) {
  return (
    <nav
      className={SubframeUtils.twClassNames(
        "group/b7addef3 flex w-full items-center gap-4 bg-default-background px-6 py-6",
        {
          "h-auto w-192": mobile === "tablet",
          "h-auto w-96": mobile === "phone",
        },
        className
      )}
      ref={ref as any}
      {...otherProps}
    >
      <button
        onClick={onMenuClick}
        className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-neutral-100 transition-colors"
      >
        <FeatherMenu className="w-5 h-5 text-default-font" />
      </button>
      
      {centerSlot ? (
        <div
          className={SubframeUtils.twClassNames(
            "flex grow shrink-0 basis-0 items-center justify-center gap-4",
            { "h-auto w-auto flex-none": mobile === "phone" }
          )}
        >
          {centerSlot}
        </div>
      ) : null}
      
      {rightSlot ? (
        <div className="flex items-center justify-end gap-2">{rightSlot}</div>
      ) : null}
    </nav>
  );
});

export const TopbarWithCenterSearch2 = Object.assign(
  TopbarWithCenterSearch2Root,
  {
    NavItem,
  }
);

// STEP 2: Update MobileNavMenu.tsx to include Sign In
// Add this to your MobileNavMenu.tsx (find the navigation links section and add):

// In MobileNavMenu.tsx, add this to the navigation section:
<Link to="/signin" onClick={onClose}>
  <div className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
    location.pathname === "/signin" 
      ? "bg-brand-100 text-brand-700" 
      : "hover:bg-neutral-50 text-default-font"
  }`}>
    <FeatherUser className="w-5 h-5" />
    <span className="text-body-bold font-body-bold">Sign In</span>
  </div>
</Link>

// STEP 3: Update DefaultPageLayout.tsx mobile section
// Replace the mobile topbar section with this:

{/* Mobile/Tablet Topbar - Show for all screens below 1280px */}
<div className="xl:hidden w-full" style={{position: 'fixed', top: '0', left: '0', right: '0', zIndex: 50}}>
  <TopbarWithCenterSearch2
    className="w-full bg-default-background border-b border-neutral-border"
    onMenuClick={() => setShowMobileNav(true)}
    centerSlot={
      <FoodSearchField
        className="h-auto grow shrink-0 basis-0"
        onItemSelect={handleFoodItemSelect}
        onSearchSubmit={handleFoodSearchSubmit}
        placeholder="Search fresh food..."
        showTrending={false}
      />
    }
    rightSlot={
      <>
        <LocationButton className="flex-shrink-0" />
        <IconButton
          variant="brand-primary"
          icon={<FeatherShoppingCart />}
          onClick={() => {}}
        />
      </>
    }
  />
</div>