"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { TextField } from "@/ui/components/TextField";
import { Button } from "@/ui/components/Button";
import { Alert } from "@/ui/components/Alert";
import { Toast } from "@/ui/components/Toast";
import { FeatherMapPin, FeatherLocate, FeatherX, FeatherEdit3 } from "@subframe/core";
import { useLocationContext } from "../contexts/LocationContext";
import { locationService, type LocationSuggestion } from "../services/locationService";

interface LocationSearchFieldProps {
  className?: string;
  placeholder?: string;
  showValidation?: boolean;
  autoFocus?: boolean;
  enableInlineEditing?: boolean;
}

const LocationSearchField: React.FC<LocationSearchFieldProps> = ({
  className,
  placeholder = "Enter your location to find fresh local food near you...",
  showValidation = true,
  autoFocus = false,
  enableInlineEditing = false,
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
  const suggestionsRef = useRef<HTMLDivElement>(null);

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

  // Auto-dismiss toast
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Search for location suggestions with improved error handling
  const searchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    console.log('🔍 Searching suggestions for:', query);
    setIsLoadingSuggestions(true);
    
    try {
      const results = await locationService.getLocationSuggestions(query);
      console.log('✅ Got suggestions:', results.length);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('❌ Error fetching location suggestions:', error);
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

    // Check if there's enough space below
    const spaceBelow = viewportHeight - containerRect.bottom;
    const spaceAbove = containerRect.top;

    if (spaceBelow >= 200 || spaceBelow > spaceAbove) {
      // Position below
      position.top = containerRect.bottom + 4;
    } else {
      // Position above
      position.bottom = viewportHeight - containerRect.top + 4;
    }

    // Ensure it doesn't go off screen horizontally
    if (containerRect.left + containerRect.width > viewportWidth) {
      position.right = 16;
      position.left = 'auto';
      position.width = Math.min(containerRect.width, viewportWidth - 32);
    }

    return position;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || state.isLoading) return;

    console.log('📝 Submitting location:', inputValue.trim());
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
      console.error('❌ Error setting location:', error);
      if (!showValidation) {
        setToastMessage("Failed to update location. Please try again.");
        setToastType("error");
        setShowToast(true);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('✏️ Input changed:', value);
    setInputValue(value);
    setIsEditing(true);
    
    // Clear error when user starts typing
    if (state.error) {
      clearError();
    }

    // Debounce search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        searchSuggestions(value.trim());
      }, 200);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = async (suggestion: LocationSuggestion) => {
    console.log('👆 Suggestion clicked:', suggestion);
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
      console.error('❌ Error selecting suggestion:', error);
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
    console.log('📍 Detecting current location...');
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
      console.error('❌ Error detecting location:', error);
      if (!showValidation) {
        setToastMessage("Unable to detect location. Please enter manually.");
        setToastType("error");
        setShowToast(true);
      }
    }
  };

  const handleInputFocus = () => {
    console.log('🎯 Input focused');
    setIsEditing(true);
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
      
      // If not editing and has location, revert to display mode
      if (!isEditing && state.location && enableInlineEditing) {
        setInputValue(state.location);
      }
    }, 150);
  };

  const handleEditClick = () => {
    console.log('✏️ Edit clicked');
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  };

  const handleClearLocation = () => {
    console.log('🗑️ Clear location clicked');
    clearLocation();
    setInputValue("");
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
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
            className="flex-1 flex items-center gap-3 px-4 py-3 bg-white border border-neutral-200 rounded-md cursor-pointer hover:border-brand-300 hover:shadow-sm transition-all duration-200"
            onClick={handleEditClick}
          >
            <FeatherMapPin className="w-5 h-5 text-brand-600 flex-shrink-0" />
            <span className="text-body font-body text-default-font flex-1 truncate">
              {state.location}
            </span>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick();
                }}
                className="p-1.5 hover:bg-neutral-100 rounded transition-colors"
                title="Edit location"
              >
                <FeatherEdit3 className="w-4 h-4 text-subtext-color" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearLocation();
                }}
                className="p-1.5 hover:bg-neutral-100 rounded transition-colors"
                title="Clear location"
              >
                <FeatherX className="w-4 h-4 text-subtext-color" />
              </button>
            </div>
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
      </div>
    );
  }

  return (
    <div className={`space-y-3 relative ${className}`} ref={containerRef}>
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
              spellCheck={false}
            />
          </TextField>
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

     {/* Suggestions Dropdown - Simplified positioning */}
{showSuggestions && (suggestions.length > 0 || isLoadingSuggestions) && (
  <div 
    ref={suggestionsRef}
    className="absolute left-0 right-0 bg-white border border-neutral-200 rounded-md shadow-lg"
    style={{ 
      top: '100%',
      marginTop: '4px',
      zIndex: 9999,
      maxHeight: '200px',
      overflowY: 'auto'
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
};

export default LocationSearchField;