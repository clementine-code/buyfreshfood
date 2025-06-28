"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { LocationData } from '../services/locationService';

interface WaitlistEntry {
  id: string;
  email: string;
  location: string;
  city: string;
  state: string;
  waitlist_type: 'geographic' | 'early_access';
  created_at: string;
}

interface WaitlistState {
  // Modal states
  isLocationModalOpen: boolean;
  isWaitlistModalOpen: boolean;
  isThankYouModalOpen: boolean;
  isSuccessView: boolean;
  
  // Data states
  modalType: 'geographic' | 'early_access' | null;
  currentLocationData: LocationData | null;
  queueNumber: number | null;
  submissionData: any;
  
  // User waitlist status
  isUserWaitlisted: boolean;
  waitlistedEntry: WaitlistEntry | null;
  
  // New: Options for modal behavior
  collectLocationInModal: boolean;
}

interface WaitlistContextType {
  state: WaitlistState;
  
  // Main flow orchestrator - UPDATED with options parameter
  openWaitlistFlow: (type: 'geographic' | 'early_access', locationData?: LocationData, options?: { collectLocationInModal?: boolean }) => Promise<void>;
  
  // Modal controls
  closeAllModals: () => void;
  openLocationModal: () => void;
  openWaitlistModal: (locationData: LocationData) => void;
  openThankYouModal: (waitlistedEntry: WaitlistEntry) => void;
  
  // Success flow
  showSuccessView: (queueNumber: number, submissionData?: any) => void;
  resetToForm: () => void;
  
  // Waitlist status management
  setWaitlistedEntry: (entry: WaitlistEntry) => void;
  clearWaitlistedEntry: () => void;
}

const WaitlistContext = createContext<WaitlistContextType | undefined>(undefined);

const STORAGE_KEY = 'fresh_food_waitlist_entry';

const initialState: WaitlistState = {
  isLocationModalOpen: false,
  isWaitlistModalOpen: false,
  isThankYouModalOpen: false,
  isSuccessView: false,
  modalType: null,
  currentLocationData: null,
  queueNumber: null,
  submissionData: null,
  isUserWaitlisted: false,
  waitlistedEntry: null,
  collectLocationInModal: false
};

export function WaitlistProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WaitlistState>(initialState);

  // Load waitlisted entry from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const entry = JSON.parse(stored);
        setState(prev => ({
          ...prev,
          isUserWaitlisted: true,
          waitlistedEntry: entry
        }));
      }
    } catch (error) {
      console.warn('Failed to restore waitlist entry from storage:', error);
    }
  }, []);

  // Main flow orchestrator - UPDATED to handle options
  const openWaitlistFlow = async (type: 'geographic' | 'early_access', locationData?: LocationData, options?: { collectLocationInModal?: boolean }) => {
    console.log('🚀 Opening waitlist flow:', type, locationData, options);

    // If we have a waitlisted entry and it matches the current context, show thank you modal
    if (state.waitlistedEntry) {
      const isMatchingLocation = locationData ? 
        state.waitlistedEntry.location === locationData.formattedAddress ||
        state.waitlistedEntry.city === locationData.city :
        true;

      if (isMatchingLocation) {
        openThankYouModal(state.waitlistedEntry);
        return;
      }
    }

    // Store the type and options for later use
    setState(prev => ({ 
      ...prev, 
      modalType: type,
      collectLocationInModal: options?.collectLocationInModal || false
    }));

    // If we should collect location in modal OR no location data provided, go directly to waitlist modal
    if (options?.collectLocationInModal || !locationData) {
      console.log('📍 Opening waitlist modal for location collection');
      setState(prev => ({
        ...prev,
        isLocationModalOpen: false,
        isWaitlistModalOpen: true,
        isThankYouModalOpen: false,
        isSuccessView: false,
        currentLocationData: locationData || null
      }));
    } else {
      // We have location data, go directly to waitlist modal
      openWaitlistModal(locationData);
    }
  };

  const openLocationModal = () => {
    setState(prev => ({
      ...prev,
      isLocationModalOpen: true,
      isWaitlistModalOpen: false,
      isThankYouModalOpen: false,
      isSuccessView: false
    }));
  };

  const openWaitlistModal = (locationData: LocationData) => {
    setState(prev => ({
      ...prev,
      isLocationModalOpen: false,
      isWaitlistModalOpen: true,
      isThankYouModalOpen: false,
      isSuccessView: false,
      currentLocationData: locationData
    }));
  };

  const openThankYouModal = (waitlistedEntry: WaitlistEntry) => {
    setState(prev => ({
      ...prev,
      isLocationModalOpen: false,
      isWaitlistModalOpen: false,
      isThankYouModalOpen: true,
      isSuccessView: false,
      waitlistedEntry
    }));
  };

  const closeAllModals = () => {
    setState(prev => ({
      ...prev,
      isLocationModalOpen: false,
      isWaitlistModalOpen: false,
      isThankYouModalOpen: false,
      isSuccessView: false,
      modalType: null,
      currentLocationData: null,
      queueNumber: null,
      submissionData: null,
      collectLocationInModal: false
    }));
  };

  const showSuccessView = (queueNumber: number, submissionData?: any) => {
    setState(prev => ({
      ...prev,
      isSuccessView: true,
      queueNumber,
      submissionData
    }));

    // If we have submission data, store it as waitlisted entry
    if (submissionData) {
      setWaitlistedEntry(submissionData);
    }
  };

  const resetToForm = () => {
    setState(prev => ({
      ...prev,
      isSuccessView: false,
      queueNumber: null,
      submissionData: null
    }));
  };

  const setWaitlistedEntry = (entry: WaitlistEntry) => {
    setState(prev => ({
      ...prev,
      isUserWaitlisted: true,
      waitlistedEntry: entry
    }));

    // Persist to localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
    } catch (error) {
      console.warn('Failed to save waitlist entry to storage:', error);
    }
  };

  const clearWaitlistedEntry = () => {
    setState(prev => ({
      ...prev,
      isUserWaitlisted: false,
      waitlistedEntry: null
    }));

    // Remove from localStorage
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to remove waitlist entry from storage:', error);
    }
  };

  const contextValue: WaitlistContextType = {
    state,
    openWaitlistFlow,
    closeAllModals,
    openLocationModal,
    openWaitlistModal,
    openThankYouModal,
    showSuccessView,
    resetToForm,
    setWaitlistedEntry,
    clearWaitlistedEntry
  };

  return (
    <WaitlistContext.Provider value={contextValue}>
      {children}
    </WaitlistContext.Provider>
  );
}

export function useWaitlistContext() {
  const context = useContext(WaitlistContext);
  if (context === undefined) {
    throw new Error('useWaitlistContext must be used within a WaitlistProvider');
  }
  return context;
}