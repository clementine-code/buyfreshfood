"use client";

import React, { useState, useEffect } from "react";
import { TextField } from "@/ui/components/TextField";
import { Button } from "@/ui/components/Button";
import { Alert } from "@/ui/components/Alert";
import { FeatherMapPin, FeatherLocate } from "@subframe/core";
import { useLocationContext } from "../contexts/LocationContext";

interface LocationSearchFieldProps {
  className?: string;
  placeholder?: string;
  showValidation?: boolean;
  autoFocus?: boolean;
}

const LocationSearchField: React.FC<LocationSearchFieldProps> = ({
  className,
  placeholder = "Enter your location to find fresh local food near you...",
  showValidation = true,
  autoFocus = false,
}) => {
  const { state, setLocation, detectCurrentLocation, clearError } = useLocationContext();
  const [inputValue, setInputValue] = useState("");

  // Sync input value with context state
  useEffect(() => {
    setInputValue(state.location || "");
  }, [state.location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || state.isLoading) return;

    await setLocation(inputValue.trim());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Clear error when user starts typing
    if (state.error) {
      clearError();
    }
  };

  const handleDetectLocation = async () => {
    if (state.isLoading) return;
    await detectCurrentLocation();
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <TextField
          className="flex-1"
          variant="filled"
          icon={<FeatherMapPin />}
          disabled={state.isLoading}
        >
          <TextField.Input
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInputChange}
            autoFocus={autoFocus}
          />
        </TextField>
        
        <Button
          type="button"
          variant="neutral-secondary"
          icon={<FeatherLocate />}
          onClick={handleDetectLocation}
          disabled={state.isLoading}
          loading={state.isLoading}
          className="flex-shrink-0"
          title="Use current location"
        />
      </form>

      {/* Validation feedback */}
      {showValidation && state.isSet && !state.error && (
        <Alert
          variant={state.isNWA ? "success" : "warning"}
          title={state.isNWA ? "Great! We serve your area" : "Coming soon to your area"}
          description={
            state.isNWA
              ? `Fresh local food is available in ${state.city || 'your area'}.`
              : "We're expanding! Join our waitlist to be notified when we launch in your location."
          }
        />
      )}

      {/* Error feedback */}
      {showValidation && state.error && (
        <Alert
          variant="error"
          title="Location not found"
          description={state.error}
        />
      )}
    </div>
  );
};

export default LocationSearchField;