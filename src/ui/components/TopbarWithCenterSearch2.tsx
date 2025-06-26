// FIXED TopbarWithCenterSearch2.tsx - Remove any Link references
// Replace the entire src/ui/components/TopbarWithCenterSearch2.tsx file with this:

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
        type="button"
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

// This component is now clean and only handles the layout structure
// No Link imports needed since navigation logic is handled in DefaultPageLayout