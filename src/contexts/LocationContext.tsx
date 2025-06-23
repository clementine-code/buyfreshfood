"use client";

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { locationService, type LocationData } from '../services/locationService';

// Location state interface
interface LocationState {
  location: string;
  isNWA: boolean;
  isSet: boolean;
  coordinates?: { lat: number; lng: number };
  city?: string;
  state?: string;
  zipCode?: string;
  isLoading: boolean;
  error?: string;
}

// Action types
type LocationAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LOCATION'; payload: LocationData }
  | { type: 'SET_LOCATION_STRING'; payload: string }
  | { type: 'CLEAR_LOCATION' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'RESTORE_FROM_STORAGE'; payload: LocationState };

// Initial state
const initialState: LocationState = {
  location: '',
  isNWA: false,
  isSet: false,
  isLoading: false,
};

// Reducer
function locationReducer(state: LocationState, action: LocationAction): LocationState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_LOCATION':
      const locationData = action.payload;
      return {
        ...state,
        location: locationData.formattedAddress || `${locationData.city}, ${locationData.state}`,
        isNWA: locationData.isNWA,
        isSet: true,
        coordinates: locationData.latitude && locationData.longitude 
          ? { lat: locationData.latitude, lng: locationData.longitude }
          : undefined,
        city: locationData.city,
        state: locationData.state,
        zipCode: locationData.zipCode,
        isLoading: false,
        error: undefined,
      };
    
    case 'SET_LOCATION_STRING':
      return {
        ...state,
        location: action.payload,
        isSet: action.payload.length > 0,
        isLoading: false,
        error: undefined,
      };
    
    case 'CLEAR_LOCATION':
      return {
        ...initialState,
        isLoading: false,
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: undefined,
      };
    
    case 'RESTORE_FROM_STORAGE':
      return action.payload;
    
    default:
      return state;
  }
}

// Context interface
interface LocationContextType {
  state: LocationState;
  setLocation: (location: string) => Promise<void>;
  setLocationData: (locationData: LocationData) => void;
  clearLocation: () => void;
  detectCurrentLocation: () => Promise<void>;
  clearError: () => void;
}

// Create context
const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Storage key
const STORAGE_KEY = 'fresh_food_location';

// Provider component
interface LocationProviderProps {
  children: ReactNode;
}

export function LocationProvider({ children }: LocationProviderProps) {
  const [state, dispatch] = useReducer(locationReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedState = JSON.parse(stored);
        // Validate the stored state has required properties
        if (parsedState && typeof parsedState === 'object') {
          dispatch({ type: 'RESTORE_FROM_STORAGE', payload: { ...initialState, ...parsedState } });
        }
      }
    } catch (error) {
      console.warn('Failed to restore location from storage:', error);
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (state.isSet) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (error) {
        console.warn('Failed to save location to storage:', error);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [state]);

  // Set location by string (validates and geocodes)
  const setLocation = async (location: string) => {
    if (!location.trim()) {
      dispatch({ type: 'CLEAR_LOCATION' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      // First, try to validate the location
      const locationData = await locationService.validateLocationInput(location.trim());
      
      if (locationData) {
        dispatch({ type: 'SET_LOCATION', payload: locationData });
      } else {
        // If validation fails, just store the string
        dispatch({ type: 'SET_LOCATION_STRING', payload: location.trim() });
      }
    } catch (error) {
      console.error('Error setting location:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Unable to validate location. Please try again.' });
      // Still store the string even if validation fails
      dispatch({ type: 'SET_LOCATION_STRING', payload: location.trim() });
    }
  };

  // Set location from LocationData object
  const setLocationData = (locationData: LocationData) => {
    dispatch({ type: 'SET_LOCATION', payload: locationData });
  };

  // Clear location
  const clearLocation = () => {
    dispatch({ type: 'CLEAR_LOCATION' });
  };

  // Detect current location using geolocation
  const detectCurrentLocation = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const locationData = await locationService.getCurrentLocation();
      
      if (locationData) {
        dispatch({ type: 'SET_LOCATION', payload: locationData });
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Unable to detect your location. Please enter it manually.' });
      }
    } catch (error) {
      console.error('Error detecting location:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Location access denied. Please enter your location manually.' });
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const contextValue: LocationContextType = {
    state,
    setLocation,
    setLocationData,
    clearLocation,
    detectCurrentLocation,
    clearError,
  };

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
}

// Custom hooks
export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context.state;
}

export function useLocationActions() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocationActions must be used within a LocationProvider');
  }
  return {
    setLocation: context.setLocation,
    setLocationData: context.setLocationData,
    clearLocation: context.clearLocation,
    detectCurrentLocation: context.detectCurrentLocation,
    clearError: context.clearError,
  };
}

export function useLocationContext() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
}