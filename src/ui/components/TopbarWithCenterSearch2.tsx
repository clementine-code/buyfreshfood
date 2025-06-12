"use client";
/*
 * Documentation:
 * Topbar with center search2 — https://app.subframe.com/6b5c53cba769/library?component=Topbar+with+center+search2_b7addef3-c5e9-4667-af46-c01b7b1bf439
 * Text Field — https://app.subframe.com/6b5c53cba769/library?component=Text+Field_be48ca43-f8e7-4c0e-8870-d219ea11abfe
 * Dropdown Menu — https://app.subframe.com/6b5c53cba769/library?component=Dropdown+Menu_99951515-459b-4286-919e-a89e7549b43b
 * Button — https://app.subframe.com/6b5c53cba769/library?component=Button_3b777358-b86b-40af-9327-891efc6826fe
 * Icon Button — https://app.subframe.com/6b5c53cba769/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 */

import React from "react";
import * as SubframeUtils from "../utils";
import { FeatherMenu } from "@subframe/core";
import { TextField } from "./TextField";
import { FeatherLocateFixed } from "@subframe/core";
import { DropdownMenu } from "./DropdownMenu";
import * as SubframeCore from "@subframe/core";

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
        <SubframeCore.IconWrapper
          className={SubframeUtils.twClassNames(
            "text-heading-3 font-heading-3 text-subtext-color",
            { "text-default-font": selected }
          )}
        >
          {icon}
        </SubframeCore.IconWrapper>
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

interface TopbarWithCenterSearch2RootProps
  extends React.HTMLAttributes<HTMLElement> {
  centerSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  mobile?: "default" | "phone" | "tablet";
  className?: string;
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
      <FeatherMenu className="text-body font-body text-default-font" />
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
