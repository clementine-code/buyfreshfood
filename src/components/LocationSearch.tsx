"use client";

import React, { useState } from "react";
import { TextField } from "@/ui/components/TextField";
import { FeatherMapPin, FeatherLocate } from "@subframe/core";

interface LocationSearchProps {
  className?: string;
  onLocationSelect?: (location: string) => void;
}

interface LocationSuggestion {
  place_name: string;
  center: [number, number];
}

const LocationSearch: React.FC<LocationSearchProps> = ({ 
  className, 
  onLocationSelect 
}) => {
  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounce function for API calls
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Search for locations using Mapbox Geocoding API
  const searchLocations = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoading(true);
    try {
      // Using Mapbox Geocoding API (you'll need to add your token)
      // For demo purposes, we'll simulate the API response
      const mockSuggestions: LocationSuggestion[] = [
        {
          place_name: `${query}, Arkansas, United States`,
          center: [-94.1574, 36.1627]
        },
        {
          place_name: `${query}, United States`,
          center: [-94.1574, 36.1627]
        },
        {
          place_name: `Near ${query}`,
          center: [-94.1574, 36.1627]
        }
      ];

      setSuggestions(mockSuggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error searching locations:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search function
  const debouncedSearch = debounce(searchLocations, 300);

  const handleLocationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setLocation(value);
    debouncedSearch(value);
  };

  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    setLocation(suggestion.place_name);
    setSuggestions([]);
    setShowSuggestions(false);
    onLocationSelect?.(suggestion.place_name);
  };

  const handleLocateClick = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // In a real app, you'd reverse geocode these coordinates
          // For demo, we'll use a mock location
          const mockLocation = "Your Current Location, Fayetteville, AR";
          setLocation(mockLocation);
          onLocationSelect?.(mockLocation);
        } catch (error) {
          console.error('Error getting location name:', error);
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location. Please enter it manually.');
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  return (
    <div className={`relative ${className}`}>
      <TextField
        className="h-auto w-full flex-none"
        variant="filled"
        label=""
        helpText=""
        icon={<FeatherMapPin />}
        iconRight={
          <button
            onClick={handleLocateClick}
            disabled={isLoading}
            className="flex items-center justify-center hover:bg-neutral-100 rounded p-1 transition-colors disabled:opacity-50"
            title="Use my current location"
          >
            <FeatherLocate className={`w-4 h-4 ${isLoading ? 'animate-pulse' : ''}`} />
          </button>
        }
      >
        <TextField.Input
          placeholder="Enter location to find fresh local food..."
          value={location}
          onChange={handleLocationChange}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
        />
      </TextField>

      {/* Location Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="w-full text-left px-3 py-2 hover:bg-neutral-50 border-b border-neutral-100 last:border-b-0 text-body font-body text-default-font"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="flex items-center gap-2">
                <FeatherMapPin className="w-4 h-4 text-subtext-color flex-shrink-0" />
                <span className="truncate">{suggestion.place_name}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-md shadow-lg z-50 p-3">
          <div className="flex items-center gap-2 text-subtext-color">
            <div className="w-4 h-4 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-body font-body">Searching...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSearch;