"use client";

import React from "react";
import { ResponsivePageLayout } from "./layouts/ResponsivePageLayout";
import { TextField } from "@/ui/components/TextField";
import { FeatherMapPin } from "@subframe/core";
import { FeatherLocate } from "@subframe/core";
import { FeatherShoppingBag } from "@subframe/core";
import { Button } from "@/ui/components/Button";
import { FeatherArrowRight } from "@subframe/core";
import { FeatherHome } from "@subframe/core";
import { FeatherClock } from "@subframe/core";
import { FeatherHeart } from "@subframe/core";
import { FeatherLeaf } from "@subframe/core";
import { IconButton } from "@/ui/components/IconButton";
import { FeatherTwitter } from "@subframe/core";
import { FeatherGithub } from "@subframe/core";
import { FeatherSlack } from "@subframe/core";
import { FeatherYoutube } from "@subframe/core";

function HomePage() {
  return (
    <ResponsivePageLayout>
      <div className="flex w-full flex-col items-center justify-center bg-default-background">
        {/* Hero Section - Full viewport height minus topbar */}
        <div className="flex min-h-[calc(100vh-80px)] w-full flex-col items-center justify-center gap-12 overflow-hidden px-4 py-12 relative md:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center gap-8 z-10 relative max-w-4xl mx-auto">
            <div className="flex w-full flex-col items-center gap-6">
              <span className="w-full font-['Inter'] text-[32px] md:text-[40px] lg:text-[56px] font-[700] leading-[36px] md:leading-[44px] lg:leading-[60px] text-white text-center -tracking-[0.035em]">
                Fresh Local Food From Your Neighbors
              </span>
              <span className="w-full whitespace-pre-wrap font-['Inter'] text-[18px] md:text-[20px] lg:text-[24px] font-[400] md:font-[500] lg:font-[500] leading-[24px] md:leading-[28px] lg:leading-[32px] text-white text-center -tracking-[0.025em] max-w-3xl">
                Connect with local farmers and gardeners for the freshest produce, eggs, and more - right in your neighborhood.
              </span>
            </div>
            <TextField
              className="h-auto w-full max-w-[320px] md:max-w-[400px] lg:max-w-[480px] flex-none"
              variant="filled"
              label=""
              helpText=""
              icon={<FeatherMapPin />}
              iconRight={<FeatherLocate />}
            >
              <TextField.Input
                placeholder="Enter your address to find fresh local food..."
                value=""
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {}}
              />
            </TextField>
          </div>
          {/* Background Image */}
          <img
            className="w-full h-full object-cover absolute inset-0"
            src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Fresh vegetables background"
          />
          {/* Dark Overlay */}
          <div className="flex w-full h-full flex-col items-start bg-black/50 absolute inset-0" />
        </div>

        {/* Content Section */}
        <div className="flex w-full flex-col items-center gap-8 px-4 md:px-6 lg:px-8 pt-12 pb-24">
          {/* Action Cards */}
          <div className="w-full max-w-[1280px] flex-wrap items-stretch justify-center gap-6 md:gap-8 grid grid-cols-1 md:grid-cols-2">
            <div className="flex min-w-[288px] grow shrink-0 basis-0 flex-col items-start gap-6 rounded-xl bg-neutral-200 px-6 md:px-8 py-8">
              <FeatherShoppingBag className="text-body font-body text-sunny-600" />
              <div className="flex w-full flex-col items-start gap-4">
                <span className="w-full font-['Inter'] text-[24px] md:text-[28px] font-[700] leading-[28px] md:leading-[32px] text-default-font -tracking-[0.035em]">
                  Shop Local
                </span>
                <span className="w-full whitespace-pre-wrap font-['Inter'] text-[16px] md:text-[18px] font-[500] leading-[22px] md:leading-[24px] text-subtext-color">
                  Discover fresh produce, eggs, and more from your neighbors and local farmers.
                </span>
              </div>
              <Button
                className="h-10 md:h-12 w-full flex-none mt-auto"
                icon={<FeatherArrowRight />}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              >
                Start Shopping
              </Button>
            </div>
            <div className="flex min-w-[288px] grow shrink-0 basis-0 flex-col items-start gap-6 rounded-xl bg-neutral-800 px-6 md:px-8 py-8">
              <FeatherHome className="text-body font-body text-white" />
              <div className="flex w-full flex-col items-start gap-4">
                <span className="w-full font-['Inter'] text-[24px] md:text-[28px] font-[700] leading-[28px] md:leading-[32px] text-white -tracking-[0.035em]">
                  Sell Your Harvest
                </span>
                <span className="w-full whitespace-pre-wrap font-['Inter'] text-[16px] md:text-[18px] font-[500] leading-[22px] md:leading-[24px] text-neutral-400">
                  Turn your garden or farm into a thriving local business. Join our community of producers.
                </span>
              </div>
              <Button
                className="h-10 md:h-12 w-full flex-none mt-auto"
                variant="destructive-primary"
                icon={<FeatherArrowRight />}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              >
                Become a Seller
              </Button>
            </div>
          </div>

          {/* Community Section */}
          <div className="flex w-full flex-col items-center gap-6 md:gap-8 rounded-xl bg-brand-100 px-6 md:px-8 py-8 md:py-12 max-w-[1280px]">
            <span className="text-[24px] md:text-[28px] lg:text-heading-1 font-[600] lg:font-heading-1 text-default-font text-center leading-[28px] md:leading-[32px] lg:leading-[36px]">
              Built on Community, Not Supply Chains
            </span>
            <span className="max-w-[576px] text-body font-body text-subtext-color text-center">
              When you buy from local producers, you're supporting sustainable farming practices and getting superior quality food.
            </span>
            <div className="flex w-full items-start gap-6 md:gap-8 px-0 md:px-8 lg:px-12 flex-col md:flex-row">
              <div className="flex grow shrink-0 basis-0 flex-col items-center gap-4">
                <div className="flex h-16 w-16 flex-none items-center justify-center gap-2 rounded-rounded-extra-large bg-sunny-400">
                  <FeatherClock className="text-heading-1 font-heading-1 text-white" />
                </div>
                <span className="text-heading-2 font-heading-2 text-default-font text-center">
                  Maximum Freshness
                </span>
                <span className="text-body font-body text-subtext-color text-center">
                  Food is often harvested the same day you receive it, unlike store produce that can be weeks old.
                </span>
              </div>
              <div className="flex grow shrink-0 basis-0 flex-col items-center gap-4">
                <div className="flex h-16 w-16 flex-none items-center justify-center gap-2 rounded-rounded-extra-large bg-peach-600">
                  <FeatherHeart className="text-heading-1 font-heading-1 text-white" />
                </div>
                <span className="text-heading-2 font-heading-2 text-default-font text-center">
                  Support Local
                </span>
                <span className="text-body font-body text-subtext-color text-center">
                  Every purchase directly supports your neighbors and strengthens your local community.
                </span>
              </div>
              <div className="flex grow shrink-0 basis-0 flex-col items-center gap-4">
                <div className="flex h-16 w-16 flex-none items-center justify-center gap-2 rounded-rounded-extra-large bg-brand-600">
                  <FeatherLeaf className="text-heading-1 font-heading-1 text-white" />
                </div>
                <span className="text-heading-2 font-heading-2 text-default-font text-center">
                  Eco-Friendly
                </span>
                <span className="text-body font-body text-subtext-color text-center">
                  Reduce transportation emissions and packaging waste by buying directly from local sources.
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex w-full flex-col items-center justify-center gap-6 border-t border-solid border-neutral-100 bg-default-background px-0 md:px-6 py-12 max-w-[1280px]">
            <div className="flex w-full flex-wrap items-start gap-6 flex-col md:flex-row">
              <div className="flex min-w-[320px] flex-col items-center md:items-start gap-6 self-stretch">
                <div className="flex w-full min-w-[320px] grow shrink-0 basis-0 items-center md:items-start gap-4 justify-center md:justify-start">
                  <img
                    className="h-5 w-5 flex-none object-cover"
                    src="https://res.cloudinary.com/subframe/image/upload/v1711417507/shared/y2rsnhq3mex4auk54aye.png"
                    alt="Logo"
                  />
                  <span className="grow shrink-0 basis-0 font-['Inter'] text-[14px] font-[500] leading-[20px] text-default-font -tracking-[0.01em]">
                    Subframe
                  </span>
                </div>
                <div className="flex w-full items-center gap-2 justify-center md:justify-start">
                  <IconButton
                    icon={<FeatherTwitter />}
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  />
                  <IconButton
                    icon={<FeatherGithub />}
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  />
                  <IconButton
                    icon={<FeatherSlack />}
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  />
                  <IconButton
                    icon={<FeatherYoutube />}
                    onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
                  />
                </div>
              </div>
              <div className="flex grow shrink-0 basis-0 flex-wrap items-start gap-4 self-stretch grid grid-cols-2 md:flex md:flex-row">
                <div className="flex min-w-[144px] grow shrink-0 basis-0 flex-col items-start gap-4">
                  <span className="w-full font-['Inter'] text-[14px] font-[500] leading-[20px] text-default-font -tracking-[0.01em]">
                    Product
                  </span>
                  <span className="font-['Inter'] text-[14px] font-[400] leading-[20px] text-subtext-color -tracking-[0.01em]">
                    Features
                  </span>
                  <span className="font-['Inter'] text-[14px] font-[400] leading-[20px] text-subtext-color -tracking-[0.01em]">
                    Integrations
                  </span>
                  <span className="font-['Inter'] text-[14px] font-[400] leading-[20px] text-subtext-color -tracking-[0.01em]">
                    Pricing
                  </span>
                </div>
                <div className="flex min-w-[144px] grow shrink-0 basis-0 flex-col items-start gap-4">
                  <span className="w-full font-['Inter'] text-[14px] font-[500] leading-[20px] text-default-font -tracking-[0.01em]">
                    Company
                  </span>
                  <span className="font-['Inter'] text-[14px] font-[400] leading-[20px] text-subtext-color -tracking-[0.01em]">
                    About us
                  </span>
                  <span className="font-['Inter'] text-[14px] font-[400] leading-[20px] text-subtext-color -tracking-[0.01em]">
                    Blog
                  </span>
                  <span className="font-['Inter'] text-[14px] font-[400] leading-[20px] text-subtext-color -tracking-[0.01em]">
                    Careers
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ResponsivePageLayout>
  );
}

export default HomePage;