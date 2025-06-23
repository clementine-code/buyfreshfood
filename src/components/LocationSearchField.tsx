"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { TextField } from "@/ui/components/TextField";
import { Button } from "@/ui/components/Button";
import { Alert } from "@/ui/components/Alert";
import { FeatherMapPin, FeatherLocate } from "@subframe/core";
import { useLocationContext } from "../contexts/LocationContext";
import { locationService, type LocationSuggestion } from "../services/locationService";

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
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const debounceRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync input value with context state
  useEffect(() => {
    setInputValue(state.location || "");
  }, [state.location]);

  // Search for location suggestions
  const searchSuggestions = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const results = await locationService.getLocationSuggestions(query);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || state.isLoading) return;

    setShowSuggestions(false);
    await setLocation(inputValue.trim());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Clear error when user starts typing
    if (state.error) {
      clearError();
    }

    // Debounce search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.trim().length >= 3) {
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
    
    try {
      const locationData = await locationService.getLocationDetails(suggestion.place_id, suggestion.coordinates);
      if (locationData) {
        await setLocation(suggestion.description);
      }
    } catch (error) {
      console.error('Error selecting suggestion:', error);
      await setLocation(suggestion.description);
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
    if (state.isLoading) return;
    setShowSuggestions(false);
    await detectCurrentLocation();
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0 && inputValue.length >= 3) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 150);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className={`space-y-3 ${className}`} ref={containerRef}>
      <form onSubmit={handleSubmit} className="flex gap-2 relative">
        <div className="flex-1 relative">
          <TextField
            className="w-full"
            variant="filled"
            icon={<FeatherMapPin />}
            disabled={state.isLoading}
          >
            <TextField.Input
              ref={inputRef}
              placeholder={placeholder}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              autoFocus={autoFocus}
              autoComplete="off"
            />
          </TextField>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-md shadow-lg z-[60] max-h-48 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.place_id || index}
                  type="button"
                  className={`w-full text-left px-3 py-2 hover:bg-neutral-50 border-b border-neutral-100 last:border-b-0 transition-colors ${
                    index === selectedIndex ? 'bg-brand-50' : ''
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseEnter={() => setSelectedIndex(index)}
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
          {isLoadingSuggestions && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-md shadow-lg z-[60] p-3">
              <div className="flex items-center gap-2 text-subtext-color">
                <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-body font-body">Searching locations...</span>
              </div>
            </div>
          )}
        </div>
        
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