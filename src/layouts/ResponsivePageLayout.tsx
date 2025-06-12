"use client";

import React from "react";
import { TopbarWithCenterSearch3 } from "@/ui/components/TopbarWithCenterSearch3";
import { TopbarWithCenterSearch2 } from "@/ui/components/TopbarWithCenterSearch2";
import { TextField } from "@/ui/components/TextField";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { FeatherSearch, FeatherUser, FeatherShoppingCart } from "@subframe/core";

interface ResponsivePageLayoutProps {
  children?: React.ReactNode;
  className?: string;
}

export function ResponsivePageLayout({ children, className }: ResponsivePageLayoutProps) {
  return (
    <div className="min-h-screen w-full flex flex-col bg-neutral-50">
      {/* Desktop Topbar */}
      <div className="hidden lg:block">
        <TopbarWithCenterSearch3
          leftSlot={
            <>
              <img
                className="h-6 flex-none object-cover"
                src="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4auk54aye.png"
                alt="Logo"
              />
              <div className="flex items-center gap-2">
                <TopbarWithCenterSearch3.NavItem selected={true}>
                  Home
                </TopbarWithCenterSearch3.NavItem>
                <TopbarWithCenterSearch3.NavItem>
                  Shop
                </TopbarWithCenterSearch3.NavItem>
                <TopbarWithCenterSearch3.NavItem>
                  Sell
                </TopbarWithCenterSearch3.NavItem>
              </div>
            </>
          }
          centerSlot={
            <TextField
              className="h-auto w-full flex-none"
              variant="filled"
              label=""
              helpText=""
              icon={<FeatherSearch />}
            >
              <TextField.Input 
                placeholder="Search for fresh local food..." 
                value=""
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
              />
            </TextField>
          }
          rightSlot={
            <>
              <Button 
                variant="brand-secondary" 
                icon="FeatherUser"
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              >
                Sign In
              </Button>
              <Button 
                icon="FeatherShoppingCart"
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              >
                Cart
              </Button>
            </>
          }
        />
      </div>

      {/* Tablet Topbar */}
      <div className="hidden md:block lg:hidden">
        <TopbarWithCenterSearch2
          mobile="tablet"
          centerSlot={
            <>
              <img
                className="h-5 flex-none object-cover"
                src="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4auk54aye.png"
                alt="Logo"
              />
              <TextField
                className="h-auto w-full max-w-none flex-1"
                variant="filled"
                label=""
                helpText=""
                icon={<FeatherSearch />}
              >
                <TextField.Input 
                  placeholder="Search for fresh local food..." 
                  value=""
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
                />
              </TextField>
            </>
          }
          rightSlot={
            <>
              <IconButton
                variant="brand-secondary"
                icon="FeatherUser"
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              />
              <IconButton
                variant="brand-primary"
                icon="FeatherShoppingCart"
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              />
            </>
          }
        />
      </div>

      {/* Mobile Topbar */}
      <div className="block md:hidden">
        <TopbarWithCenterSearch2
          mobile="phone"
          centerSlot={
            <>
              <img
                className="h-5 flex-none object-cover"
                src="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4auk54aye.png"
                alt="Logo"
              />
              <TextField
                className="h-auto w-full max-w-none flex-1"
                variant="filled"
                label=""
                helpText=""
                icon={<FeatherSearch />}
              >
                <TextField.Input 
                  placeholder="Search..." 
                  value=""
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
                />
              </TextField>
            </>
          }
          rightSlot={
            <>
              <IconButton
                variant="brand-secondary"
                icon="FeatherUser"
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              />
              <IconButton
                variant="brand-primary"
                icon="FeatherShoppingCart"
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              />
            </>
          }
        />
      </div>

      {children ? (
        <div className="flex w-full flex-1 flex-col items-start bg-default-background">
          {children}
        </div>
      ) : null}
    </div>
  );
}