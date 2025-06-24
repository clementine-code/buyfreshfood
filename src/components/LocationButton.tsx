"use client";

import React, { useState } from "react";
import { Button } from "@/ui/components/Button";
import { Dialog } from "@/ui/components/Dialog";
import { FeatherMapPin, FeatherLocate, FeatherX } from "@subframe/core";

interface LocationButtonProps {
  currentLocation?: string;
  onLocationSave?: (location: string) => void;
  className?: string;
}

export const LocationButton: React.FC<LocationButtonProps> = ({
  currentLocation,
  onLocationSave,
  className
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleLocationSave = (location: string) => {
    if (onLocationSave) {
      onLocationSave(location);
    }
    setIsDialogOpen(false);
  };

  // If no location is set, show "Set Location" button
  if (!currentLocation) {
    return (
      <>
        <Button
          variant="filled"
          icon={<FeatherMapPin />}
          onClick={() => setIsDialogOpen(true)}
          className={className}
        >
          Set Your Location
        </Button>
        
        <SimpleLocationDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleLocationSave}
          initialValue=""
        />
      </>
    );
  }

  // If location is set, show current location with edit button
  return (
    <>
      <div className={`flex items-center gap-3 px-4 py-3 bg-white border border-brand-300 rounded-md ${className}`}>
        <FeatherMapPin className="w-5 h-5 text-brand-600 flex-shrink-0" />
        <span className="text-body font-body text-default-font flex-1 truncate">
          {currentLocation}
        </span>
        <Button
          variant="neutral-tertiary"
          size="small"
          onClick={() => setIsDialogOpen(true)}
          className="flex-shrink-0"
        >
          Change
        </Button>
      </div>
      
      <SimpleLocationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleLocationSave}
        initialValue={currentLocation}
      />
    </>
  );
};

// Simple Location Dialog Component - No complex state management
interface SimpleLocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (location: string) => void;
  initialValue?: string;
}

const SimpleLocationDialog: React.FC<SimpleLocationDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialValue = ""
}) => {
  // Simple local state - no external dependencies
  const [inputValue, setInputValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);

  // Reset when dialog opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setInputValue(initialValue);
    }
  }, [isOpen, initialValue]);

  const handleSave = () => {
    if (!inputValue.trim()) return;
    onSave(inputValue.trim());
  };

  const handleDetectLocation = async () => {
    setIsLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;
      // Simple coordinate display - you can enhance this later
      const locationString = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      setInputValue(locationString);
      
    } catch (error) {
      console.error('Error detecting location:', error);
      alert('Unable to detect location. Please enter manually.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <Dialog.Content>
        <div className="flex flex-col gap-6 p-6 w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-default-font">Set Your Location</h2>
              <p className="text-sm text-subtext-color mt-1">Enter your location</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-md transition-colors"
              disabled={isLoading}
            >
              <FeatherX className="w-5 h-5 text-subtext-color" />
            </button>
          </div>

          {/* Simple Input - No complex TextField component */}
          <div className="flex flex-col gap-3">
            <div className="relative">
              <div className="flex items-center gap-2 px-3 py-2 border border-neutral-200 rounded-md bg-neutral-50 focus-within:border-brand-500 focus-within:bg-white">
                <FeatherMapPin className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Enter your location to find fresh local food near you..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  autoFocus
                  className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-neutral-400"
                />
              </div>
            </div>

            <Button
              variant="neutral-secondary"
              icon={<FeatherLocate />}
              onClick={handleDetectLocation}
              disabled={isLoading}
              loading={isLoading}
              className="w-full"
            >
              Use current location
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="neutral-tertiary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!inputValue.trim() || isLoading}
              loading={isLoading}
            >
              Save Location
            </Button>
          </div>
        </div>
      </Dialog.Content>
    </Dialog>
  );
};

export default LocationButton;
