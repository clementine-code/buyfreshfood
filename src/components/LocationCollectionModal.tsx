"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DialogLayout } from "@/ui/layouts/DialogLayout";
import { IconButton } from "@/ui/components/IconButton";
import { TextField } from "@/ui/components/TextField";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { 
  FeatherX, 
  FeatherMapPin, 
  FeatherLocate, 
  FeatherCheckCircle,
  FeatherClock,
  FeatherAlertCircle,
  FeatherPencil,
  FeatherTrash
} from "@subframe/core";
import { useLocationContext } from "../contexts/LocationContext";
import { useWaitlistContext } from "../contexts/WaitlistContext";
import { locationService, type LocationData, type LocationSuggestion } from "../services/locationService";

interface LocationCollectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: 'create' | 'edit';
  forWaitlist?: boolean;
  onConfirm?: (locationData: LocationData) => void;
}

const LocationCollectionModal: React.FC<LocationCollectionModalProps> = ({
  open,
  onOpenChange,
  mode = 'create',
  forWaitlist = false,
  onConfirm
}) => {
  // Get current location from context
  const { state: locationState, setLocationData, clearLocation } = useLocationContext();
  const { openWaitlistFlow } = useWaitlistContext();
  
  // State management
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [validatedLocation, setValidatedLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [modalState, setModalState] = useState<'empty' | 'loading' | 'launching' | 'coming-soon' | 'error' | 'saved' | 'editing'>('empty');
  const [previousLocationData, setPreviousLocationData] = useState<LocationData | null>(null);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Initialize form when modal opens
  useEffect(() => {
    if (open) {
      // Check if we have a saved location
      if (locationState.isSet && locationState.location) {
        // We have a saved location - show it in saved state
        setInputValue(locationState.location);
        const currentLocationData = {
          isNWA: locationState.isNWA,
          city: locationState.city || '',
          state: locationState.state || '',
          zipCode: locationState.zipCode || '',
          formattedAddress: locationState.location,
          latitude: locationState.coordinates?.lat,
          longitude: locationState.coordinates?.lng
        };
        setValidatedLocation(currentLocationData);
        setPreviousLocationData(currentLocationData);
        setModalState('saved');
      } else {
        // No saved location - start fresh
        setInputValue('');
        setValidatedLocation(null);
        setPreviousLocationData(null);
        setModalState('empty');
      }
      
      setError('');
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
      
      // Focus input after modal animation (only if not in saved state)
      if (!locationState.isSet) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    }
  }, [open, locationState]);

  // Enhanced error handling function
  const handleError = useCallback((error: any, context: string) => {
    console.error(`Error in ${context}:`, error);
    
    let errorMessage = 'An unexpected error occurred. Please try again.';
    
    // Handle different types of errors
    if (error?.message) {
      if (error.message.includes('Network') || error.message.includes('fetch')) {
        errorMessage = 'Network connection failed. Please check your internet connection and try again.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
      } else if (error.message.includes('Location access denied')) {
        errorMessage = 'Location access denied. Please enter your location manually.';
      } else if (error.message.includes('Unable to get location details')) {
        errorMessage = 'Unable to validate this location. Please try a different address.';
      } else if (error.message.includes('API configuration error')) {
        errorMessage = 'Location service temporarily unavailable. Please try again later.';
      } else {
        errorMessage = error.message;
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    setError(errorMessage);
    setModalState('error');
    setIsLoadingSuggestions(false);
    setIsValidating(false);
    setIsDetectingLocation(false);
  }, []);

  // Clear error when user starts typing
  const clearError = useCallback(() => {
    if (error) {
      setError('');
      if (modalState === 'error') {
        setModalState('empty');
      }
    }
  }, [error, modalState]);

  // Fetch location suggestions with error handling
  const fetchSuggestions = useCallback(async (input: string) => {
    if (input.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);
    clearError();
    
    try {
      const results = await locationService.getLocationSuggestions(input);
      setSuggestions(results || []);
      setShowSuggestions(results.length > 0);
    } catch (error) {
      handleError(error, 'fetching location suggestions');
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [handleError, clearError]);

  // Validate location from place ID with error handling
  const validateLocation = async (suggestion: LocationSuggestion) => {
    setIsValidating(true);
    setModalState('loading');
    clearError();
    
    try {
      let locationData: LocationData | null = null;
      
      if (suggestion.place_id === 'direct_match') {
        locationData = await locationService.validateLocationInput(suggestion.main_text);
      } else {
        locationData = await locationService.getLocationDetails(suggestion.place_id, suggestion.coordinates);
      }
      
      if (locationData) {
        setValidatedLocation(locationData);
        setShowSuggestions(false);
        
        // Set appropriate state based on location
        if (locationData.isNWA) {
          setModalState('launching');
        } else {
          setModalState('coming-soon');
        }
      } else {
        handleError(new Error('Unable to validate this location. Please try a different address.'), 'validating location');
      }
      
    } catch (error) {
      handleError(error, 'validating location');
    } finally {
      setIsValidating(false);
    }
  };

  // Detect current location with enhanced error handling
  const detectCurrentLocation = async () => {
    setIsDetectingLocation(true);
    setModalState('loading');
    clearError();
    
    try {
      const locationData = await locationService.getCurrentLocation();
      
      if (locationData) {
        const displayText = locationData.formattedAddress || `${locationData.city}, ${locationData.state}`;
        setInputValue(displayText);
        setValidatedLocation(locationData);
        setModalState(locationData.isNWA ? 'launching' : 'coming-soon');
      } else {
        handleError(new Error('Unable to determine your location. Please enter your location manually.'), 'detecting current location');
      }
    } catch (error) {
      handleError(error, 'detecting current location');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Event handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setValidatedLocation(null);
    clearError(); // Clear error when user starts typing
    setSelectedIndex(-1);
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    if (value.trim()) {
      setShowSuggestions(true);
      debounceTimerRef.current = setTimeout(() => {
        fetchSuggestions(value.trim());
      }, 300);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
      if (modalState !== 'error') {
        setModalState('empty');
      }
    }
  };

  const handleInputFocus = () => {
    if (inputValue.trim() && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    // Don't blur if clicking on a suggestion
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget && suggestionsRef.current?.contains(relatedTarget)) {
      return;
    }
    
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % suggestions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev <= 0 ? suggestions.length - 1 : prev - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          const suggestion = suggestions[selectedIndex];
          setInputValue(suggestion.description);
          validateLocation(suggestion);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    setInputValue(suggestion.description);
    validateLocation(suggestion);
  };

  // NEW: Check if location market has changed
  const hasLocationMarketChanged = (newLocation: LocationData, oldLocation: LocationData | null): boolean => {
    if (!oldLocation) return true;
    return newLocation.isNWA !== oldLocation.isNWA;
  };

  // NEW: Handle save location with waitlist logic
  const handleSaveLocation = async () => {
    if (validatedLocation) {
      // Update location in context
      setLocationData(validatedLocation);
      
      // Check if market has changed
      const marketChanged = hasLocationMarketChanged(validatedLocation, previousLocationData);
      
      if (marketChanged) {
        // Market changed - show waitlist for new area
        const waitlistType = validatedLocation.isNWA ? 'early_access' : 'geographic';
        
        // Close this modal first
        onOpenChange(false);
        
        // Then open waitlist flow
        setTimeout(() => {
          openWaitlistFlow(waitlistType, validatedLocation);
        }, 100);
      } else {
        // Same market - just save and close
        setModalState('saved');
        setTimeout(() => {
          onOpenChange(false);
        }, 1000);
      }
      
      // Call onConfirm if provided
      if (onConfirm) {
        onConfirm(validatedLocation);
      }
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleEdit = () => {
    setModalState('editing');
    clearError();
    // Enable the input field and focus it
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleDelete = () => {
    setInputValue('');
    setValidatedLocation(null);
    setPreviousLocationData(null);
    clearLocation();
    setModalState('empty');
    clearError();
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleRetry = () => {
    clearError();
    setModalState('empty');
    inputRef.current?.focus();
  };

  const getStatusBadge = () => {
    switch (modalState) {
      case 'loading':
        return null; // No badge during loading
      case 'launching':
        return (
          <Badge variant="success" icon={<FeatherCheckCircle />}>
            Launching in Northwest Arkansas first!
          </Badge>
        );
      case 'coming-soon':
        return (
          <Badge variant="warning" icon={<FeatherClock />}>
            Coming to your city soon...
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="error" icon={<FeatherAlertCircle />}>
            {error || 'Unable to find location. Please try again.'}
          </Badge>
        );
      case 'saved':
        return (
          <Badge variant="success" icon={<FeatherCheckCircle />}>
            Location saved successfully!
          </Badge>
        );
      default:
        return null;
    }
  };

  const getButtons = () => {
    const isFormValid = validatedLocation && !isValidating && !isLoadingSuggestions;
    
    // Saved state with edit/delete options
    if (modalState === 'saved' && !isValidating && !isLoadingSuggestions) {
      return (
        <div className="flex w-full items-end justify-end gap-2">
          <Button 
            variant="neutral-tertiary" 
            onClick={handleCancel}
          >
            Close
          </Button>
          <Button 
            onClick={() => onConfirm && validatedLocation && onConfirm(validatedLocation)}
            disabled={!validatedLocation}
          >
            {forWaitlist ? 'Join Waitlist' : 'Continue'}
          </Button>
        </div>
      );
    }

    // Error state with retry option
    if (modalState === 'error') {
      return (
        <div className="flex w-full items-end justify-end gap-2">
          <Button 
            variant="neutral-tertiary" 
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRetry}
            icon={<FeatherAlertCircle />}
          >
            Try Again
          </Button>
        </div>
      );
    }

    // Default state buttons - UPDATED BUTTON TEXT
    return (
      <div className="flex w-full items-end justify-end gap-2">
        <Button 
          variant="neutral-tertiary" 
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSaveLocation}
          disabled={!isFormValid}
          loading={isValidating}
        >
          {isValidating ? 'Saving...' : 'Save Location'}
        </Button>
      </div>
    );
  };

  const getTitle = () => {
    if (modalState === 'saved') return 'Your Location';
    if (mode === 'edit') return 'Update Your Location';
    if (forWaitlist) return 'Join Our Waitlist';
    return 'Enter Your Location';
  };

  const getDescription = () => {
    if (forWaitlist) return 'Enter your location to join our waitlist and be notified when we launch in your area.';
    return 'Enter your city, zip code, or address to find fresh local food near you.';
  };

  // Determine if input should be disabled (saved state but not editing)
  const isInputDisabled = modalState === 'saved' || isDetectingLocation || isValidating;

  return (
    <DialogLayout 
      open={open} 
      onOpenChange={onOpenChange}
      className="z-[9999]"
    >
      <div className="flex w-full flex-col items-start gap-4 bg-white px-6 py-6">
        {/* Header */}
        <div className="flex w-full items-center justify-between">
          <span className="text-heading-2 font-heading-2 text-default-font">
            {getTitle()}
          </span>
          <IconButton 
            icon={<FeatherX />} 
            onClick={() => onOpenChange(false)} 
          />
        </div>

        {/* Description */}
        <span className="w-full text-body font-body text-subtext-color">
          {getDescription()}
        </span>

        {/* Location Input */}
        <div className="flex w-full items-end justify-end gap-2 relative">
          <TextField 
            className="h-auto grow shrink-0 basis-0" 
            label="Location" 
            helpText="" 
            error={modalState === 'error'}
            disabled={isInputDisabled}
            icon={<FeatherMapPin />}
          >
            <TextField.Input 
              ref={inputRef}
              placeholder="Enter city, state, or zip code..."
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              spellCheck={false}
              disabled={isInputDisabled}
            />
          </TextField>

          {/* Action buttons based on state */}
          {modalState === 'saved' ? (
            <>
              <IconButton 
                variant="neutral-secondary" 
                icon={<FeatherPencil />} 
                onClick={handleEdit}
                title="Edit location"
              />
              <IconButton 
                variant="neutral-secondary" 
                icon={<FeatherTrash />} 
                onClick={handleDelete}
                title="Remove location"
              />
            </>
          ) : (
            <IconButton 
              variant="neutral-secondary" 
              icon={<FeatherLocate />} 
              onClick={detectCurrentLocation}
              loading={isDetectingLocation}
              disabled={isDetectingLocation || isValidating || modalState === 'saved'}
              title="Use current location"
            />
          )}

          {/* Suggestions Dropdown */}
          {showSuggestions && (suggestions.length > 0 || isLoadingSuggestions) && (
            <div 
              ref={suggestionsRef}
              className="fixed bg-white border border-neutral-200 rounded-md shadow-lg z-[10000] max-h-[200px] overflow-y-auto"
              style={{
                top: inputRef.current ? inputRef.current.getBoundingClientRect().bottom + 4 : 0,
                left: window.innerWidth < 768 
                  ? '50%' 
                  : (inputRef.current ? inputRef.current.getBoundingClientRect().left - 16 : 0),
                transform: window.innerWidth < 768 ? 'translateX(-50%)' : 'none',
                width: window.innerWidth < 768 
                  ? '90vw' 
                  : (inputRef.current ? inputRef.current.getBoundingClientRect().width + 32 : 400),
                maxWidth: window.innerWidth < 768 ? '400px' : '600px'
              }}
            >
              {isLoadingSuggestions ? (
                <div className="p-3">
                  <div className="flex items-center gap-2 text-subtext-color">
                    <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-body font-body">Searching locations...</span>
                  </div>
                </div>
              ) : (
                suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.place_id || index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full text-left px-3 py-3 hover:bg-neutral-50 border-b border-neutral-100 last:border-b-0 transition-colors ${
                      index === selectedIndex ? 'bg-brand-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <FeatherMapPin className="w-4 h-4 text-subtext-color flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate text-default-font">{suggestion.main_text}</div>
                        {suggestion.secondary_text && (
                          <div className="text-sm text-subtext-color truncate">{suggestion.secondary_text}</div>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Status Badge/Alert */}
        {getStatusBadge()}

        {/* Loading State */}
        {(isValidating || isDetectingLocation) && (
          <div className="flex w-full items-center justify-center gap-2 py-4">
            <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-body font-body text-subtext-color">
              {isValidating ? 'Validating location...' : 
               isDetectingLocation ? 'Detecting your location...' : 
               'Loading...'}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        {getButtons()}
      </div>
    </DialogLayout>
  );
};

export default LocationCollectionModal;