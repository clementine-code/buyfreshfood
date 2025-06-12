"use client";

import React from "react";
import { TopbarWithCenterSearch } from "@/ui/components/TopbarWithCenterSearch";
import { TextField } from "@/ui/components/TextField";
import { FeatherSearch } from "@subframe/core";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { FeatherUser } from "@subframe/core";
import { FeatherShoppingCart } from "@subframe/core";
import { FeatherMenu } from "@subframe/core";

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
        </div>
        {/* Mobile/Tablet: Only Hamburger Menu - Hidden on desktop */}
        <div className="flex lg:hidden">
          <IconButton
            variant="neutral-tertiary"
            icon={<FeatherMenu />}
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
        {/* Mobile/Tablet: Icon Buttons Only - Hidden on desktop */}
        <div className="flex lg:hidden items-center gap-1">
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
      </div>
    </div>
  );
}