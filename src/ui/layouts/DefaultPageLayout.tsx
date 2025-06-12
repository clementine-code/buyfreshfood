"use client";
/*
 * Documentation:
 * Default Page Layout — https://app.subframe.com/6b5c53cba769/library?component=Default+Page+Layout_a57b1c43-310a-493f-b807-8cc88e2452cf
 * Topbar with center search3 — https://app.subframe.com/6b5c53cba769/library?component=Topbar+with+center+search3_2cf578a5-28e7-4c6a-9cae-fd7f815e3509
 * Topbar with center search2 — https://app.subframe.com/6b5c53cba769/library?component=Topbar+with+center+search2_b7addef3-c5e9-4667-af46-c01b7b1bf439
 */

import React from "react";
import * as SubframeUtils from "../utils";
import { TopbarWithCenterSearch3 } from "../components/TopbarWithCenterSearch3";
import { TopbarWithCenterSearch2 } from "../components/TopbarWithCenterSearch2";
import { TextField } from "../components/TextField";
import { Button } from "../components/Button";
import { IconButton } from "../components/IconButton";
import { FeatherMapPin } from "@subframe/core";
import { FeatherShoppingCart } from "@subframe/core";

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
        "flex h-screen w-full flex-col items-center",
        className
      )}
      ref={ref as any}
      {...otherProps}
    >
      {/* Desktop Topbar */}
      <div className="hidden md:block w-full">
        <TopbarWithCenterSearch3
          className="py-3"
          leftSlot={
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <img
                  className="h-5 w-5 flex-none object-cover"
                  src="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4auk54aye.png"
                />
              </div>
              <div className="flex items-center gap-4">
                <TopbarWithCenterSearch3.NavItem>Home</TopbarWithCenterSearch3.NavItem>
                <TopbarWithCenterSearch3.NavItem>Shop</TopbarWithCenterSearch3.NavItem>
                <TopbarWithCenterSearch3.NavItem>Sell</TopbarWithCenterSearch3.NavItem>
              </div>
            </div>
          }
          centerSlot={
            <TextField
              className="h-auto w-full max-w-[384px] flex-none"
              variant="filled"
              label=""
              helpText=""
              icon={<FeatherMapPin />}
            >
              <TextField.Input
                placeholder="Search for fresh local food..."
                value=""
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
              />
            </TextField>
          }
          rightSlot={
            <div className="flex items-center gap-2">
              <IconButton
                variant="neutral-tertiary"
                icon={<FeatherMapPin />}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              />
              <Button variant="neutral-secondary" size="medium">
                Sign In
              </Button>
              <IconButton
                variant="brand-primary"
                icon={<FeatherShoppingCart />}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              />
            </div>
          }
        />
      </div>

      {/* Tablet Topbar */}
      <div className="hidden sm:block md:hidden w-full">
        <TopbarWithCenterSearch2
          className="py-3"
          mobile="tablet"
          centerSlot={
            <TextField
              className="h-auto w-full max-w-[320px] flex-none"
              variant="filled"
              label=""
              helpText=""
              icon={<FeatherMapPin />}
            >
              <TextField.Input
                placeholder="Search for fresh local food..."
                value=""
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
              />
            </TextField>
          }
          rightSlot={
            <div className="flex items-center gap-2">
              <IconButton
                variant="neutral-tertiary"
                icon={<FeatherMapPin />}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              />
              <Button variant="neutral-secondary" size="small">
                Sign In
              </Button>
              <IconButton
                variant="brand-primary"
                icon={<FeatherShoppingCart />}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              />
            </div>
          }
        />
      </div>

      {/* Mobile Topbar */}
      <div className="block sm:hidden w-full">
        <TopbarWithCenterSearch2
          className="py-3"
          mobile="phone"
          centerSlot={
            <TextField
              className="h-auto w-full max-w-[240px] flex-none"
              variant="filled"
              label=""
              helpText=""
              icon={<FeatherMapPin />}
            >
              <TextField.Input
                placeholder="Search for fresh local food..."
                value=""
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
              />
            </TextField>
          }
          rightSlot={
            <div className="flex items-center gap-2">
              <IconButton
                variant="neutral-tertiary"
                icon={<FeatherMapPin />}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              />
              <Button variant="neutral-secondary" size="small">
                Sign In
              </Button>
              <IconButton
                variant="brand-primary"
                icon={<FeatherShoppingCart />}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              />
            </div>
          }
        />
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