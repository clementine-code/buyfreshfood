"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { TextField } from "@/ui/components/TextField";
import { Button } from "@/ui/components/Button";
import { Alert } from "@/ui/components/Alert";
import { Toast } from "@/ui/components/Toast";
import { FeatherMapPin, FeatherLocate, FeatherX } from "@subframe/core";
import { useLocationContext } from "../contexts/LocationContext";
import { locationService, type LocationSuggestion } from "../services/locationService";

interface LocationSearchFieldProps {
  className?: string;
  placeholder?: string;
  showValidation?: boolean;
  autoFocus?: boolean;
  enableInlineEditing?: boolean; // New prop for hero section
}

const LocationSearchField: React.FC<LocationSearchFieldProps> = ({
  className,
  placeholder = "Enter your location to find fresh local food near you...",
  showValidation = true,
  autoFocus = false,
  enableInlineEditing = false, // Enable for hero section
}) => {
  const { state, setLocation, detectCurrentLocation, clearError, clearLocation } = useLocationContext();
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "warning">("success");

  const debounceRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync input value with context state
  useEffect(() => {
    if (!isEditing) {
      setInputValue(state.location || "");
    }
  }, [state.location, isEditing]);

  // Show toast for errors instead of inline alerts
  useEffect(() => {
    if (state.error && !showValidation) {
      setToastMessage(state.error);
      setToastType("error");
      setShowToast(true);
      clearError();
    }
  }, [state.error, showValidation, clearError]);

  // Search for location suggestions with improved error handling
  const searchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) { // Reduced threshold for better UX
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
      
      // Show toast for search errors
      if (!showValidation) {
        setToastMessage("Unable to search locations. Please try again.");
        setToastType("error");
        setShowToast(true);
      }
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [showValidation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || state.isLoading) return;

    setShowSuggestions(false);
    setIsEditing(false);
    
    try {
      await setLocation(inputValue.trim());
      
      // Show success toast for non-validation mode
      if (!showValidation && !state.error) {
        setToastMessage("Location updated successfully!");
        setToastType("success");
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error setting location:', error);
      if (!showValidation) {
        setToastMessage("Failed to update location. Please try again.");
        setToastType("error");
        setShowToast(true);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setIsEditing(true);
    
    // Clear error when user starts typing
    if (state.error) {
      clearError();
    }

    // Debounce search with shorter delay
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        searchSuggestions(value.trim());
      }, 200); // Reduced from 300ms for better responsiveness
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = async (suggestion: LocationSuggestion) => {
    setInputValue(suggestion.description);
    setShowSuggestions(false);
    setSuggestions([]);
    setIsEditing(false);
    
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
        setIsEditing(false);
        setInputValue(state.location || "");
        break;
    }
  };

  const handleDetectLocation = async () => {
    if (state.isLoading) return;
    setShowSuggestions(false);
    setIsEditing(false);
    
    try {
      await detectCurrentLocation();
      
      if (!showValidation && !state.error) {
        setToastMessage("Location detected successfully!");
        setToastType("success");
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error detecting location:', error);
      if (!showValidation) {
        setToastMessage("Unable to detect location. Please enter manually.");
        setToastType("error");
        setShowToast(true);
      }
    }
  };

  const handleInputFocus = () => {
    setIsEditing(true);
    if (suggestions.length > 0 && inputValue.length >= 2) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Don't blur if clicking on a suggestion
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (relatedTarget && containerRef.current?.contains(relatedTarget)) {
      return;
    }
    
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
      
      // If not editing and has location, revert to display mode
      if (!isEditing && state.location && enableInlineEditing) {
        setInputValue(state.location);
      }
    }, 150);
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  };

  const handleClearLocation = () => {
    clearLocation();
    setInputValue("");
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // For hero section with inline editing
  if (enableInlineEditing && state.isSet && !isEditing) {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex gap-2">
          <div 
            className="flex-1 flex items-center gap-2 px-3 py-2 bg-white border border-neutral-200 rounded-md cursor-pointer hover:border-brand-300 transition-colors"
            onClick={handleEditClick}
          >
            <FeatherMapPin className="w-4 h-4 text-brand-600" />
            <span className="text-body font-body text-default-font flex-1">
              {state.location}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClearLocation();
              }}
              className="p-1 hover:bg-neutral-100 rounded transition-colors"
              title="Clear location"
            >
              <FeatherX className="w-4 h-4 text-subtext-color" />
            </button>
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
        </div>

        {/* Validation feedback for hero section */}
        {showValidation && (
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

        {/* Toast notifications */}
        {showToast && (
          <div className="fixed top-4 right-4 z-[300]">
            <Toast
              variant={toastType}
              title={toastType === "success" ? "Success" : toastType === "error" ? "Error" : "Warning"}
              description={toastMessage}
              actions={
                <button
                  onClick={() => setShowToast(false)}
                  className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                >
                  <FeatherX className="w-4 h-4" />
                </button>
              }
            />
          </div>
        )}
      </div>
    );
  }

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

          {/* Suggestions Dropdown - Extended beyond hero image */}
          {showSuggestions && suggestions.length > 0 && (
            <div 
              className="absolute left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-md shadow-lg max-h-48 overflow-y-auto"
              style={{ 
                top: '100%',
                zIndex: 9999, // Very high z-index to extend beyond hero
                position: 'fixed',
                width: containerRef.current?.getBoundingClientRect().width || 'auto',
                left: containerRef.current?.getBoundingClientRect().left || 0,
              }}
            >
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
            <div 
              className="absolute left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-md shadow-lg p-3"
              style={{ 
                top: '100%',
                zIndex: 9999,
                position: 'fixed',
                width: containerRef.current?.getBoundingClientRect().width || 'auto',
                left: containerRef.current?.getBoundingClientRect().left || 0,
              }}
            >
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

      {/* Toast notifications for non-validation mode */}
      {!showValidation && showToast && (
        <div className="fixed top-4 right-4 z-[300]">
          <Toast
            variant={toastType}
            title={toastType === "success" ? "Success" : toastType === "error" ? "Error" : "Warning"}
            description={toastMessage}
            actions={
              <button
                onClick={() => setShowToast(false)}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
              >
                <FeatherX className="w-4 h-4" />
              </button>
            }
          />
        </div>
      )}
    </div>
  );
};

export default LocationSearchField;