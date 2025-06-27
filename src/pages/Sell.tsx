"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { FeatherArrowRight } from "@subframe/core";
import { FeatherClipboard } from "@subframe/core";
import { FeatherUsers } from "@subframe/core";
import { FeatherDollarSign } from "@subframe/core";
import Footer from "../components/Footer";
import { useLocationContext } from "../contexts/LocationContext";
import { useWaitlistContext } from "../contexts/WaitlistContext";

function Sell() {
  const navigate = useNavigate();
  const { state: locationState } = useLocationContext();
  const { openWaitlistFlow } = useWaitlistContext();

  const handleStartSellingClick = async () => {
    // Determine waitlist type based on location
    const waitlistType = locationState.isNWA ? 'early_access' : 'geographic';
    
    // Open waitlist flow with current location data
    await openWaitlistFlow(waitlistType, locationState.isSet ? {
      isNWA: locationState.isNWA,
      city: locationState.city || '',
      state: locationState.state || '',
      zipCode: locationState.zipCode || '',
      formattedAddress: locationState.location || ''
    } : undefined);
  };

  return (
      <div className="flex w-full flex-col items-center justify-center gap-4 bg-default-background overflow-x-hidden">
        {/* Hero Section */}
        <div className="flex w-full flex-wrap items-center justify-center gap-4 bg-neutral-800 px-4 py-14">
          <div className="flex grow shrink-0 basis-0 flex-col items-center justify-center gap-12 px-4 py-4">
            <div className="flex w-full max-w-[448px] flex-col items-start gap-6">
              <Badge variant="success">Sell Local</Badge>
              <div className="flex w-full flex-col items-start gap-4">
                <span className="w-full font-['Inter'] text-[48px] font-[700] leading-[48px] text-white -tracking-[0.035em] mobile:text-[32px] mobile:leading-[36px]">
                  Turn your harvest into a business
                </span>
                <span className="w-full whitespace-pre-wrap font-['Inter'] text-[24px] font-[500] leading-[32px] text-neutral-400 -tracking-[0.025em] mobile:text-[18px] mobile:leading-[24px]">
                  Connect directly with local food lovers and earn more for your produce.
                </span>
              </div>
              <Button
                className="h-12 w-auto flex-none mobile:w-full"
                size="large"
                icon={<FeatherArrowRight />}
                onClick={handleStartSellingClick}
              >
                Start Selling Today
              </Button>
            </div>
          </div>
          <div className="flex min-w-[320px] grow shrink-0 basis-0 flex-col items-center justify-center gap-2 self-stretch">
            <img
              className="flex-none rounded-lg w-full max-w-[500px] h-auto object-cover"
              src="https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=800"
              alt="Fresh vegetables and produce"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex w-full flex-col items-center gap-8 px-6 py-8 max-w-full mobile:px-4 mobile:pt-6 mobile:pb-24">
          {/* How It Works Section */}
          <div className="flex w-full max-w-[1280px] flex-col items-center gap-6 rounded-md border border-solid border-[#f0efedff] bg-peach-800 px-6 py-8 mobile:px-4 mobile:py-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="text-heading-1 font-heading-1 text-white mobile:text-[24px] mobile:leading-[28px]">
                Selling Is Simple
              </span>
              <span className="text-body font-body text-white max-w-[600px]">
                If you are a farmer, homesteader, gardener, or hobbyist, you've come to the right place to start making money.
              </span>
            </div>
            
            <div className="flex w-full items-start gap-8 px-12 mobile:flex-col mobile:flex-nowrap mobile:gap-6 mobile:px-0 mobile:py-0">
              <div className="flex grow shrink-0 basis-0 flex-col items-center gap-4 rounded-md bg-neutral-200 px-4 py-6 mobile:px-4 mobile:py-4">
                <div className="flex h-16 w-16 flex-none items-center justify-center gap-2 rounded-rounded-extra-large bg-brand-600">
                  <FeatherClipboard className="text-heading-1 font-heading-1 text-white" />
                </div>
                <span className="text-heading-2 font-heading-2 text-default-font text-center">
                  List Your Items
                </span>
                <span className="text-body font-body text-default-font text-center">
                  Create listings for your produce, eggs, or other local goods in minutes
                </span>
              </div>
              
              <div className="flex grow shrink-0 basis-0 flex-col items-center gap-4 rounded-md bg-neutral-200 px-4 py-6 mobile:px-4 mobile:py-4">
                <div className="flex h-16 w-16 flex-none items-center justify-center gap-2 rounded-rounded-extra-large bg-sunny-600">
                  <FeatherUsers className="text-heading-1 font-heading-1 text-white" />
                </div>
                <span className="text-heading-2 font-heading-2 text-default-font text-center">
                  Connect With Buyers
                </span>
                <span className="text-body font-body text-default-font text-center">
                  Local food enthusiasts will discover your products and place orders
                </span>
              </div>
              
              <div className="flex grow shrink-0 basis-0 flex-col items-center gap-4 rounded-md bg-neutral-200 px-4 py-6 mobile:px-4 mobile:py-4">
                <div className="flex h-16 w-16 flex-none items-center justify-center gap-2 rounded-rounded-extra-large bg-peach-600">
                  <FeatherDollarSign className="text-heading-1 font-heading-1 text-white" />
                </div>
                <span className="text-heading-2 font-heading-2 text-default-font text-center">
                  Earn More
                </span>
                <span className="text-body font-body text-default-font text-center">
                  Get paid better prices than wholesale while building customer relationships
                </span>
              </div>
            </div>
          </div>

          {/* Call to Action Section */}
          <div className="flex w-full max-w-[1280px] flex-col items-center gap-6 rounded-md border border-solid border-[#f0efedff] bg-sunny-200 px-6 py-8 mobile:px-4 mobile:py-6">
            <span className="text-heading-1 font-heading-1 text-default-font text-center mobile:text-[24px] mobile:leading-[28px]">
              Got fresh food?
            </span>
            <span className="text-body font-body text-default-font text-center max-w-[600px]">
              Join hundreds of local food producers already earning more by selling directly to their neighbors.
            </span>
            <Button
              className="h-12 w-auto flex-none mobile:w-full mobile:max-w-[300px]"
              size="large"
              icon={<FeatherArrowRight />}
              onClick={handleStartSellingClick}
            >
              Start Selling Today
            </Button>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
  );
}

export default Sell;