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
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching' | 'found' | 'not-found'>('idle');
  
  const debounceRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);
  const isProcessingRef = useRef(false);
  const lastSearchRef = useRef<string>("");
  const containerRef = useRef<HTMLDivElement>(null);
  const preventBlurRef = useRef(false);

  // Much more conservative search function - only trigger on pause in typing
  const searchLocations = useCallback(async (query: string) => {
    // Don't search if already processing, too short, or same as last search
    if (!query.trim() || query.length < 3 || isProcessingRef.current || lastSearchRef.current === query) {
      if (query.length < 3) {
        setSuggestions([]);
        setShowSuggestions(false);
        setSearchStatus('idle');
      }
      return;
    }

    // Only proceed if user has stopped typing for a bit
    lastSearchRef.current = query;
    isProcessingRef.current = true;
    setIsLoading(true);
    setSearchStatus('searching');
    
    try {
      const results = await locationService.getLocationSuggestions(query);
      
      // Only update if this is still the current search and input is focused
      if (lastSearchRef.current === query && document.activeElement === inputRef.current) {
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
        setSearchStatus(results.length > 0 ? 'found' : 'not-found');
        
        // If no suggestions found, try direct validation
        if (results.length === 0) {
          const directResult = await locationService.validateLocationInput(query);
          if (directResult) {
            const suggestion: LocationSuggestion = {
              place_id: 'direct_match',
              description: formatLocationDisplay(directResult),
              main_text: directResult.city || directResult.zipCode || query,
              secondary_text: `${directResult.state || 'Unknown'}, USA`,
              coordinates: directResult.latitude && directResult.longitude ? {
                lat: directResult.latitude,
                lng: directResult.longitude
              } : undefined
            };
            setSuggestions([suggestion]);
            setShowSuggestions(true);
            setSearchStatus('found');
          }
        }
      }
    } catch (error) {
      console.error('Error searching locations:', error);
      if (lastSearchRef.current === query) {
        setSuggestions([]);
        setShowSuggestions(false);
        setSearchStatus('not-found');
      }
    } finally {
      // Keep loading state visible briefly but don't interfere with input
      setTimeout(() => {
        if (lastSearchRef.current === query) {
          setIsLoading(false);
          isProcessingRef.current = false;
        }
      }, 200);
    }
  }, []);

  // Much more conservative input handler - longer debounce, no focus loss
  const handleLocationChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    
    // Update input value immediately - never lose this
    setLocation(value);
    
    // Reset validation states
    setSelectedLocation(null);
    setValidationError(null);
    setSearchStatus('idle');

    // Clear existing debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Much longer debounce - wait for user to stop typing
    if (value.trim().length >= 3) {
      debounceRef.current = setTimeout(() => {
        // Only search if input is still focused (user hasn't moved away)
        if (document.activeElement === inputRef.current) {
          searchLocations(value);
        }
      }, 800); // Increased from 300ms to 800ms
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      lastSearchRef.current = "";
      setSearchStatus('idle');
    }
  }, [searchLocations]);

  // Prevent any key from causing focus loss
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    // Don't interfere with normal typing at all
    if (event.key === 'Escape') {
      setShowSuggestions(false);
      return;
    }
    
    if (event.key === 'Enter' && suggestions.length > 0) {
      event.preventDefault();
      handleSuggestionClick(suggestions[0]);
      return;
    }
    
    // For all other keys, just let them work normally
  }, [suggestions]);

  const handleSuggestionClick = useCallback(async (suggestion: LocationSuggestion) => {
    if (isProcessingRef.current) return;
    
    // Prevent input blur during suggestion click
    preventBlurRef.current = true;
    
    setLocation(suggestion.description);
    setSuggestions([]);
    setShowSuggestions(false);
    lastSearchRef.current = suggestion.description;
    
    isProcessingRef.current = true;
    setIsLoading(true);
    setSearchStatus('searching');

    try {
      let locationData: LocationData | null = null;
      
      if (suggestion.place_id === 'direct_match') {
        locationData = await locationService.validateLocationInput(suggestion.main_text);
      } else {
        locationData = await locationService.getLocationDetails(suggestion.place_id, suggestion.coordinates);
      }
      
      if (locationData) {
        setSelectedLocation(locationData);
        setSearchStatus('found');
        
        const errorMessage = getLocationErrorMessage(locationData);
        if (errorMessage) {
          setValidationError(errorMessage);
          onLocationError?.(errorMessage);
        } else {
          setValidationError(null);
          onLocationSelect?.(locationData);
        }
      } else {
        setSearchStatus('not-found');
        setValidationError('Unable to get location details. Please try again.');
      }
    } catch (error) {
      console.error('Error getting location details:', error);
      setValidationError('Unable to get location details. Please try again.');
      setSearchStatus('not-found');
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        isProcessingRef.current = false;
        preventBlurRef.current = false;
        // Return focus to input
        inputRef.current?.focus();
      }, 200);
    }
  }, [onLocationSelect, onLocationError]);

  const handleCurrentLocationClick = useCallback(async () => {
    if (isProcessingRef.current) return;
    
    setIsGettingLocation(true);
    setValidationError(null);
    setSearchStatus('searching');
    isProcessingRef.current = true;

    try {
      const locationData = await locationService.getCurrentLocation();
      
      if (locationData) {
        const displayText = formatLocationDisplay(locationData);
        setLocation(displayText);
        setSelectedLocation(locationData);
        lastSearchRef.current = displayText;
        setSearchStatus('found');
        
        const errorMessage = getLocationErrorMessage(locationData);
        if (errorMessage) {
          setValidationError(errorMessage);
          onLocationError?.(errorMessage);
        } else {
          setValidationError(null);
          onLocationSelect?.(locationData);
        }
      } else {
        setSearchStatus('not-found');
        setValidationError('Unable to get your current location. Please enter your location manually.');
        onLocationError?.('Unable to get your current location. Please enter your location manually.');
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      setValidationError('Location access denied. Please enter your location manually.');
      onLocationError?.('Location access denied. Please enter your location manually.');
      setSearchStatus('not-found');
    } finally {
      setIsGettingLocation(false);
      isProcessingRef.current = false;
    }
  }, [onLocationSelect, onLocationError]);

  // Only show suggestions when input is focused and we have results
  const handleInputFocus = useCallback(() => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  }, [suggestions.length]);

  // Much more conservative blur handling - only hide if really moving away
  const handleInputBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    // Don't blur if we're preventing it (during suggestion click)
    if (preventBlurRef.current) {
      event.preventDefault();
      inputRef.current?.focus();
      return;
    }
    
    // Only hide suggestions after a delay and if focus really moved away
    setTimeout(() => {
      const activeElement = document.activeElement;
      const container = containerRef.current;
      
      // Only hide if focus moved completely outside our container
      if (container && !container.contains(activeElement)) {
        setShowSuggestions(false);
      }
    }, 200);
  }, []);

  // Handle clicks outside the component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      isProcessingRef.current = false;
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

  // Memoized loading message
  const loadingMessage = useMemo(() => {
    if (isGettingLocation) return 'Getting your location...';
    if (isLoading) {
      if (searchStatus === 'searching') return 'Searching locations...';
      return 'Loading...';
    }
    return null;
  }, [isLoading, isGettingLocation, searchStatus]);

  // Only show status message when appropriate and not interfering with input
  const showStatusMessage = (loadingMessage || searchStatus === 'not-found') && 
                           !showSuggestions && 
                           location.length >= 3 && 
                           document.activeElement !== inputRef.current;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
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
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[70]">
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
          onKeyDown={handleKeyDown}
          disabled={isLoading || isGettingLocation}
          autoComplete="off"
          spellCheck={false}
        />
      </TextField>

      {/* Location Suggestions Dropdown - Higher z-index */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-md shadow-lg z-[60] max-h-48 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.place_id || index}
              className="w-full text-left px-3 py-2 hover:bg-neutral-50 border-b border-neutral-100 last:border-b-0 text-body font-body text-default-font transition-colors"
              onClick={() => handleSuggestionClick(suggestion)}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent input blur
                preventBlurRef.current = true;
              }}
              onMouseUp={() => {
                // Reset prevention after click
                setTimeout(() => {
                  preventBlurRef.current = false;
                }, 100);
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

      {/* Status messages - Only show when not interfering with input */}
      {showStatusMessage && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-md shadow-lg z-[55] p-3">
          {loadingMessage && (
            <div className="flex items-center gap-2 text-subtext-color">
              <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-body font-body">{loadingMessage}</span>
            </div>
          )}
          
          {searchStatus === 'not-found' && !isLoading && (
            <div className="flex items-center gap-2 text-subtext-color">
              <FeatherAlertCircle className="w-4 h-4 text-warning-600" />
              <span className="text-body font-body">No locations found. Try a different search term.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;