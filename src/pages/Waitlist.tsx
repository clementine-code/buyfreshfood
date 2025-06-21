"use client";

import React, { useState } from "react";
import { TextField } from "@/ui/components/TextField";
import { Button } from "@/ui/components/Button";
import { Alert } from "@/ui/components/Alert";
import { Badge } from "@/ui/components/Badge";
import { FeatherMapPin, FeatherMail, FeatherBell, FeatherHeart, FeatherTruck, FeatherUsers } from "@subframe/core";
import LocationSearch from "../components/LocationSearch";
import Footer from "../components/Footer";
import { type LocationData } from "../services/locationService";

function Waitlist() {
  const [email, setEmail] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLocationSelect = (location: LocationData) => {
    setSelectedLocation(location);
  };

  const handleLocationError = (error: string) => {
    console.warn('Location error:', error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !selectedLocation) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  const isValidEmail = email.includes('@') && email.includes('.');
  const canSubmit = isValidEmail && selectedLocation && !isSubmitting;

  if (isSubmitted) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-8 bg-default-background min-h-screen px-4 py-16">
        <div className="w-full max-w-2xl text-center">
          <div className="flex justify-center mb-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success-100">
              <FeatherBell className="h-10 w-10 text-success-600" />
            </div>
          </div>
          
          <h1 className="text-heading-1 font-heading-1 text-default-font mb-4">
            You're on the list! 🎉
          </h1>
          
          <p className="text-body font-body text-subtext-color mb-8 max-w-lg mx-auto">
            We'll notify you as soon as Fresh Local Food expands to {selectedLocation?.city}, {selectedLocation?.state}. 
            You'll be among the first to discover amazing local producers in your area.
          </p>

          <div className="bg-brand-50 rounded-lg p-6 mb-8">
            <h3 className="text-heading-3 font-heading-3 text-brand-700 mb-3">
              What happens next?
            </h3>
            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3">
                <FeatherMail className="w-5 h-5 text-brand-600 mt-0.5 flex-shrink-0" />
                <span className="text-body font-body text-brand-700">
                  We'll send you updates on our expansion progress
                </span>
              </div>
              <div className="flex items-start gap-3">
                <FeatherUsers className="w-5 h-5 text-brand-600 mt-0.5 flex-shrink-0" />
                <span className="text-body font-body text-brand-700">
                  You'll get early access when we launch in your area
                </span>
              </div>
              <div className="flex items-start gap-3">
                <FeatherHeart className="w-5 h-5 text-brand-600 mt-0.5 flex-shrink-0" />
                <span className="text-body font-body text-brand-700">
                  Help us connect with local producers near you
                </span>
              </div>
            </div>
          </div>

          <Button
            onClick={() => window.location.href = '/'}
            className="h-12"
            size="large"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center justify-center gap-8 bg-default-background min-h-screen">
      {/* Hero Section */}
      <div className="flex w-full flex-col items-center justify-center gap-12 px-4 py-16 max-w-4xl">
        <div className="text-center">
          <Badge variant="warning" className="mb-4">
            Coming Soon
          </Badge>
          
          <h1 className="text-heading-1 font-heading-1 text-default-font mb-4">
            Fresh Local Food is expanding!
          </h1>
          
          <p className="text-body font-body text-subtext-color max-w-2xl mx-auto mb-8">
            We're currently serving the Northwest Arkansas metro area, but we're working hard to bring 
            fresh local food to more communities. Join our waitlist to be notified when we launch in your area.
          </p>
        </div>

        {/* Current Service Area */}
        <div className="w-full max-w-2xl bg-brand-50 rounded-lg p-6 border border-brand-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600">
              <FeatherTruck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-heading-3 font-heading-3 text-brand-700">
                Currently Serving
              </h3>
              <p className="text-body font-body text-brand-600">
                Northwest Arkansas Metro Area
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['Fayetteville', 'Rogers', 'Bentonville', 'Springdale', 'Bella Vista', 'Siloam Springs', 'Prairie Grove', 'Farmington'].map((city) => (
              <div key={city} className="text-caption font-caption text-brand-700 bg-brand-100 rounded px-2 py-1 text-center">
                {city}
              </div>
            ))}
          </div>
        </div>

        {/* Waitlist Form */}
        <div className="w-full max-w-lg bg-white rounded-lg shadow-lg border border-neutral-200 p-8">
          <div className="text-center mb-6">
            <h2 className="text-heading-2 font-heading-2 text-default-font mb-2">
              Join the Waitlist
            </h2>
            <p className="text-body font-body text-subtext-color">
              Be the first to know when we expand to your area
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Location Input */}
            <div>
              <label className="block text-caption-bold font-caption-bold text-default-font mb-2">
                Your Location
              </label>
              <LocationSearch
                className="w-full"
                onLocationSelect={handleLocationSelect}
                onLocationError={handleLocationError}
                placeholder="Enter your city, state, or zip code..."
                showValidation={true}
              />
              {selectedLocation && !selectedLocation.isNWA && (
                <div className="mt-2 p-3 bg-warning-50 border border-warning-200 rounded-md">
                  <div className="flex items-start gap-2">
                    <FeatherMapPin className="w-4 h-4 text-warning-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-caption-bold font-caption-bold text-warning-800">
                        {selectedLocation.city}, {selectedLocation.state} {selectedLocation.zipCode}
                      </div>
                      <div className="text-caption font-caption text-warning-700">
                        Not currently in our service area
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {selectedLocation && selectedLocation.isNWA && (
                <Alert
                  variant="success"
                  title="Great news!"
                  description="We already serve your area! You can start shopping for fresh local food right now."
                />
              )}
            </div>

            {/* Email Input */}
            <div>
              <TextField
                label="Email Address"
                error={email.length > 0 && !isValidEmail}
                helpText={email.length > 0 && !isValidEmail ? "Please enter a valid email address" : "We'll only use this to notify you about our expansion"}
                icon={<FeatherMail />}
              >
                <TextField.Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </TextField>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12"
              size="large"
              disabled={!canSubmit}
              loading={isSubmitting}
            >
              {isSubmitting ? 'Joining Waitlist...' : 'Join Waitlist'}
            </Button>

            {/* Already in service area redirect */}
            {selectedLocation && selectedLocation.isNWA && (
              <div className="text-center pt-4 border-t border-neutral-200">
                <p className="text-body font-body text-subtext-color mb-3">
                  Since we already serve your area:
                </p>
                <Button
                  onClick={() => window.location.href = '/shop'}
                  variant="brand-secondary"
                  className="w-full"
                >
                  Start Shopping Now
                </Button>
              </div>
            )}
          </form>
        </div>

        {/* Benefits Section */}
        <div className="w-full max-w-3xl">
          <h3 className="text-heading-2 font-heading-2 text-default-font text-center mb-8">
            Why join our waitlist?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sunny-100 mx-auto mb-4">
                <FeatherBell className="h-6 w-6 text-sunny-600" />
              </div>
              <h4 className="text-heading-3 font-heading-3 text-default-font mb-2">
                Early Access
              </h4>
              <p className="text-body font-body text-subtext-color">
                Be among the first to shop when we launch in your area
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-peach-100 mx-auto mb-4">
                <FeatherUsers className="h-6 w-6 text-peach-600" />
              </div>
              <h4 className="text-heading-3 font-heading-3 text-default-font mb-2">
                Local Connections
              </h4>
              <p className="text-body font-body text-subtext-color">
                Help us find and connect with producers in your community
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 mx-auto mb-4">
                <FeatherHeart className="h-6 w-6 text-brand-600" />
              </div>
              <h4 className="text-heading-3 font-heading-3 text-default-font mb-2">
                Special Offers
              </h4>
              <p className="text-body font-body text-subtext-color">
                Exclusive deals and promotions for waitlist members
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Waitlist;