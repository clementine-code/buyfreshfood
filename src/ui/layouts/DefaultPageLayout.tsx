"use client";
/*
 * Documentation:
 * Default Page Layout — https://app.subframe.com/6b5c53cba769/library?component=Default+Page+Layout_a57b1c43-310a-493f-b807-8cc88e2452cf
 * Text Field — https://app.subframe.com/6b5c53cba769/library?component=Text+Field_be48ca43-f8e7-4c0e-8870-d219ea11abfe
 * Dropdown Menu — https://app.subframe.com/6b5c53cba769/library?component=Dropdown+Menu_99951515-459b-4286-919e-a89e7549b43b
 * Button — https://app.subframe.com/6b5c53cba769/library?component=Button_3b777358-b86b-40af-9327-891efc6826fe
 * Topbar with center search3 — https://app.subframe.com/6b5c53cba769/library?component=Topbar+with+center+search3_2cf578a5-28e7-4c6a-9cae-fd7f815e3509
 */

import React from "react";
import * as SubframeUtils from "../utils";
import { TextField } from "../components/TextField";
import { FeatherLocateFixed } from "@subframe/core";
import { DropdownMenu } from "../components/DropdownMenu";
import * as SubframeCore from "@subframe/core";
import { Button } from "../components/Button";
import { FeatherMapPin } from "@subframe/core";
import { FeatherUser } from "@subframe/core";
import { FeatherShoppingCart } from "@subframe/core";
import { TopbarWithCenterSearch3 } from "../components/TopbarWithCenterSearch3";

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
      <TopbarWithCenterSearch3
        rightSlot={
          <>
            <SubframeCore.DropdownMenu.Root>
              <SubframeCore.DropdownMenu.Trigger asChild={true}>
                <Button
                  variant="destructive-secondary"
                  icon={<FeatherMapPin />}
                />
              </SubframeCore.DropdownMenu.Trigger>
              <SubframeCore.DropdownMenu.Portal>
                <SubframeCore.DropdownMenu.Content
                  side="bottom"
                  align="end"
                  sideOffset={4}
                  asChild={true}
                >
                  <DropdownMenu>
                    <TextField
                      className="h-auto w-44 flex-none"
                      variant="filled"
                      label=""
                      helpText=""
                      icon={<FeatherLocateFixed />}
                    >
                      <TextField.Input placeholder="Enter location" />
                    </TextField>
                  </DropdownMenu>
                </SubframeCore.DropdownMenu.Content>
              </SubframeCore.DropdownMenu.Portal>
            </SubframeCore.DropdownMenu.Root>
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
