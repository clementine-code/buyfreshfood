"use client";

import React from "react";
import { IconButton } from "@/ui/components/IconButton";
import { FeatherMapPin } from "@subframe/core";
import { useLocationContext } from "../contexts/LocationContext";

interface LocationButtonProps {
  className?: string;
  onClick?: () => void;
}

export const LocationButton: React.FC<LocationButtonProps> = ({ className, onClick }) => {
  const { state } = useLocationContext();

  const handleLocationClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <IconButton
      icon={<FeatherMapPin />}
      onClick={handleLocationClick}
      className={className}
      variant={state.location ? "neutral-secondary" : "neutral-primary"}
      title={state.location ? `Location: ${state.location}` : "Set your location"}
    />
  );
};

export default LocationButton;