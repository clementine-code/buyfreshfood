"use client";
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import { LocationProvider } from "./contexts/LocationContext";
import { WaitlistProvider } from "./contexts/WaitlistContext";
import PasswordProtection from "./components/PasswordProtection";
import ScrollToTop from "./components/ScrollToTop";
import WaitlistModal from "./components/WaitlistModal";
import LocationCollectionModal from "./components/LocationCollectionModal";
import ThankYouModal from "./components/ThankYouModal";
import { useWaitlistContext } from "./contexts/WaitlistContext";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Sell from "./pages/Sell";
import Waitlist from "./pages/Waitlist";
import ProductDetail from "./pages/ProductDetail";

function WaitlistModals() {
  const { state, closeAllModals, openWaitlistModal, openLocationModal } = useWaitlistContext();

  const handleLocationConfirm = (locationData: any) => {
    openWaitlistModal(locationData);
  };

  const handleJoinDifferentLocation = () => {
    openLocationModal();
  };

  return (
    <>
      <LocationCollectionModal
        isOpen={state.isLocationModalOpen}
        onClose={closeAllModals}
        onConfirm={handleLocationConfirm}
      />
      
      <WaitlistModal />
      
      <ThankYouModal
        isOpen={state.isThankYouModalOpen}
        onClose={closeAllModals}
        waitlistedLocation={state.waitlistedEntry?.location || ''}
        onJoinDifferentLocation={handleJoinDifferentLocation}
      />
    </>
  );
}

function AppContent() {
  const location = useLocation();
  const isMarketplacePage = location.pathname === '/shop';

  return (
    <>
      <DefaultPageLayout enableMarketplaceMode={isMarketplacePage}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/sell" element={<Sell />} />
          <Route path="/waitlist" element={<Waitlist />} />
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </DefaultPageLayout>
      <WaitlistModals />
    </>
  );
}

function App() {
  return (
    <PasswordProtection>
      <LocationProvider>
        <WaitlistProvider>
          <Router>
            <ScrollToTop />
            <AppContent />
          </Router>
        </WaitlistProvider>
      </LocationProvider>
    </PasswordProtection>
  );
}

export default App;