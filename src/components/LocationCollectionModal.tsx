"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DialogLayout } from "@/ui/layouts/DialogLayout";
import { IconButton } from "@/ui/components/IconButton";
import { TextField } from "@/ui/components/TextField";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { Alert } from "@/ui/components/Alert";
import { 
  FeatherX, 
  FeatherMapPin, 
  FeatherLocate, 
  FeatherCheckCircle,
  FeatherClock,
  FeatherAlertCircle,
  FeatherEdit3,
  FeatherTrash2
} from "@subframe/core";
import { useLocationContext } from "../contexts/LocationContext";
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
  const { state: locationState, setLocation, clearLocation } = useLocationContext();
  
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
  const [modalState, setModalState] = useState<'empty' | 'loading' | 'launching' | 'coming-soon' | 'error' | 'saved'>('empty');

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  // Initialize form when modal opens
  useEffect(() => {
    if (open) {
      if (locationState.isSet && mode === 'edit') {
        setInputValue(locationState.location || '');
        setValidatedLocation({
          isNWA: locationState.isNWA,
          city: locationState.city || '',
          state: locationState.state || '',
          zipCode: locationState.zipCode || '',
          formattedAddress: locationState.location,
          latitude: locationState.coordinates?.lat,
          longitude: locationState.coordinates?.lng
        });
        setModalState(locationState.isNWA ? 'launching' : 'coming-soon');
      } else {
        setInputValue('');
        setValidatedLocation(null);
        setModalState('empty');
      }
      setError('');
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
      
      // Focus input after modal animation
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open, locationState, mode]);

  // Fetch location suggestions
  const fetchSuggestions = useCallback(async (input: string) => {
    if (input.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoadingSuggestions(true);
    
    try {
      const results = await locationService.getLocationSuggestions(input);
      setSuggestions(results || []);
      setShowSuggestions(results.length > 0);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
      setError('Unable to search locations. Please try again.');
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  // Validate location from place ID
  const validateLocation = async (suggestion: LocationSuggestion) => {
    setIsValidating(true);
    setModalState('loading');
    setError('');
    
    try {
      const locationData = await locationService.getLocationDetails(suggestion.place_id, suggestion.coordinates);
      
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
        setError('Unable to validate location. Please try again.');
        setModalState('error');
      }
      
    } catch (error) {
      console.error('Error validating location:', error);
      setError('Unable to validate location. Please try again.');
      setModalState('error');
    } finally {
      setIsValidating(false);
    }
  };

  // Detect current location
  const detectCurrentLocation = async () => {
    setIsDetectingLocation(true);
    setModalState('loading');
    setError('');
    
    try {
      const locationData = await locationService.getCurrentLocation();
      
      if (locationData) {
        setInputValue(locationData.formattedAddress || `${locationData.city}, ${locationData.state}`);
        setValidatedLocation(locationData);
        setModalState(locationData.isNWA ? 'launching' : 'coming-soon');
      } else {
        setError('Unable to determine your location. Please enter manually.');
        setModalState('error');
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      setError('Unable to access your location. Please enter manually.');
      setModalState('error');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Event handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setValidatedLocation(null);
    setError('');
    setSelectedIndex(-1);
    setModalState('empty');
    
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

  const handleSave = () => {
    if (validatedLocation) {
      // Update location in context
      setLocation(validatedLocation);
      
      // Call onConfirm if provided (for waitlist flow)
      if (onConfirm) {
        onConfirm(validatedLocation);
      }
      
      // Close modal after short delay to show success
      setModalState('saved');
      setTimeout(() => {
        onOpenChange(false);
      }, 1000);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleEdit = () => {
    setModalState('empty');
    inputRef.current?.focus();
  };

  const handleDelete = () => {
    setInputValue('');
    setValidatedLocation(null);
    clearLocation();
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
          <Alert
            variant="error"
            title="Location Error"
            description={error || 'Unable to find location. Please try again.'}
          />
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
    
    if (modalState === 'saved' && mode === 'edit') {
      return (
        <div className="flex w-full items-end justify-end gap-2">
          <Button 
            variant="neutral-secondary"
            icon={<FeatherEdit3 />}
            onClick={handleEdit}
          >
            Edit
          </Button>
          <Button 
            variant="destructive-secondary"
            icon={<FeatherTrash2 />}
            onClick={handleDelete}
          >
            Remove
          </Button>
        </div>
      );
    }

    return (
      <div className="flex w-full items-end justify-end gap-2">
        <Button 
          variant="neutral-tertiary" 
          onClick={handleCancel}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          disabled={!isFormValid}
          loading={isValidating}
        >
          {mode === 'edit' ? 'Update Location' : 
           forWaitlist ? 'Join Waitlist' : 'Continue'}
        </Button>
      </div>
    );
  };

  const getTitle = () => {
    if (mode === 'edit') return 'Update Your Location';
    if (forWaitlist) return 'Join Our Waitlist';
    return 'Enter Your Location';
  };

  const getDescription = () => {
    if (forWaitlist) return 'Enter your location to join our waitlist and be notified when we launch in your area.';
    return 'Enter your city, zip code, or address to find fresh local food near you.';
  };

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
              disabled={isDetectingLocation || isValidating || modalState === 'saved'}
            />
          </TextField>

          <IconButton 
            variant="neutral-secondary" 
            icon={<FeatherLocate />} 
            onClick={detectCurrentLocation}
            loading={isDetectingLocation}
            disabled={isDetectingLocation || isValidating || modalState === 'saved'}
          />

          {/* Suggestions Dropdown */}
          {showSuggestions && (suggestions.length > 0 || isLoadingSuggestions) && (
            <div 
              ref={suggestionsRef}
              className="absolute left-0 right-0 top-full mt-1 bg-white border border-neutral-200 rounded-md shadow-lg z-[9999] max-h-[200px] overflow-y-auto"
              style={{ width: 'calc(100% - 52px)' }} // Account for locate button
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