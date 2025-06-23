"use client";

import React, { useState } from "react";
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

  // Determine button variant and tooltip based on location state
  const getButtonVariant = () => {
    if (!location.isSet) return "neutral-tertiary";
    if (location.isNWA) return "brand-secondary";
    return "destructive-secondary"; // Out of region
  };

  const getTooltipText = () => {
    if (!location.isSet) return "Set your location";
    if (location.isNWA) return `${location.city || location.location} - We deliver here!`;
    return `${location.city || location.location} - Coming soon`;
  };

  const getIconColor = () => {
    if (!location.isSet) return "text-neutral-600";
    if (location.isNWA) return "text-brand-700";
    return "text-warning-700";
  };

  return (
    <>
      <div className={`relative group ${className}`}>
        <IconButton
          variant={getButtonVariant()}
          icon={<FeatherMapPin className={getIconColor()} />}
          onClick={() => setShowDialog(true)}
          className="relative"
        />
        
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-800 text-white text-caption rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[100]">
          {getTooltipText()}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-neutral-800"></div>
        </div>

        {/* Status indicator dot */}
        {location.isSet && (
          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
            location.isNWA ? 'bg-success-500' : 'bg-warning-500'
          }`} />
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