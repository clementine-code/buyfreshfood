"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { FeatherShoppingBag } from "@subframe/core";
import { FeatherArrowRight } from "@subframe/core";
import { FeatherHome } from "@subframe/core";
import { FeatherClock } from "@subframe/core";
import { FeatherHeart } from "@subframe/core";
import { FeatherLeaf } from "@subframe/core";
import { Button } from "@/ui/components/Button";
import LocationSearchField from "../components/LocationSearchField";
import Footer from "../components/Footer";

function Home() {
  const navigate = useNavigate();

  const handleShopClick = () => {
    // Always navigate to shop - let users browse regardless of location
    navigate('/shop');
  };

  const handleSellClick = () => {
    navigate('/sell');
  };

  return (
      <div className="flex w-full flex-col items-center justify-center gap-4 bg-default-background overflow-x-hidden min-h-screen">
        {/* Hero Section */}
        <div className="flex min-h-[576px] w-full flex-col items-center justify-center gap-12 overflow-hidden px-4 py-24 max-w-full relative mobile:px-4 mobile:py-16 mobile:min-h-[500px]">
          <div className="flex flex-col items-center justify-center gap-8 z-10">
            <div className="flex w-full max-w-[768px] flex-col items-start gap-4">
              <span className="w-full font-['Inter'] text-[48px] font-[700] leading-[48px] text-white text-center -tracking-[0.035em] mobile:font-['Inter'] mobile:text-[32px] mobile:font-[400] mobile:leading-[36px] mobile:tracking-normal">
                Fresh Local Food From Your Neighbors
              </span>
              <span className="w-full whitespace-pre-wrap font-['Inter'] text-[24px] font-[500] leading-[32px] text-white text-center -tracking-[0.025em] mobile:font-['Inter'] mobile:text-[18px] mobile:font-[400] mobile:leading-[24px] mobile:tracking-normal">
                {
                  "Connect with local farmers and gardeners for the freshest produce, eggs, and more - right in your neighborhood."
                }
              </span>
            </div>
            
            <div className="w-full max-w-[384px] flex flex-col gap-3">
              <LocationSearchField 
                className="w-full"
                placeholder="Enter your location to find fresh local food near you..."
                showValidation={true}
                autoFocus={false}
              />
            </div>
          </div>
          {/* Background Image - Full Coverage */}
          <img
            className="w-full h-full object-cover absolute inset-0"
            src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?ixlib=rb-4.0.3"
          />
          {/* Dark Overlay - Full Coverage */}
          <div className="w-full h-full bg-[#00000066] absolute inset-0" />
        </div>

        {/* Main Content */}
        <div className="flex w-full flex-col items-center gap-8 px-6 pt-6 pb-24 max-w-full mobile:px-4 mobile:pt-6 mobile:pb-24 bg-default-background">
          {/* Action Cards - Constrained to same max width as community section */}
          <div className="w-full max-w-[1280px] flex-wrap items-stretch justify-center gap-8 grid grid-cols-1 md:grid-cols-2">
            <div className="flex min-w-[288px] flex-col items-start gap-6 rounded-xl bg-neutral-200 px-8 py-8 mobile:px-6 mobile:py-8 h-full">
              <FeatherShoppingBag className="text-body font-body text-sunny-600" />
              <div className="flex w-full flex-col items-start gap-4 flex-grow">
                <span className="w-full font-['Inter'] text-[28px] font-[700] leading-[32px] text-default-font -tracking-[0.035em]">
                  Shop Local
                </span>
                <span className="w-full whitespace-pre-wrap font-['Inter'] text-[18px] font-[500] leading-[24px] text-subtext-color">
                  {
                    "Discover fresh produce, eggs, and more from your neighbors and local farmers."
                  }
                </span>
              </div>
              <Button
                className="h-8 w-full flex-none mobile:h-12 mobile:w-full mobile:flex-none mt-auto"
                icon={<FeatherArrowRight />}
                onClick={handleShopClick}
              >
                Start Shopping
              </Button>
            </div>
            <div className="flex min-w-[288px] flex-col items-start gap-6 rounded-xl bg-neutral-800 px-8 py-8 mobile:px-6 mobile:py-8 h-full">
              <FeatherHome className="text-body font-body text-white" />
              <div className="flex w-full flex-col items-start gap-4 flex-grow">
                <span className="w-full font-['Inter'] text-[28px] font-[700] leading-[32px] text-white -tracking-[0.035em]">
                  Sell Your Harvest
                </span>
                <span className="w-full whitespace-pre-wrap font-['Inter'] text-[18px] font-[500] leading-[24px] text-neutral-400">
                  {
                    "Turn your garden or farm into a thriving local business. Join our community of producers."
                  }
                </span>
              </div>
              <Button
                className="h-8 w-full flex-none mobile:h-12 mobile:w-full mobile:flex-none mt-auto"
                variant="destructive-primary"
                icon={<FeatherArrowRight />}
                onClick={handleSellClick}
              >
                Become a Seller
              </Button>
            </div>
          </div>

          {/* Community Section - Same max width as action cards */}
          <div className="flex w-full max-w-[1280px] flex-col items-center gap-6 rounded-xl bg-brand-100 px-6 py-6">
            <span className="text-heading-1 font-heading-1 text-default-font text-center mobile:font-['Inter'] mobile:text-[24px] mobile:font-[400] mobile:leading-[28px] mobile:tracking-normal">
              Built on Community, Not Supply Chains
            </span>
            <span className="max-w-[576px] text-body font-body text-subtext-color text-center">
              When you buy from local producers, you&#39;re supporting
              sustainable farming practices and getting superior quality food.
            </span>
            <div className="flex w-full items-start gap-8 px-12 mobile:flex-col mobile:flex-nowrap mobile:gap-8 mobile:px-4 mobile:py-0">
              <div className="flex grow shrink-0 basis-0 flex-col items-center gap-4">
                <div className="flex h-16 w-16 flex-none items-center justify-center gap-2 rounded-rounded-extra-large bg-sunny-400">
                  <FeatherClock className="text-heading-1 font-heading-1 text-white" />
                </div>
                <span className="text-heading-2 font-heading-2 text-default-font text-center">
                  Maximum Freshness
                </span>
                <span className="text-body font-body text-subtext-color text-center">
                  Food is often harvested the same day you receive it, unlike
                  store produce that can be weeks old.
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
                  Every purchase directly supports your neighbors and
                  strengthens your local community.
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
                  Reduce transportation emissions and packaging waste by buying
                  directly from local sources.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
  );
}

export default Home;