"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { LocationData } from '../services/locationService';

interface WaitlistState {
  isModalOpen: boolean;
  modalType: 'geographic' | 'early_access' | null;
  isSuccessView: boolean;
  queueNumber: number | null;
  currentLocationData: LocationData | null;
  submissionData: any;
}

interface WaitlistContextType {
  state: WaitlistState;
  openWaitlistModal: (type: 'geographic' | 'early_access', locationData: LocationData) => void;
  closeWaitlistModal: () => void;
  showSuccessView: (queueNumber: number, submissionData?: any) => void;
  resetToForm: () => void;
}

const WaitlistContext = createContext<WaitlistContextType | undefined>(undefined);

const initialState: WaitlistState = {
  isModalOpen: false,
  modalType: null,
  isSuccessView: false,
  queueNumber: null,
  currentLocationData: null,
  submissionData: null
};

export function WaitlistProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WaitlistState>(initialState);

  const openWaitlistModal = (type: 'geographic' | 'early_access', locationData: LocationData) => {
    setState({
      ...initialState,
      isModalOpen: true,
      modalType: type,
      currentLocationData: locationData,
      isSuccessView: false
    });
  };

  const closeWaitlistModal = () => {
    setState(initialState);
  };

  const showSuccessView = (queueNumber: number, submissionData?: any) => {
    setState(prev => ({
      ...prev,
      isSuccessView: true,
      queueNumber,
      submissionData
    }));
  };

  const resetToForm = () => {
    setState(prev => ({
      ...prev,
      isSuccessView: false,
      queueNumber: null,
      submissionData: null
    }));
  };

  const contextValue: WaitlistContextType = {
    state,
    openWaitlistModal,
    closeWaitlistModal,
    showSuccessView,
    resetToForm
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