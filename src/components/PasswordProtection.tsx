"use client";

import React, { useState, useEffect } from "react";
import { TextField } from "@/ui/components/TextField";
import { Button } from "@/ui/components/Button";
import { Alert } from "@/ui/components/Alert";
import { FeatherLock, FeatherEye, FeatherEyeOff, FeatherShield } from "@subframe/core";

interface PasswordProtectionProps {
  children: React.ReactNode;
}

const PasswordProtection: React.FC<PasswordProtectionProps> = ({ children }) => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = () => {
      try {
        const sessionData = localStorage.getItem("fresh_food_staging_auth");
        if (sessionData) {
          const { timestamp, authenticated } = JSON.parse(sessionData);
          const now = Date.now();
          
          // Check if session is still valid (within 24 hours)
          if (authenticated && (now - timestamp) < 24 * 60 * 60 * 1000) {
            setIsAuthenticated(true);
            return;
          } else {
            // Session expired, clear it
            localStorage.removeItem("fresh_food_staging_auth");
          }
        }
      } catch (error) {
        // Invalid session data, clear it
        localStorage.removeItem("fresh_food_staging_auth");
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate a brief loading state for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    if (password === "dominatefreshfoodmarket2025") {
      // Store session
      const sessionData = {
        authenticated: true,
        timestamp: Date.now()
      };
      localStorage.setItem("fresh_food_staging_auth", JSON.stringify(sessionData));
      setIsAuthenticated(true);
    } else {
      setError("Incorrect password. Please try again.");
      setPassword("");
    }
    
    setIsLoading(false);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError(""); // Clear error when user starts typing
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // If authenticated, render the main app
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Render password protection screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-sunny-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 shadow-lg">
              <FeatherShield className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-heading-1 font-heading-1 text-default-font mb-2">
            Staging Environment
          </h1>
          <p className="text-body font-body text-subtext-color">
            Fresh Local Food Marketplace
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-lg border border-neutral-200 p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <FeatherLock className="h-5 w-5 text-brand-600" />
              <h2 className="text-heading-2 font-heading-2 text-default-font">
                Access Required
              </h2>
            </div>
            <p className="text-body font-body text-subtext-color">
              This is a staging environment. Please enter the password to continue.
            </p>
          </div>

          {error && (
            <div className="mb-4">
              <Alert variant="error" title="Authentication Failed" description={error} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              label="Password"
              error={!!error}
              className="w-full"
              icon={<FeatherLock />}
              iconRight={
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="flex items-center justify-center hover:bg-neutral-100 rounded p-1 transition-colors"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <FeatherEyeOff className="w-4 h-4 text-subtext-color" />
                  ) : (
                    <FeatherEye className="w-4 h-4 text-subtext-color" />
                  )}
                </button>
              }
            >
              <TextField.Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter staging password"
                value={password}
                onChange={handlePasswordChange}
                disabled={isLoading}
                autoComplete="current-password"
                autoFocus
              />
            </TextField>

            <Button
              type="submit"
              className="w-full h-12"
              size="large"
              loading={isLoading}
              disabled={!password.trim() || isLoading}
            >
              {isLoading ? "Authenticating..." : "Access Staging Environment"}
            </Button>
          </form>

          {/* Footer Info */}
          <div className="mt-6 pt-4 border-t border-neutral-200">
            <div className="flex items-center justify-center gap-2 text-caption font-caption text-subtext-color">
              <FeatherShield className="h-3 w-3" />
              <span>Protected staging environment</span>
            </div>
          </div>
        </div>

        {/* Environment Badge */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-warning-100 text-warning-800 rounded-full text-caption font-caption">
            <div className="w-2 h-2 bg-warning-600 rounded-full animate-pulse"></div>
            Staging Environment
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordProtection;