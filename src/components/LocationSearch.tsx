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
  const lastSearchRef = useRef<string>("");
  const shouldMaintainFocusRef = useRef(false);

  // Improved search function with better error handling
  const searchLocations = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 3 || isProcessingRef.current || lastSearchRef.current === query) {
      if (query.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
      }
      return;
    }

    lastSearchRef.current = query;
    isProcessingRef.current = true;
    setIsLoading(true);
    
    try {
      const results = await locationService.getLocationSuggestions(query);
      
      // Only update if this is still the current search
      if (lastSearchRef.current === query) {
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
        
        // If no suggestions found, try direct validation
        if (results.length === 0) {
          const directResult = await locationService.validateLocationInput(query);
          if (directResult) {
            setSuggestions([{
              place_id: 'direct_match',
              description: formatLocationDisplay(directResult),
              main_text: directResult.city || directResult.zipCode || query,
              secondary_text: `${directResult.state || 'AR'}, USA`,
              coordinates: directResult.latitude && directResult.longitude ? {
                lat: directResult.latitude,
                lng: directResult.longitude
              } : undefined
            }]);
            setShowSuggestions(true);
          }
        }
      }
    } catch (error) {
      console.error('Error searching locations:', error);
      if (lastSearchRef.current === query) {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } finally {
      setIsLoading(false);
      isProcessingRef.current = false;
    }
  }, []);

  // Optimized input handler that maintains focus
  const handleLocationChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    
    // Update input value immediately without losing focus
    setLocation(value);
    
    // Reset validation states
    setSelectedLocation(null);
    setValidationError(null);
    
    // Maintain focus flag
    shouldMaintainFocusRef.current = true;

    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Only search if we have enough characters
    if (value.trim().length >= 3) {
      debounceRef.current = setTimeout(() => {
        searchLocations(value);
      }, 300); // Reduced debounce for better responsiveness
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      lastSearchRef.current = "";
    }
  }, [searchLocations]);

  const handleSuggestionClick = useCallback(async (suggestion: LocationSuggestion) => {
    if (isProcessingRef.current) return;
    
    setLocation(suggestion.description);
    setSuggestions([]);
    setShowSuggestions(false);
    lastSearchRef.current = suggestion.description;
    shouldMaintainFocusRef.current = false; // Don't maintain focus after selection
    
    isProcessingRef.current = true;
    setIsLoading(true);

    try {
      let locationData: LocationData | null = null;
      
      if (suggestion.place_id === 'direct_match') {
        // This is a direct validation result
        locationData = await locationService.validateLocationInput(suggestion.main_text);
      } else {
        // This is from the API
        locationData = await locationService.getLocationDetails(suggestion.place_id, suggestion.coordinates);
      }
      
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
    shouldMaintainFocusRef.current = false;

    try {
      const locationData = await locationService.getCurrentLocation();
      
      if (locationData) {
        const displayText = formatLocationDisplay(locationData);
        setLocation(displayText);
        setSelectedLocation(locationData);
        lastSearchRef.current = displayText;
        
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

  const handleInputBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    // Only hide suggestions if we're not maintaining focus
    if (!shouldMaintainFocusRef.current) {
      setTimeout(() => {
        setShowSuggestions(false);
      }, 150);
    }
  }, []);

  const handleInputFocus = useCallback(() => {
    shouldMaintainFocusRef.current = true;
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  }, [suggestions.length]);

  // Maintain focus after state updates
  useEffect(() => {
    if (shouldMaintainFocusRef.current && inputRef.current && document.activeElement !== inputRef.current) {
      const timeoutId = setTimeout(() => {
        if (inputRef.current && shouldMaintainFocusRef.current) {
          inputRef.current.focus();
        }
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
  }, [location, isLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      isProcessingRef.current = false;
      shouldMaintainFocusRef.current = false;
    };
  }, []);

  // Memoized validation state
  const validationState = useMemo(() => {
    if (!showValidation) return null;
    
    if (validationError) return 'error';
    if (selectedLocation && selectedLocation.isNWA) return 'success';
    return null;
  }, [showValidation, validationError, selectedLocation]);

  // Memoized validation icon
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
            
            {/* Current location button with tooltip */}
            <div className="relative group">
              <button
                onClick={handleCurrentLocationClick}
                disabled={isGettingLocation || isLoading}
                className="flex items-center justify-center hover:bg-neutral-100 rounded p-1 transition-colors disabled:opacity-50"
                type="button"
                title="Find exact location"
              >
                <FeatherLocate className={`w-4 h-4 ${isGettingLocation ? 'animate-pulse' : ''}`} />
              </button>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[60]">
                Find exact location
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-neutral-800"></div>
              </div>
            </div>
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
          spellCheck={false}
        />
      </TextField>

      {/* Location Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.place_id || index}
              className="w-full text-left px-3 py-2 hover:bg-neutral-50 border-b border-neutral-100 last:border-b-0 text-body font-body text-default-font transition-colors"
              onClick={() => handleSuggestionClick(suggestion)}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent input blur
                shouldMaintainFocusRef.current = false; // Allow blur after click
              }}
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