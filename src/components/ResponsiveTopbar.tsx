"use client";

import React from "react";
import { TopbarWithCenterSearch } from "@/ui/components/TopbarWithCenterSearch";
import { TextField } from "@/ui/components/TextField";
import { FeatherSearch } from "@subframe/core";
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
        {/* Mobile/Tablet: Logo + Hamburger Menu - Hidden on desktop */}
        <div className="flex lg:hidden items-center gap-3">
          <img
            className="h-5 flex-none object-cover"
            src="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4auk54aye.png"
            alt="Logo"
          />
          <button
            className="flex h-8 w-8 cursor-pointer items-center justify-center gap-2 rounded-md border-none bg-transparent hover:bg-neutral-100 active:bg-neutral-50"
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
          >
            <FeatherMenu className="text-heading-3 font-heading-3 text-neutral-700" />
          </button>
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
          className="h-auto w-full flex lg:hidden"
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
          <button 
            className="flex h-8 cursor-pointer items-center justify-center gap-2 rounded-md border-none bg-brand-50 hover:bg-brand-100 active:bg-brand-50 px-3"
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
          >
            <FeatherUser className="text-body font-body text-brand-700" />
            <span className="whitespace-nowrap text-body-bold font-body-bold text-brand-700">
              Sign In
            </span>
          </button>
          <button 
            className="flex h-8 cursor-pointer items-center justify-center gap-2 rounded-md border-none bg-brand-600 hover:bg-brand-500 active:bg-brand-600 px-3"
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
          >
            <FeatherShoppingCart className="text-body font-body text-white" />
            <span className="whitespace-nowrap text-body-bold font-body-bold text-white">
              Cart
            </span>
          </button>
        </div>
        {/* Mobile/Tablet: Icon Buttons Only - Hidden on desktop */}
        <div className="flex lg:hidden items-center gap-1">
          <button
            className="flex h-8 w-8 cursor-pointer items-center justify-center gap-2 rounded-md border-none bg-brand-50 hover:bg-brand-100 active:bg-brand-50"
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
          >
            <FeatherUser className="text-heading-3 font-heading-3 text-brand-700" />
          </button>
          <button
            className="flex h-8 w-8 cursor-pointer items-center justify-center gap-2 rounded-md border-none bg-brand-600 hover:bg-brand-500 active:bg-brand-600"
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
          >
            <FeatherShoppingCart className="text-heading-3 font-heading-3 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}