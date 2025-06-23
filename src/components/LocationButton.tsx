"use client";

import React, { useState, useRef, useEffect } from "react";
import { IconButton } from "@/ui/components/IconButton";
import { FeatherMapPin } from "@subframe/core";
import { useLocation } from "../contexts/LocationContext";
import LocationDialog from "./LocationDialog";

interface LocationButtonProps {
  className?: string;
}

const LocationButton: React.FC<LocationButtonProps> = ({ className }) => {
  const location = useLocation();
  const [showDialog, setShowDialog] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout>();

  // Determine button variant and tooltip based on location state
  const getButtonVariant = () => {
    if (!location.isSet) return "neutral-tertiary";
    if (location.isNWA) return "brand-secondary";
    return "destructive-secondary"; // Out of region
  };

  const getTooltipText = () => {
    if (!location.isSet) return "Set your location";
    if (location.isNWA) return `${location.city || location.location} - We are live in this area. Shop now!`;
    return `${location.city || location.location} - Coming soon`;
  };

  const getIconColor = () => {
    if (!location.isSet) return "text-neutral-600";
    if (location.isNWA) return "text-brand-700";
    return "text-warning-700";
  };

  // Calculate tooltip position to avoid being cut off
  const calculateTooltipPosition = () => {
    if (!buttonRef.current || !tooltipRef.current) return {};

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    let position: React.CSSProperties = {};

    // Always position below the button for better UX
    position.top = buttonRect.bottom + 8;
    
    // Center horizontally, but adjust if it would overflow
    let leftPosition = buttonRect.left + buttonRect.width / 2;
    
    if (leftPosition - tooltipRect.width / 2 < 8) {
      // Too far left
      leftPosition = tooltipRect.width / 2 + 8;
    } else if (leftPosition + tooltipRect.width / 2 > viewportWidth - 8) {
      // Too far right
      leftPosition = viewportWidth - tooltipRect.width / 2 - 8;
    }

    position.left = leftPosition;
    position.transform = 'translateX(-50%)';

    // If tooltip would go below viewport, position above button
    if (position.top + tooltipRect.height > viewportHeight - 8) {
      position.top = buttonRect.top - tooltipRect.height - 8;
    }

    return position;
  };

  // Update tooltip position when shown
  useEffect(() => {
    if (showTooltip && tooltipRef.current && buttonRef.current) {
      const position = calculateTooltipPosition();
      Object.assign(tooltipRef.current.style, position);
    }
  }, [showTooltip]);

  const handleMouseEnter = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 100);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div className={`relative ${className}`}>
        <IconButton
          ref={buttonRef}
          variant={getButtonVariant()}
          icon={<FeatherMapPin className={getIconColor()} />}
          onClick={() => setShowDialog(true)}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="relative"
        />

        {/* Status indicator dot */}
        {location.isSet && (
          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
            location.isNWA ? 'bg-success-500' : 'bg-warning-500'
          }`} />
        )}

        {/* Improved Tooltip with proper arrow positioning */}
        {showTooltip && (
          <div
            ref={tooltipRef}
            className="fixed px-3 py-2 bg-neutral-800 text-white text-caption rounded-md shadow-lg pointer-events-none whitespace-nowrap transition-opacity duration-200"
            style={{ 
              zIndex: 9999,
              opacity: showTooltip ? 1 : 0,
            }}
          >
            {getTooltipText()}
            {/* Tooltip arrow pointing up towards button */}
            <div 
              className="absolute w-0 h-0 border-l-2 border-r-2 border-transparent border-b-4"
              style={{
                left: '50%',
                transform: 'translateX(-50%)',
                borderBottomColor: '#374151',
                top: '-4px',
              }}
            />
          </div>
        )}
      </div>

      <LocationDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
      />
    </>
  );
};

export default LocationButton;