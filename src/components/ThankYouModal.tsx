"use client";

import React from "react";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { FeatherX, FeatherCheck, FeatherMapPin } from "@subframe/core";

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
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-[9998]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] w-full max-w-md mx-4">
        <div 
          className="bg-white rounded-lg shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-200">
            <h2 className="text-heading-2 font-heading-2 text-default-font">
              You're Already on the Waitlist!
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
                variant="success" 
                size="x-large" 
                icon={<FeatherCheck />}
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <h3 className="text-heading-2 font-heading-2 text-default-font">
                Thank you for your interest!
              </h3>
              <p className="text-body font-body text-subtext-color">
                You're already on the waitlist for <strong>buyfresh.food</strong> in your area.
              </p>
            </div>

            {/* Location Display */}
            <div className="bg-success-50 rounded-lg p-4">
              <div className="flex items-center gap-3 justify-center">
                <FeatherMapPin className="w-5 h-5 text-success-600 flex-shrink-0" />
                <div>
                  <div className="text-body-bold font-body-bold text-success-800">
                    Current Waitlist Location
                  </div>
                  <div className="text-body font-body text-success-700">
                    {waitlistedLocation}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <p className="text-caption font-caption text-subtext-color">
              We'll notify you as soon as we launch in your area. You'll be among the first to access fresh local food!
            </p>
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-3 p-6 border-t border-neutral-200">
            <Button
              variant="brand-secondary"
              onClick={onJoinDifferentLocation}
              className="w-full"
            >
              Join Waitlist for Different Location
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