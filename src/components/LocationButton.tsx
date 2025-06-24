"use client";

import React, { useState } from "react";
import { IconButton } from "@/ui/components/IconButton";
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

  return (
    <>
      {/* Simple Map Pin Icon Button */}
      <IconButton
        icon={<FeatherMapPin />}
        onClick={() => setIsDialogOpen(true)}
        className={className}
        variant={currentLocation ? "brand-primary" : "neutral-primary"}
        title={currentLocation ? `Location: ${currentLocation}` : "Set your location"}
      />
      
      <SimpleLocationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleLocationSave}
        initialValue={currentLocation || ""}
      />
    </>
  );
};

// Simple Location Dialog Component
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
  const [inputValue, setInputValue] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);

  // Reset when dialog opens
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
      
      // Try to get a readable address using reverse geocoding
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        const data = await response.json();
        
        if (data.city && data.principalSubdivision) {
          setInputValue(`${data.city}, ${data.principalSubdivision}`);
        } else {
          setInputValue(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
      } catch (geocodeError) {
        // Fallback to coordinates if geocoding fails
        setInputValue(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      }
      
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
        <div className="flex flex-col gap-6 p-6 w-full max-w-md mx-auto">
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
              type="button"
            >
              <FeatherX className="w-5 h-5 text-subtext-color" />
            </button>
          </div>

          {/* Input */}
          <div className="flex flex-col gap-3">
            <div className="relative">
              <div className="flex items-center gap-2 px-3 py-3 border border-neutral-200 rounded-md bg-neutral-50 focus-within:border-brand-500 focus-within:bg-white transition-colors">
                <FeatherMapPin className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Enter your location to find fresh local food near you..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  autoFocus
                  className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-neutral-400 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <FeatherLocate className="w-4 h-4 text-neutral-600" />
              )}
              <span className="text-sm font-medium text-neutral-700">
                {isLoading ? 'Detecting...' : 'Use current location'}
              </span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!inputValue.trim() || isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Location'}
            </button>
          </div>
        </div>
      </Dialog.Content>
    </Dialog>
  );
};

// Default export
export default LocationButton;