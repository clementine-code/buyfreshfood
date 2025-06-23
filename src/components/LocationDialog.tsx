"use client";

import React, { useState, useEffect, useRef } from "react";
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
  const [inputKey, setInputKey] = useState(0); // Force re-render of input
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Update input value when dialog opens or location changes
  useEffect(() => {
    if (isOpen) {
      setInputValue(state.location || "");
      clearError();
      setInputKey(prev => prev + 1); // Force input re-render
      
      // Focus input after a short delay to ensure it's rendered
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 100);
    }
  }, [isOpen, state.location, clearError]);

  // Handle clicks outside dialog
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        handleCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await setLocation(inputValue.trim());
      // Close dialog after successful location set (if no error)
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
      // Close dialog after successful detection (if no error)
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
    setInputKey(prev => prev + 1);
    onClose();
  };

  const handleCancel = () => {
    setInputValue(state.location || "");
    clearError();
    onClose();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    // Clear error when user starts typing
    if (state.error) {
      clearError();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div 
        ref={dialogRef}
        className="bg-white w-full max-w-md rounded-lg shadow-xl overflow-hidden"
        style={{ maxHeight: '90vh' }}
      >
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
        <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
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
              key={inputKey} // Force re-render to fix input issues
              label="Enter your location"
              icon={<FeatherMapPin />}
              placeholder="City, state, or zip code..."
              disabled={state.isLoading || isSubmitting}
            >
              <TextField.Input
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                autoComplete="off"
                spellCheck={false}
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
                disabled={state.isLoading || isSubmitting}
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
      </div>
    </div>
  );
};

export default LocationDialog;