"use client";

import React from "react";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { FeatherX, FeatherCheck, FeatherMapPin, FeatherClock, FeatherShoppingCart, FeatherUser } from "@subframe/core";
import { useWaitlistContext } from "../contexts/WaitlistContext";

interface ThankYouModalProps {
  isOpen: boolean;
  onClose: () => void;
  waitlistedLocation: string;
  onJoinDifferentLocation: () => void;
}

const ThankYouModal: React.FC<ThankYouModalProps> = ({
  isOpen,
  onClose,
  waitlistedLocation,
  onJoinDifferentLocation
}) => {
  const { state } = useWaitlistContext();
  
  if (!isOpen) return null;

  // Determine if this is a feature-specific context
  const isFeatureContext = state.featureContext === 'checkout' || state.featureContext === 'signin';
  const featureTitle = state.featureContext === 'checkout' ? 'Checkout' : 
                       state.featureContext === 'signin' ? 'Sign In' : '';

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-[9998]"
        onClick={onClose}
      />
      
      {/* Modal - FIXED: Added max-width and better mobile sizing */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] w-full max-w-md">
        <div 
          className="bg-white rounded-lg shadow-xl overflow-hidden mx-4 mobile:mx-2 mobile:max-w-[calc(100vw-16px)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-200">
            <h2 className="text-heading-2 font-heading-2 text-default-font">
              {isFeatureContext 
                ? `${featureTitle} Coming Soon!` 
                : "You're Already on the Waitlist!"}
            </h2>
            <IconButton
              variant="neutral-tertiary"
              icon={<FeatherX />}
              onClick={onClose}
            />
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 text-center">
            {/* Success Icon */}
            <div className="flex justify-center">
              <IconWithBackground 
                variant={isFeatureContext ? "warning" : "success"} 
                size="x-large" 
                icon={isFeatureContext ? <FeatherClock /> : <FeatherCheck />}
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <h3 className="text-heading-2 font-heading-2 text-default-font">
                {isFeatureContext 
                  ? "We're working on it!" 
                  : "Thank you for your interest!"}
              </h3>
              <p className="text-body font-body text-subtext-color">
                {isFeatureContext 
                  ? `${featureTitle} functionality is coming soon to your area. You're already on our waitlist!` 
                  : "You're already on the waitlist for buyfresh.food in your area."}
              </p>
            </div>

            {/* Feature-specific icon */}
            {isFeatureContext && (
              <div className="flex justify-center my-4">
                {state.featureContext === 'checkout' ? (
                  <FeatherShoppingCart className="w-12 h-12 text-brand-600" />
                ) : (
                  <FeatherUser className="w-12 h-12 text-brand-600" />
                )}
              </div>
            )}

            {/* Location Display - FIXED: Better mobile sizing */}
            <div className="bg-success-50 rounded-lg p-4">
              <div className="flex items-center gap-3 justify-center">
                <FeatherMapPin className="w-5 h-5 text-success-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-body-bold font-body-bold text-success-800">
                    Current Waitlist Location
                  </div>
                  <div className="text-body font-body text-success-700 break-words">
                    {waitlistedLocation}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <p className="text-caption font-caption text-subtext-color">
              {isFeatureContext 
                ? `We'll notify you as soon as ${state.featureContext === 'checkout' ? 'ordering' : 'accounts'} becomes available in your area.` 
                : "We'll notify you as soon as we launch in your area. You'll be among the first to access fresh local food!"}
            </p>
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-3 p-6 border-t border-neutral-200">
            <Button
              variant="brand-secondary"
              onClick={onJoinDifferentLocation}
              className="w-full"
            >
              Join Waitlist for Different Email or Location
            </Button>
            <Button
              variant="neutral-secondary"
              onClick={onClose}
              className="w-full"
            >
              Got it, thanks!
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ThankYouModal;