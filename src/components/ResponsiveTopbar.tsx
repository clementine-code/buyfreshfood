"use client";

import React from "react";
import { TopbarWithCenterSearch3 } from "@/ui/components/TopbarWithCenterSearch3";
import { TopbarWithCenterSearch2 } from "@/ui/components/TopbarWithCenterSearch2";
import { TextField } from "@/ui/components/TextField";
import { FeatherSearch } from "@subframe/core";
import { FeatherUser } from "@subframe/core";
import { FeatherShoppingCart } from "@subframe/core";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";

interface ResponsiveTopbarProps {
  className?: string;
}

export function ResponsiveTopbar({ className }: ResponsiveTopbarProps) {
  return (
    <>
      {/* Desktop Version - Hidden on mobile/tablet */}
      <div className="hidden lg:block w-full">
        <TopbarWithCenterSearch3
          leftSlot={
            <div className="flex items-center gap-6">
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
            </div>
          }
          centerSlot={
            <TextField
              className="h-auto w-full"
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
            <div className="flex items-center gap-2">
              <Button 
                variant="brand-secondary" 
                icon={<FeatherUser />}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              >
                Sign In
              </Button>
              <Button 
                icon={<FeatherShoppingCart />}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              >
                Cart
              </Button>
            </div>
          }
        />
      </div>

      {/* Tablet Version - Hidden on mobile and desktop */}
      <div className="hidden md:block lg:hidden w-full">
        <TopbarWithCenterSearch2
          mobile="tablet"
          centerSlot={
            <div className="flex items-center gap-4">
              <img
                className="h-5 flex-none object-cover"
                src="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4auk54aye.png"
                alt="Logo"
              />
              <TextField
                className="h-auto w-full"
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
            </div>
          }
          rightSlot={
            <div className="flex items-center gap-1">
              <IconButton
                variant="brand-secondary"
                icon={<FeatherUser />}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              />
              <IconButton
                variant="brand-primary"
                icon={<FeatherShoppingCart />}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              />
            </div>
          }
        />
      </div>

      {/* Phone Version - Hidden on tablet and desktop */}
      <div className="block md:hidden w-full">
        <TopbarWithCenterSearch2
          mobile="phone"
          centerSlot={
            <div className="flex items-center gap-3">
              <img
                className="h-5 flex-none object-cover"
                src="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4auk54aye.png"
                alt="Logo"
              />
              <TextField
                className="h-auto w-full"
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
            </div>
          }
          rightSlot={
            <div className="flex items-center gap-1">
              <IconButton
                variant="brand-secondary"
                icon={<FeatherUser />}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              />
              <IconButton
                variant="brand-primary"
                icon={<FeatherShoppingCart />}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              />
            </div>
          }
        />
      </div>
    </>
  );
}