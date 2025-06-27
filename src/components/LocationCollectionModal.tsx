"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/ui/components/Button";
import { TextField } from "@/ui/components/TextField";
import { IconButton } from "@/ui/components/IconButton";
import { Alert } from "@/ui/components/Alert";
import { FeatherX, FeatherMapPin, FeatherLocate, FeatherCheck, FeatherAlertCircle } from "@subframe/core";
import { locationService, type LocationData, type LocationSuggestion } from "../services/locationService";

interface LocationCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (locationData: LocationData) => void;
  initialLocation?: string;
}

const LocationCollectionModal: React.FC<LocationCollectionModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  initialLocation = ""
}) => {
  const [inputValue, setInputValue] = useState(initialLocation);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validatedLocation, setValidatedLocation] = useState<LocationData | null>(null);

  const debounceRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setInputValue(initialLocation);
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
      setError(null);
      setValidatedLocation(null);
      setIsSubmitting(false);
      setIsDetectingLocation(false);
      
      // Focus input after a short delay
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 100);
    }
  }, [isOpen, initialLocation]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isSubmitting, onClose]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Search for location suggestions with timeout
  const searchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    setError(null);
    
    try {
      // 3-second timeout for API calls
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutRef.current = setTimeout(() => {
          reject(new Error('Request timeout'));
        }, 3000);
      });

      const searchPromise = locationService.getLocationSuggestions(query);
      const results = await Promise.race([searchPromise, timeoutPromise]);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      if (error.message === 'Request timeout') {
        setError('Request timed out. Please try again.');
      } else {
        setError('Unable to search locations. Please try again.');
      }
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setValidatedLocation(null);
    setError(null);

    // Debounce search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        searchSuggestions(value.trim());
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = async (suggestion: LocationSuggestion) => {
    setInputValue(suggestion.description);
    setShowSuggestions(false);
    setSuggestions([]);
    setError(null);
    
    try {
      setIsLoadingSuggestions(true);
      
      // 3-second timeout for location details
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutRef.current = setTimeout(() => {
          reject(new Error('Request timeout'));
        }, 3000);
      });

      const detailsPromise = locationService.getLocationDetails(suggestion.place_id, suggestion.coordinates);
      const locationData = await Promise.race([detailsPromise, timeoutPromise]);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (locationData) {
        setValidatedLocation(locationData);
      } else {
        setError('Unable to get location details. Please try again.');
      }
    } catch (error) {
      console.error('Error getting location details:', error);
      if (error.message === 'Request timeout') {
        setError('Request timed out. Please try again.');
      } else {
        setError('Unable to get location details. Please try again.');
      }
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit(e as any);
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
          handleSubmit(e as any);
        }
        break;
      
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleDetectLocation = async () => {
    if (isDetectingLocation) return;
    
    setIsDetectingLocation(true);
    setError(null);
    
    try {
      // 3-second timeout for geolocation
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutRef.current = setTimeout(() => {
          reject(new Error('Request timeout'));
        }, 3000);
      });

      const locationPromise = locationService.getCurrentLocation();
      const locationData = await Promise.race([locationPromise, timeoutPromise]);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (locationData) {
        setInputValue(locationData.formattedAddress || `${locationData.city}, ${locationData.state}`);
        setValidatedLocation(locationData);
      } else {
        setError('Unable to detect your location. Please enter it manually.');
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      if (error.message === 'Request timeout') {
        setError('Location detection timed out. Please enter your location manually.');
      } else {
        setError('Location access denied. Please enter your location manually.');
      }
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    
    try {
      let locationData = validatedLocation;
      
      if (!locationData) {
        // 3-second timeout for validation
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutRef.current = setTimeout(() => {
            reject(new Error('Request timeout'));
          }, 3000);
        });

        const validationPromise = locationService.validateLocationInput(inputValue.trim());
        locationData = await Promise.race([validationPromise, timeoutPromise]);
        
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      }
      
      if (locationData) {
        onConfirm(locationData);
      } else {
        setError('Unable to validate location. Please try a different address or zip code.');
      }
    } catch (error) {
      console.error('Error validating location:', error);
      if (error.message === 'Request timeout') {
        setError('Request timed out. Please try again.');
      } else {
        setError('Unable to validate location. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0 && inputValue.length >= 2) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Don't blur if clicking on a suggestion
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget && (containerRef.current?.contains(relatedTarget) || suggestionsRef.current?.contains(relatedTarget))) {
      return;
    }
    
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 150);
  };

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSuggestions]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-[9998]"
        onClick={!isSubmitting ? onClose : undefined}
      />
      
      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] w-full max-w-md mx-4">
        <div 
          ref={containerRef}
          className="bg-white rounded-lg shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-200">
            <h2 className="text-heading-2 font-heading-2 text-default-font">
              Enter Your Location
            </h2>
            <IconButton
              variant="neutral-tertiary"
              icon={<FeatherX />}
              onClick={onClose}
              disabled={isSubmitting}
            />
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Instructions */}
            <p className="text-body font-body text-subtext-color">
              Enter your city, state, zip code, or address to find fresh local food near you.
            </p>

            {/* Error Display */}
            {error && (
              <Alert
                variant="error"
                title="Location Error"
                description={error}
              />
            )}

            {/* Validation Success */}
            {validatedLocation && !error && (
              <Alert
                variant={validatedLocation.isNWA ? "success" : "warning"}
                title={validatedLocation.isNWA ? "Great! We serve your area" : "Coming soon to your area"}
                description={
                  validatedLocation.isNWA
                    ? `Fresh local food is available in ${validatedLocation.city}.`
                    : "We're expanding! You'll be added to our waitlist for your area."
                }
              />
            )}

            {/* Location Input Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <TextField
                  label="Location"
                  icon={<FeatherMapPin />}
                  placeholder="Enter city, state, or zip code..."
                  disabled={isSubmitting || isDetectingLocation}
                >
                  <TextField.Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    autoComplete="off"
                    spellCheck={false}
                  />
                </TextField>

                {/* Suggestions Dropdown */}
                {showSuggestions && (suggestions.length > 0 || isLoadingSuggestions) && (
                  <div 
                    ref={suggestionsRef}
                    className="absolute left-0 right-0 top-full mt-1 bg-white border border-neutral-200 rounded-md shadow-lg z-[10000] max-h-[200px] overflow-y-auto"
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
                          className={`w-full text-left px-3 py-3 hover:bg-neutral-50 border-b border-neutral-100 last:border-b-0 transition-colors ${
                            index === selectedIndex ? 'bg-brand-50' : ''
                          }`}
                          onClick={() => handleSuggestionClick(suggestion)}
                          onMouseDown={(e) => e.preventDefault()}
                          onMouseEnter={() => setSelectedIndex(index)}
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

              {/* Use Current Location Button */}
              <Button
                type="button"
                variant="neutral-secondary"
                icon={<FeatherLocate />}
                onClick={handleDetectLocation}
                disabled={isSubmitting || isDetectingLocation}
                loading={isDetectingLocation}
                className="w-full"
              >
                {isDetectingLocation ? 'Detecting location...' : 'Use current location'}
              </Button>
            </form>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200">
            <Button
              variant="neutral-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!inputValue.trim() || isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? 'Validating...' : 'Continue'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LocationCollectionModal;