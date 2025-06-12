"use client";
/*
 * Documentation:
 * Bold navbar — https://app.subframe.com/library?component=Bold+navbar_8be1b160-02db-4f5b-b7d6-f3c2c8ede9d6
 * Link Button — https://app.subframe.com/library?component=Link+Button_a4ee726a-774c-4091-8c49-55b659356024
 * Button — https://app.subframe.com/library?component=Button_3b777358-b86b-40af-9327-891efc6826fe
 */

import React from "react";
import * as SubframeUtils from "../utils";
import { LinkButton } from "./LinkButton";
import { Button } from "./Button";

interface NavItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  selected?: boolean;
  className?: string;
}

const NavItem = React.forwardRef<HTMLElement, NavItemProps>(function NavItem(
  { children, selected = false, className, ...otherProps }: NavItemProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/b8f2fb75 flex h-8 cursor-pointer flex-col items-center justify-center gap-4 rounded-full px-4",
        { "bg-brand-400": selected },
        className
      )}
      ref={ref as any}
      {...otherProps}
    >
      {children ? (
        <span
          className={SubframeUtils.twClassNames(
            "font-['Montserrat'] text-[15px] font-[600] leading-[20px] text-neutral-50 group-hover/b8f2fb75:text-neutral-300",
            { "text-neutral-0": selected }
          )}
        >
          {children}
        </span>
      ) : null}
    </div>
  );
});

interface BoldNavbarRootProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const BoldNavbarRoot = React.forwardRef<HTMLElement, BoldNavbarRootProps>(
  function BoldNavbarRoot(
    { className, ...otherProps }: BoldNavbarRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "flex w-full max-w-[1280px] flex-wrap items-center gap-4",
          className
        )}
        ref={ref as any}
        {...otherProps}
      >
        <div className="flex h-12 flex-col items-start justify-center gap-2 px-4">
          <img
            className="h-6 flex-none object-cover"
            src="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4auk54aye.png"
          />
        </div>
        <div className="flex min-w-[320px] grow shrink-0 basis-0 flex-wrap items-center gap-1">
          <NavItem selected={true}>Product</NavItem>
          <NavItem>Features</NavItem>
          <NavItem>About</NavItem>
        </div>
        <LinkButton>Pricing</LinkButton>
        <LinkButton>Help</LinkButton>
        <div className="flex items-center gap-2 px-2">
          <Button variant="brand-tertiary">Log in</Button>
          <Button>Sign up</Button>
        </div>
      </div>
    );
  }
);

export const BoldNavbar = Object.assign(BoldNavbarRoot, {
  NavItem,
});
