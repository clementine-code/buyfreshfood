"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { TextField } from "@/ui/components/TextField";
import { FeatherMapPin, FeatherLocate, FeatherAlertCircle, FeatherCheck } from "@subframe/core";
import { locationService, type LocationData, type LocationSuggestion, formatLocationDisplay, getLocationErrorMessage } from "../services/locationService";

interface LocationSearchProps {
  className?: string;
  onLocationSelect?: (location: LocationData) => void;
  onLocationError?: (error: string) => void;
  placeholder?: string;
  showValidation?: boolean;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ 
  className, 
  onLocationSelect,
  onLocationError,
  placeholder = "Enter your zip code to find fresh local food near you...",
  showValidation = true
}) => {
  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  const debounceRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);
  const isProcessingRef = useRef(false);

  // Memoized search function to prevent recreation on every render
  const searchLocations = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 3 || isProcessingRef.current) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    isProcessingRef.current = true;
    setIsLoading(true);
    
    try {
      const results = await locationService.getLocationSuggestions(query);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } catch (error) {
      console.error('Error searching locations:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
      isProcessingRef.current = false;
    }
  }, []);

  // Optimized input handler with immediate state update
  const handleLocationChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    
    // Update input value immediately for responsive typing
    setLocation(value);
    
    // Reset other states without blocking
    requestAnimationFrame(() => {
      setSelectedLocation(null);
      setValidationError(null);

      // Clear existing debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Only search if we have enough characters
      if (value.trim().length >= 3) {
        debounceRef.current = setTimeout(() => {
          searchLocations(value);
        }, 500); // Increased debounce time to reduce API calls
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    });
  }, [searchLocations]);

  const handleSuggestionClick = useCallback(async (suggestion: LocationSuggestion) => {
    if (isProcessingRef.current) return;
    
    setLocation(suggestion.description);
    setSuggestions([]);
    setShowSuggestions(false);
    
    isProcessingRef.current = true;
    setIsLoading(true);

    try {
      const locationData = await locationService.getLocationDetails(suggestion.place_id, suggestion.coordinates);
      
      if (locationData) {
        setSelectedLocation(locationData);
        
        const errorMessage = getLocationErrorMessage(locationData);
        if (errorMessage) {
          setValidationError(errorMessage);
          onLocationError?.(errorMessage);
        } else {
          setValidationError(null);
          onLocationSelect?.(locationData);
        }
      }
    } catch (error) {
      console.error('Error getting location details:', error);
      setValidationError('Unable to get location details. Please try again.');
    } finally {
      setIsLoading(false);
      isProcessingRef.current = false;
    }
  }, [onLocationSelect, onLocationError]);

  const handleCurrentLocationClick = useCallback(async () => {
    if (isProcessingRef.current) return;
    
    setIsGettingLocation(true);
    setValidationError(null);
    isProcessingRef.current = true;

    try {
      const locationData = await locationService.getCurrentLocation();
      
      if (locationData) {
        const displayText = formatLocationDisplay(locationData);
        setLocation(displayText);
        setSelectedLocation(locationData);
        
        const errorMessage = getLocationErrorMessage(locationData);
        if (errorMessage) {
          setValidationError(errorMessage);
          onLocationError?.(errorMessage);
        } else {
          setValidationError(null);
          onLocationSelect?.(locationData);
        }
      } else {
        setValidationError('Unable to get your current location. Please enter your location manually.');
        onLocationError?.('Unable to get your current location. Please enter your location manually.');
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      setValidationError('Location access denied. Please enter your location manually.');
      onLocationError?.('Location access denied. Please enter your location manually.');
    } finally {
      setIsGettingLocation(false);
      isProcessingRef.current = false;
    }
  }, [onLocationSelect, onLocationError]);

  const handleInputBlur = useCallback(() => {
    // Use a longer delay to ensure suggestion clicks work properly
    setTimeout(async () => {
      setShowSuggestions(false);
      
      // Only validate if we're not already processing and have input
      if (location && !selectedLocation && !isProcessingRef.current) {
        isProcessingRef.current = true;
        setIsLoading(true);
        
        try {
          const locationData = await locationService.validateLocationInput(location);
          
          if (locationData) {
            setSelectedLocation(locationData);
            setLocation(formatLocationDisplay(locationData));
            
            const errorMessage = getLocationErrorMessage(locationData);
            if (errorMessage) {
              setValidationError(errorMessage);
              onLocationError?.(errorMessage);
            } else {
              setValidationError(null);
              onLocationSelect?.(locationData);
            }
          } else {
            setValidationError('Unable to find this location. Please try a different address or zip code.');
            onLocationError?.('Unable to find this location. Please try a different address or zip code.');
          }
        } catch (error) {
          console.error('Error validating location:', error);
          setValidationError('Unable to validate location. Please try again.');
        } finally {
          setIsLoading(false);
          isProcessingRef.current = false;
        }
      }
    }, 300);
  }, [location, selectedLocation, onLocationSelect, onLocationError]);

  const handleInputFocus = useCallback(() => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  }, [suggestions.length]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      isProcessingRef.current = false;
    };
  }, []);

  // Memoized validation state to prevent unnecessary recalculations
  const validationState = useMemo(() => {
    if (!showValidation) return null;
    
    if (validationError) return 'error';
    if (selectedLocation && selectedLocation.isNWA) return 'success';
    return null;
  }, [showValidation, validationError, selectedLocation]);

  // Memoized validation icon to prevent recreation
  const validationIcon = useMemo(() => {
    if (!showValidation || !selectedLocation) return null;
    
    return selectedLocation.isNWA ? (
      <FeatherCheck className="w-4 h-4 text-success-600" />
    ) : (
      <FeatherAlertCircle className="w-4 h-4 text-error-600" />
    );
  }, [showValidation, selectedLocation]);

  return (
    <div className={`relative ${className}`}>
      <TextField
        className="h-auto w-full flex-none"
        variant="filled"
        label=""
        helpText={validationError || ""}
        error={validationState === 'error'}
        icon={<FeatherMapPin />}
        iconRight={
          <div className="flex items-center gap-1">
            {/* Validation indicator */}
            {validationIcon}
            
            {/* Current location button */}
            <button
              onClick={handleCurrentLocationClick}
              disabled={isGettingLocation || isLoading}
              className="flex items-center justify-center hover:bg-neutral-100 rounded p-1 transition-colors disabled:opacity-50"
              title="Use my current location"
              type="button"
            >
              <FeatherLocate className={`w-4 h-4 ${isGettingLocation ? 'animate-pulse' : ''}`} />
            </button>
          </div>
        }
      >
        <TextField.Input
          ref={inputRef}
          placeholder={placeholder}
          value={location}
          onChange={handleLocationChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          disabled={isLoading || isGettingLocation}
          autoComplete="off"
        />
      </TextField>

      {/* Location Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              className="w-full text-left px-3 py-2 hover:bg-neutral-50 border-b border-neutral-100 last:border-b-0 text-body font-body text-default-font"
              onClick={() => handleSuggestionClick(suggestion)}
              type="button"
            >
              <div className="flex items-center gap-2">
                <FeatherMapPin className="w-4 h-4 text-subtext-color flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{suggestion.main_text}</div>
                  {suggestion.secondary_text && (
                    <div className="text-sm text-subtext-color truncate">{suggestion.secondary_text}</div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Loading indicator */}
      {(isLoading || isGettingLocation) && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-md shadow-lg z-50 p-3">
          <div className="flex items-center gap-2 text-subtext-color">
            <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-body font-body">
              {isGettingLocation ? 'Getting your location...' : 'Searching...'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSearch;