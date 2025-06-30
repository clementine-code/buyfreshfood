"use client";

import React, { useState, useEffect, useRef } from "react";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { Badge } from "@/ui/components/Badge";
import { FeatherArrowRight } from "@subframe/core";
import { TextField } from "@/ui/components/TextField";
import { CheckboxCard } from "@/ui/components/CheckboxCard";
import { Button } from "@/ui/components/Button";
import { FeatherExternalLink, FeatherMapPin, FeatherEdit3, FeatherLocate, FeatherX } from "@subframe/core";
import { IconButton } from "@/ui/components/IconButton";
import { useWaitlistContext } from "../contexts/WaitlistContext";
import { useLocationContext } from "../contexts/LocationContext";
import { submitWaitlist } from "../utils/waitlistUtils";
import { locationService, type LocationData, type LocationSuggestion } from "../services/locationService";
import { useNavigate } from "react-router-dom";

const WaitlistModal: React.FC = () => {
  const { state, closeAllModals, showSuccessView, openLocationModal } = useWaitlistContext();
  const { state: locationState, setLocationData } = useLocationContext();
  const navigate = useNavigate();

  // Form state - UPDATED: Email is now persistent across location changes
  const [email, setEmail] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [currentLocationData, setCurrentLocationData] = useState<LocationData | null>(null);
  const [previousLocationData, setPreviousLocationData] = useState<LocationData | null>(null);
  const [interests, setInterests] = useState({
    buying: false,
    selling: false,
    updates: false
  });
  const [productInterests, setProductInterests] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isValidatingLocation, setIsValidatingLocation] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // NEW: Location collection state
  const [showLocationInput, setShowLocationInput] = useState(false);

  // FIXED: Google Places API integration state - using same pattern as LocationCollectionModal
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Honeypot field state - invisible to users, only bots will fill this
  const [honeypot, setHoneypot] = useState("");

  // Refs for suggestion handling - same as LocationCollectionModal
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const preventBlurRef = useRef(false);

  // UPDATED: Initialize form when modal opens - PRESERVE EMAIL
  useEffect(() => {
    if (state.isWaitlistModalOpen && !state.isSuccessView) {
      console.log('🎯 Initializing waitlist modal:', {
        collectLocationInModal: state.collectLocationInModal,
        currentLocationData: state.currentLocationData,
        locationState: locationState.isSet
      });

      // Determine if we need to show location input
      const needsLocationCollection = state.collectLocationInModal || !state.currentLocationData;
      setShowLocationInput(needsLocationCollection);

      // Set location data from context or waitlist context
      const locationData = state.currentLocationData || (locationState.isSet ? {
        isNWA: locationState.isNWA,
        city: locationState.city || '',
        state: locationState.state || '',
        zipCode: locationState.zipCode || '',
        formattedAddress: locationState.location || '',
        latitude: locationState.coordinates?.lat,
        longitude: locationState.coordinates?.lng
      } : null);

      if (locationData) {
        setCurrentLocationData(locationData);
        setPreviousLocationData(locationData);
        setLocationInput(locationData.formattedAddress || 
                        `${locationData.city}, ${locationData.state}`);
        setShowLocationInput(false); // We have location data, don't show input
      } else {
        // No location data - clear everything and show input
        setCurrentLocationData(null);
        setPreviousLocationData(null);
        setLocationInput("");
        setShowLocationInput(true);
      }
      
      // UPDATED: Only reset form fields if this is a fresh modal open (not location updates)
      // Preserve email across location changes
      if (!email) {
        setEmail("");
      }
      
      // Reset other form fields only on fresh open
      setInterests({
        buying: false,
        selling: false,
        updates: false
      });
      setProductInterests("");
      setError("");
      setIsEditingLocation(false);
      setIsDetectingLocation(false);
      
      // Reset suggestion state
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
      
      // Reset honeypot field
      setHoneypot("");
    }
  }, [state.isWaitlistModalOpen, state.isSuccessView, state.currentLocationData, state.collectLocationInModal, locationState]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Check if location market has changed
  const hasLocationMarketChanged = (newLocation: LocationData, oldLocation: LocationData | null): boolean => {
    if (!oldLocation) return true;
    return newLocation.isNWA !== oldLocation.isNWA;
  };

  // FIXED: Fetch location suggestions - same pattern as LocationCollectionModal
  const fetchLocationSuggestions = async (input: string) => {
    if (input.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    
    try {
      console.log('🔍 Fetching location suggestions for:', input);
      const results = await locationService.getLocationSuggestions(input);
      setSuggestions(results || []);
      setShowSuggestions(results.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleLocationEdit = () => {
    setIsEditingLocation(true);
    setShowLocationInput(true);
  };

  // FIXED: Handle location input changes - same debouncing as LocationCollectionModal
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocationInput(value);
    setError("");
    setSelectedIndex(-1);

    // Clear existing debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // FIXED: Only show suggestions when input is focused and longer debounce
    if (value.trim().length >= 2 && document.activeElement === inputRef.current) {
      setShowSuggestions(true);
      debounceTimerRef.current = setTimeout(() => {
        fetchLocationSuggestions(value.trim());
      }, 800); // Longer debounce to prevent getting stuck
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle keyboard navigation for suggestions - same as LocationCollectionModal
  const handleLocationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleLocationValidation();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleLocationValidation();
        }
        break;
      
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle suggestion clicks - same pattern as LocationCollectionModal
  const handleSuggestionClick = async (suggestion: LocationSuggestion) => {
    preventBlurRef.current = true;
    
    setLocationInput(suggestion.description);
    setSuggestions([]);
    setShowSuggestions(false);
    setIsValidatingLocation(true);

    try {
      console.log('🔍 Getting location details for suggestion:', suggestion);
      const locationData = await locationService.getLocationDetails(suggestion.place_id, suggestion.coordinates);
      
      if (locationData) {
        console.log('✅ Location validated from suggestion:', locationData);
        
        // Check if market has changed
        const marketChanged = hasLocationMarketChanged(locationData, previousLocationData);
        console.log('🔄 Market changed:', marketChanged);
        
        setCurrentLocationData(locationData);
        setLocationInput(locationData.formattedAddress || 
                        `${locationData.city}, ${locationData.state}`);
        setShowLocationInput(false);
        setIsEditingLocation(false);
        
        // Save to context immediately
        setLocationData(locationData);
        
        if (marketChanged && previousLocationData) {
          console.log('🚀 Market changed, but continuing with current flow');
        }
      } else {
        setError('Unable to validate this location. Please try a different address.');
      }
    } catch (err) {
      console.error('Error getting location details:', err);
      setError('Failed to validate location. Please try again.');
    } finally {
      setIsValidatingLocation(false);
      setTimeout(() => {
        preventBlurRef.current = false;
      }, 100);
    }
  };

  // Handle input focus - same as LocationCollectionModal
  const handleLocationFocus = () => {
    if (suggestions.length > 0 && locationInput.length >= 2) {
      setShowSuggestions(true);
    }
  };

  // Handle input blur - same conservative pattern as LocationCollectionModal
  const handleLocationBlur = () => {
    if (preventBlurRef.current) {
      return;
    }
    
    setTimeout(() => {
      if (!preventBlurRef.current) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    }, 150);
  };

  // Handle location validation for direct input
  const handleLocationValidation = async () => {
    if (!locationInput.trim()) return;

    setIsValidatingLocation(true);
    setError("");

    try {
      console.log('🔍 Validating location input:', locationInput);
      const locationData = await locationService.validateLocationInput(locationInput.trim());
      
      if (locationData) {
        console.log('✅ Location validated:', locationData);
        
        // Check if market has changed
        const marketChanged = hasLocationMarketChanged(locationData, previousLocationData);
        console.log('🔄 Market changed:', marketChanged);
        
        setCurrentLocationData(locationData);
        setLocationInput(locationData.formattedAddress || 
                        `${locationData.city}, ${locationData.state}`);
        setShowLocationInput(false);
        setIsEditingLocation(false);
        
        // Save to context immediately
        setLocationData(locationData);
        
        if (marketChanged && previousLocationData) {
          console.log('🚀 Market changed, but continuing with current flow');
        }
      } else {
        setError('Unable to validate location. Please try a different address.');
      }
    } catch (err) {
      console.error('Error validating location:', err);
      setError('Failed to validate location. Please try again.');
    } finally {
      setIsValidatingLocation(false);
    }
  };

  // Handle current location detection - same as LocationCollectionModal
  const handleDetectCurrentLocation = async () => {
    setIsDetectingLocation(true);
    setError("");

    try {
      console.log('📍 Detecting current location...');
      const locationData = await locationService.getCurrentLocation();
      
      if (locationData) {
        console.log('✅ Current location detected:', locationData);
        
        const displayText = locationData.formattedAddress || `${locationData.city}, ${locationData.state}`;
        setLocationInput(displayText);
        
        // Check if market has changed
        const marketChanged = hasLocationMarketChanged(locationData, previousLocationData);
        console.log('🔄 Market changed:', marketChanged);
        
        setCurrentLocationData(locationData);
        setShowLocationInput(false);
        setIsEditingLocation(false);
        
        // Save to context immediately
        setLocationData(locationData);
        
        if (marketChanged && previousLocationData) {
          console.log('🚀 Market changed, but continuing with current flow');
        }
      } else {
        setError('Unable to detect your location. Please enter your location manually.');
      }
    } catch (err) {
      console.error('Error detecting current location:', err);
      setError('Location access denied. Please enter your location manually.');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleLocationCancel = () => {
    // Restore original location
    if (currentLocationData) {
      setLocationInput(currentLocationData.formattedAddress || 
                      `${currentLocationData.city}, ${currentLocationData.state}`);
      setShowLocationInput(false);
    } else {
      setLocationInput("");
      setShowLocationInput(true);
    }
    setIsEditingLocation(false);
    setError("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // UPDATED: Form validation - only require email and location
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !currentLocationData || isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      const selectedInterests = Object.entries(interests)
        .filter(([_, selected]) => selected)
        .map(([key, _]) => key);

      const formData = {
        email: email.trim(),
        location: currentLocationData.formattedAddress || `${currentLocationData.city}, ${currentLocationData.state}`,
        city: currentLocationData.city,
        state: currentLocationData.state,
        zipCode: currentLocationData.zipCode,
        interests: selectedInterests,
        productInterests: productInterests.trim(),
        waitlistType: state.modalType || 'geographic',
        honeypot: honeypot // Include honeypot field
      };

      const result = await submitWaitlist(formData);

      if (result.success) {
        // Save location to context if not already saved
        setLocationData(currentLocationData);
        showSuccessView(result.queuePosition, result.data);
      } else {
        setError(result.error || 'Failed to join waitlist. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting waitlist:', err);
      setError('Failed to join waitlist. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBrowseClick = () => {
    closeAllModals();
    navigate('/shop');
  };

  const handleMaybeLater = () => {
    closeAllModals();
  };

  const handleClickOutside = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeAllModals();
    }
  };

  if (!state.isWaitlistModalOpen) return null;

  // Success View - FIXED MODAL STRUCTURE
  if (state.isSuccessView) {
    const isGeographic = state.modalType === 'geographic';
    const cityName = currentLocationData?.city || 'your area';
    
    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 mobile:p-1 overflow-y-auto"
        style={{ zIndex: 999999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        onClick={handleClickOutside}
      >
        <div className="bg-white rounded-lg max-w-[576px] w-full max-h-[90vh] overflow-y-auto shadow-xl hide-scrollbar-until-hover mx-4 mobile:mx-2 mobile:max-w-[calc(100vw-16px)]">
          <div className="flex h-full w-full flex-col items-center gap-8 rounded-md bg-default-background px-6 py-12">
            <div className="flex w-full max-w-[576px] flex-col items-center gap-6">
              <IconWithBackground variant="success" size="x-large" />
              <div className="flex flex-col items-center gap-2">
                <span className="text-heading-2 font-heading-2 text-default-font text-center">
                  {isGeographic 
                    ? `You're #${state.queueNumber} in line for ${cityName}!`
                    : "You're on the early access list!"
                  }
                </span>
                <span className="text-body font-body text-subtext-color text-center">
                  {isGeographic
                    ? "We'll notify you as soon as we launch in your area"
                    : "We'll notify you when ordering goes live"
                  }
                </span>
              </div>
              <Button
                className="h-10 w-full flex-none"
                size="large"
                onClick={handleBrowseClick}
              >
                Browse Marketplace
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form View - FIXED MODAL STRUCTURE
  const isGeographic = state.modalType === 'geographic';
  const cityName = currentLocationData?.city || 'your area';
  const hasLocation = !!currentLocationData;

  // Dynamic title and description based on location state
  const getTitle = () => {
    if (!hasLocation) {
      return "🥕 Fresh Local Food is expanding!";
    }
    if (currentLocationData?.isNWA) {
      return `🚀 BuyFresh.Food is coming to Northwest Arkansas first!`;
    }
    return `🥕 Expand BuyFresh.Food marketplace to ${cityName}!`;
  };

  const getDescription = () => {
    if (!hasLocation) {
      return "Join our waitlist to be first in line when we launch in your area. Get access to farm-fresh produce and local goods at better prices.";
    }
    if (currentLocationData?.isNWA) {
      return "We're launching in Northwest Arkansas first! Join our early access list to be among the first to order when we go live.";
    }
    return "Join our waitlist to be first in line when we launch in your area. Get access to farm-fresh produce and local goods at better prices.";
  };

  // FIXED: Mobile-responsive badge flow with proper text wrapping
  const getBadgeFlow = () => {
    if (!hasLocation) {
      return (
        <div className="flex w-full flex-col items-center gap-4">
          {/* FIXED: Mobile-responsive badge container with wrapping */}
          <div className="flex w-full items-center justify-center gap-2 mobile:flex-col mobile:gap-3">
            <Badge variant="success" className="mobile:text-xs">
              <span className="mobile:text-xs">Launching in Northwest Arkansas first!</span>
            </Badge>
            <FeatherArrowRight className="text-body font-body text-subtext-color mobile:rotate-90 mobile:w-4 mobile:h-4" />
            <Badge variant="warning" className="mobile:text-xs">
              <span className="mobile:text-xs">Coming to your area soon!</span>
            </Badge>
          </div>
          <span className="text-caption font-caption text-subtext-color text-center mobile:text-xs">
            Enter your location to see when we're coming to you
          </span>
        </div>
      );
    }

    if (currentLocationData?.isNWA) {
      return (
        <div className="flex w-full flex-col items-center gap-4">
          <div className="flex w-full items-center justify-center gap-2 mobile:flex-col mobile:gap-3">
            <Badge variant="success" className="mobile:text-xs">
              <span className="mobile:text-xs">Launching in Northwest Arkansas first!</span>
            </Badge>
            <FeatherArrowRight className="text-body font-body text-subtext-color mobile:rotate-90 mobile:w-4 mobile:h-4" />
            <Badge variant="success" className="mobile:text-xs">
              <span className="mobile:text-xs">Early access launching soon!</span>
            </Badge>
          </div>
          <span className="text-caption font-caption text-subtext-color text-center mobile:text-xs">
            Get early access in Northwest Arkansas
          </span>
        </div>
      );
    }

    return (
      <div className="flex w-full flex-col items-center gap-4">
        <div className="flex w-full items-center justify-center gap-2 mobile:flex-col mobile:gap-3">
          <Badge variant="success" className="mobile:text-xs">
            <span className="mobile:text-xs">Launching in Northwest Arkansas first!</span>
          </Badge>
          <FeatherArrowRight className="text-body font-body text-subtext-color mobile:rotate-90 mobile:w-4 mobile:h-4" />
          <Badge variant="warning" className="mobile:text-xs">
            <span className="mobile:text-xs">Coming to {cityName} soon!</span>
          </Badge>
        </div>
        <span className="text-caption font-caption text-subtext-color text-center mobile:text-xs">
          Join others bringing this to {cityName}
        </span>
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 mobile:p-1 overflow-y-auto"
      style={{ zIndex: 999999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={handleClickOutside}
    >
      <div className="bg-white rounded-lg max-w-[576px] w-full max-h-[90vh] overflow-y-auto shadow-xl hide-scrollbar-until-hover mx-4 mobile:mx-2 mobile:max-w-[calc(100vw-16px)]">
        {/* Close Button */}
        <div className="flex justify-end p-4 pb-0">
          <IconButton
            variant="neutral-tertiary"
            icon={<FeatherX />}
            onClick={closeAllModals}
          />
        </div>

        <div className="flex h-full w-full flex-col items-start gap-8 bg-default-background px-8 py-4 pb-8 mobile:px-4 mobile:py-6 mobile:gap-6">
          <div className="flex w-full flex-col items-start gap-4">
            <span className="text-heading-1 font-heading-1 text-default-font mobile:text-heading-2">
              {getTitle()}
            </span>
            <span className="text-body font-body text-subtext-color mobile:text-sm">
              {getDescription()}
            </span>
          </div>
          
          {getBadgeFlow()}

          <form onSubmit={handleSubmit} className="flex w-full flex-col items-start gap-6">
            {/* UPDATED: Email field moved to top - PRIORITY FIELD */}
            <TextField
              className="h-auto w-full flex-none"
              label="Email address"
              helpText=""
              error={!!error && !error.includes('location')}
            >
              <TextField.Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mobile:text-sm"
              />
            </TextField>

            {/* FIXED: Location Input Section - Exact same design as LocationCollectionModal */}
            {showLocationInput && (
              <div className="w-full relative">
                <div className="flex items-end justify-end gap-2 relative">
                  <TextField 
                    className="h-auto grow shrink-0 basis-0" 
                    label="Location" 
                    helpText="" 
                    error={!!error}
                    icon={<FeatherMapPin />}
                  >
                    {/* FIXED: Mobile-responsive text size */}
                    <TextField.Input 
                      ref={inputRef}
                      placeholder="Enter city, state, or zip code..."
                      value={locationInput}
                      onChange={handleLocationChange}
                      onFocus={handleLocationFocus}
                      onBlur={handleLocationBlur}
                      onKeyDown={handleLocationKeyDown}
                      autoComplete="off"
                      spellCheck={false}
                      disabled={isValidatingLocation || isDetectingLocation}
                      className="mobile:text-sm"
                    />
                  </TextField>

                  {/* UPDATED: Find My Location Button with circle background */}
                  <button
                    type="button"
                    onClick={handleDetectCurrentLocation}
                    disabled={isDetectingLocation || isValidatingLocation || isLoadingSuggestions}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Use current location"
                  >
                    <FeatherLocate className={`w-4 h-4 ${isDetectingLocation ? 'animate-pulse' : ''}`} />
                  </button>

                  {/* Suggestions Dropdown - Exact same positioning as LocationCollectionModal */}
                  {showSuggestions && (suggestions.length > 0 || isLoadingSuggestions) && (
                    <div 
                      ref={suggestionsRef}
                      className="absolute left-0 right-0 top-full mt-1 bg-white border border-neutral-200 rounded-md shadow-lg z-[9999] max-h-[200px] overflow-y-auto"
                      style={{ width: 'calc(100% - 52px)' }} // Account for action button
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
                            onMouseDown={(e) => {
                              e.preventDefault();
                              preventBlurRef.current = true;
                            }}
                            onMouseUp={() => {
                              setTimeout(() => {
                                preventBlurRef.current = false;
                              }, 100);
                            }}
                            onMouseEnter={() => setSelectedIndex(index)}
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

                {/* Error message */}
                {error && (
                  <div className="mt-2 text-caption font-caption text-error-700">
                    {error}
                  </div>
                )}

                {/* Loading State */}
                {(isValidatingLocation || isDetectingLocation) && (
                  <div className="flex w-full items-center justify-center gap-2 py-4">
                    <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-body font-body text-subtext-color">
                      {isValidatingLocation ? 'Validating location...' : 
                       isDetectingLocation ? 'Detecting your location...' : 
                       'Loading...'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Existing Location Display - Shows when location is set */}
            {!showLocationInput && currentLocationData && (
              <div className="w-full">
                <label className="block text-body-bold font-body-bold text-default-font mb-2">
                  Location
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center gap-3 px-3 py-2 bg-neutral-100 border border-neutral-200 rounded-md">
                    <FeatherMapPin className="w-4 h-4 text-subtext-color flex-shrink-0" />
                    <span className="text-body font-body text-default-font flex-1 truncate mobile:text-sm">
                      {locationInput}
                    </span>
                  </div>
                  {/* UPDATED: Edit button with proper positioning */}
                  <IconButton
                    variant="neutral-primary"
                    icon={<FeatherEdit3 />}
                    onClick={handleLocationEdit}
                    title="Edit location"
                  />
                </div>
              </div>
            )}
            
            {/* UPDATED: Interests section with optional label */}
            <div className="flex w-full flex-col items-start gap-1">
              <label className="block text-body-bold font-body-bold text-default-font mb-2">
                I'm interested in (optional):
                </label>
              <CheckboxCard
                checked={interests.buying}
                onCheckedChange={(checked) => setInterests(prev => ({ ...prev, buying: checked }))}
              >
                <span className="text-body font-body text-default-font mobile:text-sm">
                  Buying fresh food
                </span>
              </CheckboxCard>
              <CheckboxCard
                checked={interests.selling}
                onCheckedChange={(checked) => setInterests(prev => ({ ...prev, selling: checked }))}
              >
                <span className="text-body font-body text-default-font mobile:text-sm">
                  Selling from my garden/farm
                </span>
              </CheckboxCard>
              <CheckboxCard
                checked={interests.updates}
                onCheckedChange={(checked) => setInterests(prev => ({ ...prev, updates: checked }))}
              >
                <span className="text-body font-body text-default-font mobile:text-sm">
                  Just staying updated
                </span>
              </CheckboxCard>
            </div>
            
            {/* UPDATED: Product interests with optional label */}
            <TextField
              className="h-auto w-full flex-none"
              label="What would you most like to find? (optional)"
              helpText="Examples: Fresh eggs, local honey, heirloom tomatoes"
            >
              <TextField.Input
                placeholder="Tell us what you're looking for..."
                value={productInterests}
                onChange={(e) => setProductInterests(e.target.value)}
                className="mobile:text-sm"
              />
            </TextField>

            {/* Honeypot field - hidden from real users, only bots will fill this */}
            <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
              <TextField
                className="h-auto w-full flex-none"
                label="Leave this field empty"
              >
                <TextField.Input
                  name="website"
                  autoComplete="off"
                  tabIndex={-1}
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </TextField>
            </div>

            {error && !error.includes('location') && (
              <div className="w-full p-3 bg-error-50 border border-error-200 rounded-md">
                <span className="text-caption font-caption text-error-700">{error}</span>
              </div>
            )}

            <div className="flex w-full flex-col items-center gap-4">
              {/* UPDATED: Form validation - only require email and location */}
              <Button
                type="submit"
                className="h-12 w-full flex-none"
                size="large"
                disabled={!email.trim() || !currentLocationData || isSubmitting || showLocationInput}
                loading={isSubmitting}
              >
                {isSubmitting 
                  ? "Joining..." 
                  : hasLocation && currentLocationData?.isNWA
                    ? "Join Early Access List"
                    : hasLocation
                      ? `Join Waitlist for ${cityName}`
                      : "Join Waitlist"
                }
              </Button>
              <Button
                type="button"
                variant="neutral-tertiary"
                onClick={handleMaybeLater}
                disabled={isSubmitting}
              >
                Maybe later
              </Button>
            </div>
          </form>

          <div className="flex w-full flex-col items-center gap-2 border-t border-solid border-neutral-border pt-6">
            <span className="text-caption font-caption text-subtext-color mobile:text-xs text-center">
              Browse our Northwest Arkansas marketplace while you wait
            </span>
            <Button
              variant="brand-secondary"
              icon={<FeatherExternalLink />}
              onClick={handleBrowseClick}
            >
              Shop
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitlistModal;