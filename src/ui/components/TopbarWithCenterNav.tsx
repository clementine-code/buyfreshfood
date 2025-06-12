"use client";
/*
 * Documentation:
 * Topbar with center nav — https://app.subframe.com/library?component=Topbar+with+center+nav_2d99c811-1412-432c-b923-b290dd513802
 * Icon Button — https://app.subframe.com/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 */

import React from "react";
import * as SubframeUtils from "../utils";
import * as SubframeCore from "@subframe/core";

interface NavItemProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  icon?: SubframeCore.IconName;
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
        "group/22025c18 flex cursor-pointer items-center justify-center gap-2 rounded-md px-2 py-1",
        className
      )}
      ref={ref as any}
      {...otherProps}
    >
      <SubframeCore.Icon
        className={SubframeUtils.twClassNames(
          "text-caption font-caption text-subtext-color group-hover/22025c18:text-default-font",
          {
            "text-default-font group-hover/22025c18:text-default-font":
              selected,
          }
        )}
        name={icon}
      />
      {children ? (
        <span
          className={SubframeUtils.twClassNames(
            "text-caption-bold font-caption-bold text-subtext-color group-hover/22025c18:text-default-font",
            { "text-default-font": selected }
          )}
        >
          {children}
        </span>
      ) : null}
    </div>
  );
});

interface TopbarWithCenterNavRootProps
  extends React.HTMLAttributes<HTMLElement> {
  leftSlot?: React.ReactNode;
  centerSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  className?: string;
}

const TopbarWithCenterNavRoot = React.forwardRef<
  HTMLElement,
  TopbarWithCenterNavRootProps
>(function TopbarWithCenterNavRoot(
  {
    leftSlot,
    centerSlot,
    rightSlot,
    className,
    ...otherProps
  }: TopbarWithCenterNavRootProps,
  ref
) {
  return (
    <nav
      className={SubframeUtils.twClassNames(
        "flex w-full items-center gap-4 bg-default-background px-4 py-4",
        className
      )}
      ref={ref as any}
      {...otherProps}
    >
      {leftSlot ? (
        <div className="flex grow shrink-0 basis-0 items-center gap-4">
          {leftSlot}
        </div>
      ) : null}
      {centerSlot ? (
        <div className="flex grow shrink-0 basis-0 items-center justify-center gap-2">
          {centerSlot}
        </div>
      ) : null}
      {rightSlot ? (
        <div className="flex grow shrink-0 basis-0 items-center justify-end gap-2">
          {rightSlot}
        </div>
      ) : null}
    </nav>
  );
});

export const TopbarWithCenterNav = Object.assign(TopbarWithCenterNavRoot, {
  NavItem,
});
