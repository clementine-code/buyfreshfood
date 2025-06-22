"use client";
import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import PasswordProtection from "./components/PasswordProtection";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Sell from "./pages/Sell";
import Waitlist from "./pages/Waitlist";
import ProductDetail from "./pages/ProductDetail";

function AppContent() {
  const location = useLocation();
  const isMarketplacePage = location.pathname === '/shop';

  return (
    <DefaultPageLayout enableMarketplaceMode={isMarketplacePage}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/sell" element={<Sell />} />
        <Route path="/waitlist" element={<Waitlist />} />
        <Route path="/product/:id" element={<ProductDetail />} />
      </Routes>
    </DefaultPageLayout>
  );
}

function App() {
  return (
    <PasswordProtection>
      <Router>
        <ScrollToTop />
        <AppContent />
      </Router>
    </PasswordProtection>
  );
}

export default App;