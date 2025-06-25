"use client";

import React from "react";
import { IconButton } from "@/ui/components/IconButton";
import { FeatherMapPin } from "@subframe/core";
import { useLocationContext } from "../contexts/LocationContext";
import { useWaitlistContext } from "../contexts/WaitlistContext";

interface LocationButtonProps {
  className?: string;
}

export const LocationButton: React.FC<LocationButtonProps> = ({ className }) => {
  const { state } = useLocationContext();
  const { openLocationModal } = useWaitlistContext();

  const handleLocationClick = () => {
    openLocationModal();
  };

  return (
    <IconButton
      icon={<FeatherMapPin />}
      onClick={handleLocationClick}
      className={className}
      variant={state.location ? "brand-primary" : "neutral-primary"}
      title={state.location ? `Location: ${state.location}` : "Set your location"}
    />
  );
};

export default LocationButton;