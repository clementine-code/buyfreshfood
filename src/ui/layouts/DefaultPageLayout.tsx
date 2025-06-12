"use client";
/*
 * Documentation:
 * Default Page Layout — https://app.subframe.com/library?component=Default+Page+Layout_a57b1c43-310a-493f-b807-8cc88e2452cf
 * Bold navbar — https://app.subframe.com/library?component=Bold+navbar_8be1b160-02db-4f5b-b7d6-f3c2c8ede9d6
 * Icon Button — https://app.subframe.com/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 */

import React from "react";
import * as SubframeUtils from "../utils";
import { BoldNavbar } from "../components/BoldNavbar";
import { IconButton } from "../components/IconButton";

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
  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex h-screen w-full flex-col items-center mobile:h-auto mobile:w-auto mobile:flex-col mobile:flex-nowrap mobile:gap-0",
        className
      )}
      ref={ref as any}
      {...otherProps}
    >
      <div className="container max-w-none flex w-full items-center gap-2 bg-brand-800 py-2 mobile:flex-row mobile:flex-nowrap mobile:gap-2">
        <div className="flex grow shrink-0 basis-0 flex-wrap items-center gap-4 mobile:h-auto mobile:grow mobile:shrink-0 mobile:basis-0">
          <div className="flex h-12 flex-col items-start justify-center gap-2">
            <img
              className="h-9 flex-none object-cover"
              src="https://res.cloudinary.com/subframe/image/upload/v1741558373/uploads/6302/gyskqcu6olmgsosouzqc.png"
            />
          </div>
          <div className="flex min-w-[288px] grow shrink-0 basis-0 flex-wrap items-center gap-1">
            <BoldNavbar.NavItem selected={true}>Shop</BoldNavbar.NavItem>
            <BoldNavbar.NavItem>Sell</BoldNavbar.NavItem>
            <BoldNavbar.NavItem>About Us</BoldNavbar.NavItem>
            <BoldNavbar.NavItem>How It Works</BoldNavbar.NavItem>
          </div>
          <div className="flex items-center gap-2 px-2">
            <IconButton variant="brand-secondary" icon="FeatherUser" />
            <IconButton variant="brand-primary" icon="FeatherShoppingBag" />
          </div>
        </div>
      </div>
      {children ? (
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-4 overflow-y-auto bg-default-background">
          {children}
        </div>
      ) : null}
    </div>
  );
});

export const DefaultPageLayout = DefaultPageLayoutRoot;
