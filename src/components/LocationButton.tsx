"use client";

import React, { useState } from "react";
import { IconButton } from "@/ui/components/IconButton";
import { FeatherMapPin, FeatherLocate, FeatherX } from "@subframe/core";
import { useLocationContext } from "../contexts/LocationContext";

interface LocationButtonProps {
  className?: string;
}

export const LocationButton: React.FC<LocationButtonProps> = ({ className }) => {
  const { state, setLocation, clearLocation } = useLocationContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleLocationSave = async (location: string) => {
    try {
      await setLocation(location);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving location:', error);
    }
  };

  const handleClearLocation = () => {
    clearLocation();
    setIsDialogOpen(false);
  };

  return (
    <>
      {/* Map Pin Icon Button - changes color when location is set */}
      <IconButton
        icon={<FeatherMapPin />}
        onClick={() => setIsDialogOpen(true)}
        className={className}
        variant={state.location ? "brand-primary" : "neutral-primary"}
        title={state.location ? `Location: ${state.location}` : "Set your location"}
      />
      
      <LocationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleLocationSave}
        onClear={handleClearLocation}
        initialValue={state.location || ""}
        isLoading={state.isLoading}
      />
    </>
  );
};

// Location Dialog with suggestions
interface LocationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (location: string) => void;
  onClear: () => void;
  initialValue?: string;
  isLoading?: boolean;
}

const LocationDialog: React.FC<LocationDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  onClear,
  initialValue = "",
  isLoading: contextLoading = false
}) => {
  const [inputValue, setInputValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);

  // Mock suggestions - you can connect this to your locationService later
  const mockSuggestions = [
    "14 Drew Lane, Bella Vista, AR",
    "15 Drew Lane, Bella Vista, AR", 
    "16 Drew Lane, Bella Vista, AR",
    "Bella Vista, AR",
    "Centerton, AR",
    "Bentonville, AR",
    "Rogers, AR",
    "Fayetteville, AR"
  ];

  // Reset when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      setInputValue(initialValue);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [isOpen, initialValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Show suggestions when typing
    if (value.length >= 2) {
      const filtered = mockSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setSuggestions([]);
    setShowSuggestions(false);
    onSave(suggestion);
  };

  const handleSave = () => {
    if (!inputValue.trim()) return;
    onSave(inputValue.trim());
  };

  const handleDetectLocation = async () => {
    setIsDetecting(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;
      
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        const data = await response.json();
        
        if (data.city && data.principalSubdivision) {
          const detectedLocation = `${data.city}, ${data.principalSubdivision}`;
          setInputValue(detectedLocation);
          onSave(detectedLocation);
        } else {
          const coordLocation = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setInputValue(coordLocation);
          onSave(coordLocation);
        }
      } catch (geocodeError) {
        const coordLocation = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        setInputValue(coordLocation);
        onSave(coordLocation);
      }
      
    } catch (error) {
      console.error('Error detecting location:', error);
      alert('Unable to detect location. Please enter manually.');
    } finally {
      setIsDetecting(false);
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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const isLoading = contextLoading || isDetecting;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{ zIndex: 999999 }}
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Set Your Location</h2>
              <p className="text-sm text-gray-600 mt-1">Enter your location</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              disabled={isLoading}
              type="button"
            >
              <FeatherX className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Input with Suggestions */}
          <div className="flex flex-col gap-3">
            <div className="relative">
              <div className="flex items-center gap-2 px-3 py-3 border border-gray-200 rounded-md bg-gray-50 focus-within:border-green-500 focus-within:bg-white transition-colors">
                <FeatherMapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Enter your location to find fresh local food near you..."
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  autoFocus
                  className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-gray-400 disabled:cursor-not-allowed text-gray-900"
                />
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <div className="flex items-center gap-2">
                        <FeatherMapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-900">{suggestion}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDetecting ? (
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <FeatherLocate className="w-4 h-4 text-gray-600" />
              )}
              <span className="text-sm font-medium text-gray-700">
                {isDetecting ? 'Detecting...' : 'Use current location'}
              </span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-between">
            <div>
              {initialValue && (
                <button
                  type="button"
                  onClick={onClear}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear Location
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!inputValue.trim() || isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save Location'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationButton;