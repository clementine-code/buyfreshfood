"use client";
/*
 * Documentation:
 * Default Page Layout — https://app.subframe.com/6b5c53cba769/library?component=Default+Page+Layout_a57b1c43-310a-493f-b807-8cc88e2452cf
 * Topbar with center search — https://app.subframe.com/6b5c53cba769/library?component=Topbar+with+center+search_3bd79561-0143-4651-931b-3b7260b0b798
 * Text Field — https://app.subframe.com/6b5c53cba769/library?component=Text+Field_be48ca43-f8e7-4c0e-8870-d219ea11abfe
 * Button — https://app.subframe.com/6b5c53cba769/library?component=Button_3b777358-b86b-40af-9327-891efc6826fe
 */

import React from "react";
import * as SubframeUtils from "../utils";
import { TopbarWithCenterSearch } from "../components/TopbarWithCenterSearch";
import { TextField } from "../components/TextField";
import { FeatherSearch } from "@subframe/core";
import { Button } from "../components/Button";
import { FeatherUser } from "@subframe/core";
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
        "flex h-screen w-full flex-col items-center bg-neutral-50",
        className
      )}
      ref={ref as any}
      {...otherProps}
    >
      <TopbarWithCenterSearch
        leftSlot={
          <>
            <img
              className="h-6 flex-none object-cover"
              src="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4auk54aye.png"
            />
            <div className="flex items-center justify-center gap-2">
              <TopbarWithCenterSearch.NavItem selected={true}>
                Home
              </TopbarWithCenterSearch.NavItem>
              <TopbarWithCenterSearch.NavItem>
                Shop
              </TopbarWithCenterSearch.NavItem>
              <TopbarWithCenterSearch.NavItem>
                Sell
              </TopbarWithCenterSearch.NavItem>
            </div>
          </>
        }
        centerSlot={
          <TextField
            className="h-auto w-96 flex-none"
            variant="filled"
            label=""
            helpText=""
            icon={<FeatherSearch />}
          >
            <TextField.Input placeholder="Search for fresh local food..." />
          </TextField>
        }
        rightSlot={
          <>
            <Button variant="brand-secondary" icon={<FeatherUser />}>
              Sign In
            </Button>
            <Button icon={<FeatherShoppingCart />}>Cart</Button>
          </>
        }
      />
      {children ? (
        <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-4 overflow-y-auto bg-default-background">
          {children}
        </div>
      ) : null}
    </div>
  );
});

export const DefaultPageLayout = DefaultPageLayoutRoot;
