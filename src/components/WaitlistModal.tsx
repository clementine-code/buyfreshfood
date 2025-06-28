"use client";

import React, { useState, useEffect } from "react";
import { DialogLayout } from "@/ui/layouts/DialogLayout";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { Badge } from "@/ui/components/Badge";
import { FeatherArrowRight } from "@subframe/core";
import { TextField } from "@/ui/components/TextField";
import { CheckboxCard } from "@/ui/components/CheckboxCard";
import { Button } from "@/ui/components/Button";
import { FeatherExternalLink, FeatherMapPin, FeatherEdit3 } from "@subframe/core";
import { useWaitlistContext } from "../contexts/WaitlistContext";
import { useLocationContext } from "../contexts/LocationContext";
import { submitWaitlist } from "../utils/waitlistUtils";
import { locationService, type LocationData } from "../services/locationService";
import { useNavigate } from "react-router-dom";

const WaitlistModal: React.FC = () => {
  const { state, closeAllModals, showSuccessView, openLocationModal } = useWaitlistContext();
  const { state: locationState, setLocationData } = useLocationContext();
  const navigate = useNavigate();

  // Form state
  const [email, setEmail] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [currentLocationData, setCurrentLocationData] = useState<LocationData | null>(null);
  const [previousLocationData, setPreviousLocationData] = useState<LocationData | null>(null);
  const [interests, setInterests] = useState({
    buying: false,
    selling: false,
    updates: false
  });
  const [productInterests, setProductInterests] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isValidatingLocation, setIsValidatingLocation] = useState(false);

  // Initialize form when modal opens
  useEffect(() => {
    if (state.isWaitlistModalOpen && !state.isSuccessView) {
      // Set location data from context or waitlist context
      const locationData = state.currentLocationData || (locationState.isSet ? {
        isNWA: locationState.isNWA,
        city: locationState.city || '',
        state: locationState.state || '',
        zipCode: locationState.zipCode || '',
        formattedAddress: locationState.location || '',
        latitude: locationState.coordinates?.lat,
        longitude: locationState.coordinates?.lng
      } : null);

      if (locationData) {
        setCurrentLocationData(locationData);
        setPreviousLocationData(locationData);
        setLocationInput(locationData.formattedAddress || 
                        `${locationData.city}, ${locationData.state}`);
      }
      
      // Reset form fields
      setEmail("");
      setInterests({
        buying: false,
        selling: false,
        updates: false
      });
      setProductInterests("");
      setError("");
      setIsEditingLocation(false);
    }
  }, [state.isWaitlistModalOpen, state.isSuccessView, state.currentLocationData, locationState]);

  // Check if location market has changed
  const hasLocationMarketChanged = (newLocation: LocationData, oldLocation: LocationData | null): boolean => {
    if (!oldLocation) return true;
    return newLocation.isNWA !== oldLocation.isNWA;
  };

  const handleLocationEdit = () => {
    setIsEditingLocation(true);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocationInput(e.target.value);
    setError("");
  };

  const handleLocationSave = async () => {
    if (!locationInput.trim()) return;

    setIsValidatingLocation(true);
    setError("");

    try {
      const locationData = await locationService.validateLocationInput(locationInput.trim());
      
      if (locationData) {
        console.log('🔄 Location validated:', locationData);
        console.log('📍 Previous location:', previousLocationData);
        
        // Check if market has changed
        const marketChanged = hasLocationMarketChanged(locationData, previousLocationData);
        
        console.log('🔄 Market changed:', marketChanged);
        
        if (marketChanged) {
          // Market changed - need to update waitlist type and restart flow
          console.log('🚀 Market changed, updating location and restarting waitlist flow');
          
          // Update location in context
          setLocationData(locationData);
          
          // Close current waitlist modal
          closeAllModals();
          
          // Determine new waitlist type
          const newWaitlistType = locationData.isNWA ? 'early_access' : 'geographic';
          
          // Restart waitlist flow with new location and type
          setTimeout(() => {
            // Import and use the openWaitlistFlow function
            const { openWaitlistFlow } = require('../contexts/WaitlistContext');
            if (openWaitlistFlow) {
              openWaitlistFlow(newWaitlistType, locationData);
            }
          }, 100);
          
          return;
        } else {
          // Same market - just update location data
          console.log('✅ Same market, updating location data');
          setCurrentLocationData(locationData);
          setLocationInput(locationData.formattedAddress || 
                          `${locationData.city}, ${locationData.state}`);
          setLocationData(locationData);
          setIsEditingLocation(false);
        }
      } else {
        setError('Unable to validate location. Please try a different address.');
      }
    } catch (err) {
      console.error('Error validating location:', err);
      setError('Failed to validate location. Please try again.');
    } finally {
      setIsValidatingLocation(false);
    }
  };

  const handleLocationCancel = () => {
    // Restore original location
    if (currentLocationData) {
      setLocationInput(currentLocationData.formattedAddress || 
                      `${currentLocationData.city}, ${currentLocationData.state}`);
    }
    setIsEditingLocation(false);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !currentLocationData || isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      const selectedInterests = Object.entries(interests)
        .filter(([_, selected]) => selected)
        .map(([key, _]) => key);

      const formData = {
        email: email.trim(),
        location: currentLocationData.formattedAddress || `${currentLocationData.city}, ${currentLocationData.state}`,
        city: currentLocationData.city,
        state: currentLocationData.state,
        zipCode: currentLocationData.zipCode,
        interests: selectedInterests,
        productInterests: productInterests.trim(),
        waitlistType: state.modalType || 'geographic'
      };

      const result = await submitWaitlist(formData);

      if (result.success) {
        showSuccessView(result.queuePosition, result.data);
      } else {
        setError(result.error || 'Failed to join waitlist. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting waitlist:', err);
      setError('Failed to join waitlist. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBrowseClick = () => {
    closeAllModals();
    navigate('/shop');
  };

  const handleMaybeLater = () => {
    closeAllModals();
  };

  const handleChangeLocation = () => {
    openLocationModal();
  };

  if (!state.isWaitlistModalOpen) return null;

  // Success View
  if (state.isSuccessView) {
    const isGeographic = state.modalType === 'geographic';
    const cityName = currentLocationData?.city || 'your area';
    
    return (
      <DialogLayout open={true} onOpenChange={closeAllModals}>
        <div className="flex h-full w-full flex-col items-center gap-8 rounded-md bg-default-background px-6 py-12">
          <div className="flex w-full max-w-[576px] flex-col items-center gap-6">
            <IconWithBackground variant="success" size="x-large" />
            <div className="flex flex-col items-center gap-2">
              <span className="text-heading-2 font-heading-2 text-default-font text-center">
                {isGeographic 
                  ? `You're #${state.queueNumber} in line for ${cityName}!`
                  : "You're on the early access list!"
                }
              </span>
              <span className="text-body font-body text-subtext-color text-center">
                {isGeographic
                  ? "We'll notify you as soon as we launch in your area"
                  : "We'll notify you when ordering goes live"
                }
              </span>
            </div>
            <Button
              className="h-10 w-full flex-none"
              size="large"
              onClick={handleBrowseClick}
            >
              Browse Marketplace
            </Button>
          </div>
        </div>
      </DialogLayout>
    );
  }

  // Form View
  const isGeographic = state.modalType === 'geographic';
  const cityName = currentLocationData?.city || 'your city';

  return (
    <DialogLayout open={true} onOpenChange={closeAllModals}>
      <div className="flex h-full w-full max-w-[576px] flex-col items-start gap-8 bg-default-background px-8 py-8 mobile:flex-col mobile:flex-nowrap mobile:gap-8">
        <div className="flex w-full flex-col items-start gap-4">
          <span className="text-heading-1 font-heading-1 text-default-font">
            {isGeographic 
              ? `🥕 Expand BuyFresh.Food marketplace to ${cityName}!`
              : "🚀 BuyFresh.Food is coming to Northwest Arkansas first!"
            }
          </span>
          <span className="text-body font-body text-subtext-color">
            {isGeographic
              ? "Join our waitlist to be first in line when we launch in your area. Get access to farm-fresh produce and local goods at better prices."
              : "We're launching in Northwest Arkansas first! Join our early access list to be among the first to order when we go live."
            }
          </span>
        </div>
        
        <div className="flex w-full flex-col items-center gap-4">
          <div className="flex w-full items-center justify-center gap-4">
            <Badge variant="success">
              Launching in Northwest Arkansas first!
            </Badge>
            <FeatherArrowRight className="text-body font-body text-subtext-color" />
            <Badge variant="warning">
              {isGeographic ? `Coming to ${cityName} Soon!` : "Early access launching soon!"}
            </Badge>
          </div>
          <span className="text-caption font-caption text-subtext-color">
            {isGeographic 
              ? `Join others bringing this to ${cityName}`
              : "Get early access in Northwest Arkansas"
            }
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex w-full flex-col items-start gap-6">
          <TextField
            className="h-auto w-full flex-none"
            variant="filled"
            label="Email address"
            helpText=""
            error={!!error}
          >
            <TextField.Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </TextField>
          
          {/* Location Field - Editable with Market Change Detection */}
          <div className="w-full">
            <label className="block text-caption-bold font-caption-bold text-default-font mb-2">
              Location
            </label>
            
            {!isEditingLocation ? (
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-3 px-3 py-2 bg-neutral-100 border border-neutral-200 rounded-md">
                  <FeatherMapPin className="w-4 h-4 text-subtext-color flex-shrink-0" />
                  <span className="text-body font-body text-default-font flex-1 truncate">
                    {locationInput}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="neutral-secondary"
                  size="small"
                  icon={<FeatherEdit3 />}
                  onClick={handleLocationEdit}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="neutral-tertiary"
                  size="small"
                  onClick={handleChangeLocation}
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <TextField
                  variant="filled"
                  icon={<FeatherMapPin />}
                  error={!!error}
                >
                  <TextField.Input
                    value={locationInput}
                    onChange={handleLocationChange}
                    placeholder="Enter city, state, or zip code..."
                    disabled={isValidatingLocation}
                  />
                </TextField>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="small"
                    onClick={handleLocationSave}
                    disabled={!locationInput.trim() || isValidatingLocation}
                    loading={isValidatingLocation}
                  >
                    {isValidatingLocation ? 'Validating...' : 'Save'}
                  </Button>
                  <Button
                    type="button"
                    variant="neutral-secondary"
                    size="small"
                    onClick={handleLocationCancel}
                    disabled={isValidatingLocation}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Market Change Warning */}
            {isEditingLocation && (
              <div className="mt-2 p-3 bg-warning-50 border border-warning-200 rounded-md">
                <div className="text-caption font-caption text-warning-800">
                  💡 <strong>Note:</strong> Changing to a different market area will restart your waitlist signup with the appropriate queue for that region.
                </div>
              </div>
            )}
          </div>
          
          <div className="flex w-full flex-col items-start gap-2">
            <span className="text-body-bold font-body-bold text-default-font">
              I'm interested in:
            </span>
            <CheckboxCard
              checked={interests.buying}
              onCheckedChange={(checked) => setInterests(prev => ({ ...prev, buying: checked }))}
            >
              <span className="text-body font-body text-default-font">
                Buying fresh food
              </span>
            </CheckboxCard>
            <CheckboxCard
              checked={interests.selling}
              onCheckedChange={(checked) => setInterests(prev => ({ ...prev, selling: checked }))}
            >
              <span className="text-body font-body text-default-font">
                Selling from my garden/farm
              </span>
            </CheckboxCard>
            <CheckboxCard
              checked={interests.updates}
              onCheckedChange={(checked) => setInterests(prev => ({ ...prev, updates: checked }))}
            >
              <span className="text-body font-body text-default-font">
                Just staying updated
              </span>
            </CheckboxCard>
          </div>
          
          <TextField
            className="h-auto w-full flex-none"
            variant="filled"
            label="What would you most like to find?"
            helpText="Examples: Fresh eggs, local honey, heirloom tomatoes"
          >
            <TextField.Input
              placeholder="Tell us what you're looking for..."
              value={productInterests}
              onChange={(e) => setProductInterests(e.target.value)}
            />
          </TextField>

          {error && (
            <div className="w-full p-3 bg-error-50 border border-error-200 rounded-md">
              <span className="text-caption font-caption text-error-700">{error}</span>
            </div>
          )}

          <div className="flex w-full flex-col items-center gap-4">
            <Button
              type="submit"
              className="h-12 w-full flex-none"
              size="large"
              disabled={!email.trim() || !currentLocationData || isSubmitting || isEditingLocation}
              loading={isSubmitting}
            >
              {isSubmitting 
                ? "Joining..." 
                : isGeographic 
                  ? `Join Waitlist for ${cityName}`
                  : "Join Early Access List"
              }
            </Button>
            <Button
              type="button"
              variant="neutral-tertiary"
              onClick={handleMaybeLater}
              disabled={isSubmitting}
            >
              Maybe later
            </Button>
          </div>
        </form>

        <div className="flex w-full flex-col items-center gap-2 border-t border-solid border-neutral-border pt-6">
          <span className="text-caption font-caption text-subtext-color">
            Browse our Northwest Arkansas marketplace while you wait
          </span>
          <Button
            variant="brand-secondary"
            icon={<FeatherExternalLink />}
            onClick={handleBrowseClick}
          >
            Shop
          </Button>
        </div>
      </div>
    </DialogLayout>
  );
};

export default WaitlistModal;