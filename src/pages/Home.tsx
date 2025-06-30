"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { FeatherCarrot } from "@subframe/core";
import { FeatherShoppingBag } from "@subframe/core";
import { FeatherArrowRight } from "@subframe/core";
import { FeatherHome } from "@subframe/core";
import { FeatherClock } from "@subframe/core";
import { FeatherHeart } from "@subframe/core";
import { FeatherLeaf } from "@subframe/core";
import { IconButton } from "@/ui/components/IconButton";
import { FeatherFacebook } from "@subframe/core";
import { FeatherInstagram } from "@subframe/core";
import { FeatherXTwitter } from "@subframe/core";
import { FeatherSlack } from "@subframe/core";
import { useLocationContext } from "../contexts/LocationContext";
import { useWaitlistContext } from "../contexts/WaitlistContext";

function Home() {
  const navigate = useNavigate();
  const { state: locationState } = useLocationContext();
  const { openWaitlistFlow } = useWaitlistContext();

  const handleShopClick = () => {
    navigate('/shop');
  };

  const handleSellClick = () => {
    navigate('/sell');
  };

  const handleJoinWaitlistClick = async () => {
    // Track user behavior (you can implement analytics later)
    console.log('🎯 User clicked join waitlist from hero');
    
    // Open waitlist flow with location collection in modal
    await openWaitlistFlow('geographic', undefined, { collectLocationInModal: true });
  };

  return (
    <DefaultPageLayout>
      {/* FIXED: Negative margin to eliminate gap from DefaultPageLayout */}
      <div className="flex w-full flex-col items-center justify-center bg-default-background overflow-x-hidden -mt-20">
        
       {/* Hero Section - FIXED mobile overlay issue */}
<div className="flex min-h-[576px] w-full flex-col items-center justify-center gap-12 overflow-hidden px-4 pt-20 pb-24 max-w-full relative mobile:px-4 mobile:pt-24 mobile:pb-16 mobile:min-h-[500px]">
  <div className="flex flex-col items-center justify-center gap-8 px-6 py-6 z-10">
    <Badge>Welcome to BuyFresh.Food!</Badge>
    <div className="flex w-full max-w-[768px] flex-col items-start gap-4 rounded-md bg-[#edfcefcc] px-6 py-6 shadow-sm mobile:px-4 mobile:py-4 mobile:max-w-[90%]">
      <span className="w-full font-['Inter'] text-[48px] font-[700] leading-[48px] text-default-font text-center -tracking-[0.035em] mobile:font-['Inter'] mobile:text-[28px] mobile:font-[400] mobile:leading-[32px] mobile:tracking-normal">
        Fresh Local Food From Your Neighbors
      </span>
      <span className="w-full whitespace-pre-wrap font-['Inter'] text-[24px] font-[500] leading-[32px] text-default-font text-center -tracking-[0.025em] mobile:font-['Inter'] mobile:text-[16px] mobile:font-[400] mobile:leading-[22px] mobile:tracking-normal">
        Connect with local farmers and gardeners for the freshest produce, eggs, and more - right in your neighborhood.
      </span>
    </div>
    
    {/* Updated Button Layout - Side by Side on Desktop, Stacked on Mobile */}
    <div className="flex flex-col md:flex-row items-center gap-4 w-full max-w-[600px] mobile:max-w-[280px]">
      <Button
        size="large"
        icon={<FeatherCarrot />}
        onClick={handleShopClick}
        className="w-full md:flex-1 h-12"
      >
        Shop For Fresh Local Food
      </Button>
      
      <Button
        variant="brand-secondary"
        size="large"
        icon={<FeatherHeart />}
        onClick={handleJoinWaitlistClick}
        className="w-full md:flex-1 h-12"
      >
        Join our Waitlist
      </Button>
    </div>
  </div>
  
  {/* Background Image - FIXED positioning */}
  <img
    className="w-full h-full object-cover absolute inset-0 mobile:object-center"
    src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-4.0.3"
    alt="Fresh vegetables background"
  />
  
  {/* Dark Overlay - FIXED for mobile */}
  <div className="w-full h-full bg-[#00000066] absolute inset-0 mobile:bg-[#00000055]" />
</div>

        {/* Main Content */}
        <div className="flex w-full flex-col items-center gap-8 px-4 pt-6 pb-24 max-w-full mobile:px-4 mobile:pt-6 mobile:pb-24">
          
          {/* FIXED: Action Cards - Better mobile responsive design */}
          <div className="w-full max-w-[1024px] flex flex-col gap-6 mobile:gap-4 md:grid md:grid-cols-2 md:gap-8">
            <div className="flex flex-col items-start gap-6 rounded-xl bg-neutral-200 px-6 py-6 mobile:px-4 mobile:py-4">
              <div className="flex w-full flex-col items-start gap-4">
                <div className="flex w-full items-center gap-2">
                  <FeatherShoppingBag className="text-body font-body text-default-font" />
                  <span className="grow shrink-0 basis-0 font-['Inter'] text-[28px] font-[700] leading-[32px] text-default-font -tracking-[0.035em] mobile:text-[24px] mobile:leading-[28px]">
                    Shop Local
                  </span>
                </div>
                <span className="w-full whitespace-pre-wrap font-['Inter'] text-[18px] font-[500] leading-[24px] text-subtext-color mobile:text-[16px] mobile:leading-[22px]">
                  Discover fresh produce, eggs, and more from your neighbors and local farmers.
                </span>
              </div>
              <Button
                className="h-12 w-full flex-none"
                icon={<FeatherArrowRight />}
                onClick={handleShopClick}
              >
                Start Shopping
              </Button>
            </div>
            
            <div className="flex flex-col items-start gap-6 rounded-xl bg-neutral-800 px-6 py-6 mobile:px-4 mobile:py-4">
              <div className="flex w-full flex-col items-start gap-4">
                <div className="flex w-full items-center gap-2">
                  <FeatherHome className="text-body font-body text-white" />
                  <span className="grow shrink-0 basis-0 font-['Inter'] text-[28px] font-[700] leading-[32px] text-white -tracking-[0.035em] mobile:text-[24px] mobile:leading-[28px]">
                    Sell Your Harvest
                  </span>
                </div>
                <span className="w-full whitespace-pre-wrap font-['Inter'] text-[18px] font-[500] leading-[24px] text-neutral-400 mobile:text-[16px] mobile:leading-[22px]">
                  Turn your garden or farm into a thriving local business. Join our community of producers.
                </span>
              </div>
              <Button
                className="h-12 w-full flex-none"
                variant="destructive-primary"
                icon={<FeatherArrowRight />}
                onClick={handleSellClick}
              >
                Start Selling
              </Button>
            </div>
          </div>

          {/* Community Section */}
          <div className="flex w-full max-w-[1024px] flex-col items-center gap-6 rounded-xl bg-brand-200 px-6 py-6 mobile:px-4 mobile:py-4">
            <span className="text-heading-1 font-heading-1 text-default-font text-center mobile:font-['Inter'] mobile:text-[24px] mobile:font-[400] mobile:leading-[28px] mobile:tracking-normal">
              Built on Community, Not Supply Chains
            </span>
            <span className="max-w-[576px] text-body font-body text-subtext-color text-center mobile:text-[16px] mobile:leading-[22px]">
              When you buy from local producers, you're supporting sustainable farming practices and getting superior quality food.
            </span>
            <div className="flex w-full items-start gap-8 px-8 mobile:flex-col mobile:gap-6 mobile:px-0">
              <div className="flex grow shrink-0 basis-0 flex-col items-center gap-4">
                <div className="flex h-16 w-16 flex-none items-center justify-center gap-2 rounded-rounded-extra-large bg-sunny-400">
                  <FeatherClock className="text-heading-1 font-heading-1 text-white" />
                </div>
                <span className="text-heading-2 font-heading-2 text-default-font text-center mobile:text-[20px] mobile:leading-[24px]">
                  Maximum Freshness
                </span>
                <span className="text-body font-body text-subtext-color text-center mobile:text-[16px] mobile:leading-[22px]">
                  Food is often harvested the same day you receive it, unlike store produce that can be weeks old.
                </span>
              </div>
              <div className="flex grow shrink-0 basis-0 flex-col items-center gap-4">
                <div className="flex h-16 w-16 flex-none items-center justify-center gap-2 rounded-rounded-extra-large bg-peach-600">
                  <FeatherHeart className="text-heading-1 font-heading-1 text-white" />
                </div>
                <span className="text-heading-2 font-heading-2 text-default-font text-center mobile:text-[20px] mobile:leading-[24px]">
                  Support Local
                </span>
                <span className="text-body font-body text-subtext-color text-center mobile:text-[16px] mobile:leading-[22px]">
                  Every purchase directly supports your neighbors and strengthens your local community.
                </span>
              </div>
              <div className="flex grow shrink-0 basis-0 flex-col items-center gap-4">
                <div className="flex h-16 w-16 flex-none items-center justify-center gap-2 rounded-rounded-extra-large bg-brand-600">
                  <FeatherLeaf className="text-heading-1 font-heading-1 text-white" />
                </div>
                <span className="text-heading-2 font-heading-2 text-default-font text-center mobile:text-[20px] mobile:leading-[24px]">
                  Eco-Friendly
                </span>
                <span className="text-body font-body text-subtext-color text-center mobile:text-[16px] mobile:leading-[22px]">
                  Reduce transportation emissions and packaging waste by buying directly from local sources.
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex w-full flex-col items-center justify-center gap-6 border-t border-solid border-neutral-100 bg-default-background px-6 py-12 max-w-full mobile:px-4 mobile:py-8">
            <div className="flex w-full max-w-[1024px] flex-wrap items-start gap-6 mobile:flex-col mobile:gap-4">
              <div className="flex min-w-[320px] flex-col items-start gap-6 self-stretch mobile:items-center mobile:justify-start">
                <div className="flex w-full min-w-[320px] grow shrink-0 basis-0 items-start gap-4 mobile:items-center mobile:justify-center">
                  <img
                    className="h-5 w-5 flex-none object-cover"
                    src="/Buy-Fresh-Food-Logo.png"
                  />
                  <span className="grow shrink-0 basis-0 font-['Inter'] text-[14px] font-[500] leading-[20px] text-default-font -tracking-[0.01em]">
                    BuyFresh.Food
                  </span>
                </div>
                <div className="flex w-full items-center gap-2 mobile:justify-center">
                  <IconButton icon={<FeatherFacebook />} onClick={() => {}} />
                  <IconButton icon={<FeatherInstagram />} onClick={() => {}} />
                  <IconButton icon={<FeatherXTwitter />} onClick={() => {}} />
                  <IconButton icon={<FeatherSlack />} onClick={() => {}} />
                </div>
              </div>
              <div className="flex grow shrink-0 basis-0 flex-wrap items-start gap-4 self-stretch mobile:grid mobile:grid-cols-2 mobile:gap-6">
                <div className="flex min-w-[144px] grow shrink-0 basis-0 flex-col items-start gap-4">
                  <span className="w-full font-['Inter'] text-[14px] font-[500] leading-[20px] text-default-font -tracking-[0.01em]">
                    Product
                  </span>
                  <span className="font-['Inter'] text-[14px] font-[400] leading-[20px] text-subtext-color -tracking-[0.01em]">Features</span>
                  <span className="font-['Inter'] text-[14px] font-[400] leading-[20px] text-subtext-color -tracking-[0.01em]">Integrations</span>
                  <span className="font-['Inter'] text-[14px] font-[400] leading-[20px] text-subtext-color -tracking-[0.01em]">Pricing</span>
                </div>
                <div className="flex min-w-[144px] grow shrink-0 basis-0 flex-col items-start gap-4">
                  <span className="w-full font-['Inter'] text-[14px] font-[500] leading-[20px] text-default-font -tracking-[0.01em]">
                    Company
                  </span>
                  <span className="font-['Inter'] text-[14px] font-[400] leading-[20px] text-subtext-color -tracking-[0.01em]">About us</span>
                  <span className="font-['Inter'] text-[14px] font-[400] leading-[20px] text-subtext-color -tracking-[0.01em]">Blog</span>
                  <span className="font-['Inter'] text-[14px] font-[400] leading-[20px] text-subtext-color -tracking-[0.01em]">Careers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultPageLayout>
  );
}

export default Home;