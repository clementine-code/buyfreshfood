"use client";

import React from "react";
import { TextField } from "@/ui/components/TextField";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { FeatherSearch, FeatherUser, FeatherShoppingCart, FeatherMenu } from "@subframe/core";

interface ResponsiveTopbarProps {
  className?: string;
}

export function ResponsiveTopbar({ className }: ResponsiveTopbarProps) {
  return (
    <div className="flex w-full items-center gap-4 bg-default-background px-6 py-6">
      {/* Left Section */}
      <div className="flex items-center gap-6">
        {/* Desktop: Logo + Navigation - Hidden on mobile/tablet */}
        <div className="hidden lg:flex items-center gap-6">
          <img
            className="h-6 flex-none object-cover"
            src="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4auk54aye.png"
            alt="Logo"
          />
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-8 cursor-pointer items-center justify-center gap-2 rounded-md px-3 py-1 bg-neutral-100">
              <span className="text-body-bold font-body-bold text-default-font">
                Home
              </span>
            </div>
            <div className="flex h-8 cursor-pointer items-center justify-center gap-2 rounded-md px-3 py-1 hover:bg-neutral-50">
              <span className="text-body-bold font-body-bold text-subtext-color">
                Shop
              </span>
            </div>
            <div className="flex h-8 cursor-pointer items-center justify-center gap-2 rounded-md px-3 py-1 hover:bg-neutral-50">
              <span className="text-body-bold font-body-bold text-subtext-color">
                Sell
              </span>
            </div>
          </div>
        </div>
        {/* Mobile/Tablet: Logo + Hamburger Menu - Hidden on desktop */}
        <div className="flex lg:hidden items-center gap-3">
          <img
            className="h-5 flex-none object-cover"
            src="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4auk54aye.png"
            alt="Logo"
          />
          <IconButton
            variant="neutral-tertiary"
            icon="FeatherMenu"
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
          />
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 flex items-center justify-center">
        {/* Desktop: Fixed width search */}
        <TextField
          className="h-auto w-96 flex-none hidden lg:block"
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
        {/* Mobile/Tablet: Full width search */}
        <TextField
          className="h-auto w-full max-w-none flex lg:hidden"
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
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Desktop: Full Buttons - Hidden on mobile/tablet */}
        <div className="hidden lg:flex items-center gap-2">
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
        </div>
        {/* Mobile/Tablet: Icon Buttons Only - Hidden on desktop */}
        <div className="flex lg:hidden items-center gap-1">
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
        </div>
      </div>
    </div>
  );
}