"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "@/ui/components/Dialog";
import { Button } from "@/ui/components/Button";
import { TextField } from "@/ui/components/TextField";
import { IconButton } from "@/ui/components/IconButton";
import { Alert } from "@/ui/components/Alert";
import { FeatherX, FeatherMapPin, FeatherLocate, FeatherCheck, FeatherAlertCircle } from "@subframe/core";
import { useLocationContext } from "../contexts/LocationContext";

interface LocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const LocationDialog: React.FC<LocationDialogProps> = ({ isOpen, onClose }) => {
  const { state, setLocation, clearLocation, detectCurrentLocation, clearError } = useLocationContext();
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update input value when dialog opens or location changes
  useEffect(() => {
    if (isOpen) {
      setInputValue(state.location || "");
      clearError();
    }
  }, [isOpen, state.location, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await setLocation(inputValue.trim());
      // Close dialog after successful location set
      if (!state.error) {
        onClose();
      }
    } catch (error) {
      console.error('Error setting location:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDetectLocation = async () => {
    if (state.isLoading) return;
    
    try {
      await detectCurrentLocation();
      // Close dialog after successful detection
      if (!state.error) {
        onClose();
      }
    } catch (error) {
      console.error('Error detecting location:', error);
    }
  };

  const handleClearLocation = () => {
    clearLocation();
    setInputValue("");
    onClose();
  };

  const handleCancel = () => {
    setInputValue(state.location || "");
    clearError();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <Dialog.Content className="w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-heading-2 font-heading-2 text-default-font">
            Set Your Location
          </h2>
          <IconButton
            variant="neutral-tertiary"
            icon={<FeatherX />}
            onClick={handleCancel}
          />
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Location Display */}
          {state.isSet && (
            <div className="p-4 bg-neutral-50 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {state.isNWA ? (
                    <FeatherCheck className="w-5 h-5 text-success-600" />
                  ) : (
                    <FeatherAlertCircle className="w-5 h-5 text-warning-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-body-bold font-body-bold text-default-font">
                    Current Location
                  </div>
                  <div className="text-body font-body text-subtext-color">
                    {state.location}
                  </div>
                  <div className="text-caption font-caption mt-1">
                    {state.isNWA ? (
                      <span className="text-success-700">✓ We deliver to your area</span>
                    ) : (
                      <span className="text-warning-700">⚠ Coming soon to your area</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {state.error && (
            <Alert
              variant="error"
              title="Location Error"
              description={state.error}
            />
          )}

          {/* Location Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              label="Enter your location"
              icon={<FeatherMapPin />}
              placeholder="City, state, or zip code..."
              disabled={state.isLoading || isSubmitting}
            >
              <TextField.Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                autoFocus
              />
            </TextField>

            {/* Use Current Location Button */}
            <Button
              type="button"
              variant="neutral-secondary"
              icon={<FeatherLocate />}
              onClick={handleDetectLocation}
              disabled={state.isLoading || isSubmitting}
              loading={state.isLoading}
              className="w-full"
            >
              {state.isLoading ? 'Detecting location...' : 'Use current location'}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-neutral-200">
          <div className="flex gap-2">
            {state.isSet && (
              <Button
                variant="neutral-tertiary"
                onClick={handleClearLocation}
              >
                Clear Location
              </Button>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="neutral-secondary"
              onClick={handleCancel}
              disabled={state.isLoading || isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!inputValue.trim() || state.isLoading || isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Location'}
            </Button>
          </div>
        </div>
      </Dialog.Content>
    </Dialog>
  );
};

export default LocationDialog;