"use client";

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DefaultPageLayout } from "@/ui/layouts/DefaultPageLayout";
import PasswordProtection from "./components/PasswordProtection";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Sell from "./pages/Sell";

function App() {
  return (
    <PasswordProtection>
      <Router>
        <DefaultPageLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/sell" element={<Sell />} />
          </Routes>
        </DefaultPageLayout>
      </Router>
    </PasswordProtection>
  );
}

export default App;