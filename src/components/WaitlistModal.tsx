"use client";

import React, { useState, useEffect } from "react";
import { DialogLayout } from "@/ui/layouts/DialogLayout";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { Badge } from "@/ui/components/Badge";
import { FeatherArrowRight } from "@subframe/core";
import { TextField } from "@/ui/components/TextField";
import { CheckboxCard } from "@/ui/components/CheckboxCard";
import { Button } from "@/ui/components/Button";
import { FeatherExternalLink } from "@subframe/core";
import { useWaitlistContext } from "../contexts/WaitlistContext";
import { useLocationContext } from "../contexts/LocationContext";
import { 
  submitWaitlist, 
  parseLocation, 
  getTrackedBehavior, 
  getPrecheckedInterests, 
  getPrefilledProductInterest,
  trackUserBehavior
} from "../utils/waitlistUtils";
import { useNavigate } from "react-router-dom";

const WaitlistModal: React.FC = () => {
  const { state, closeWaitlistModal, showSuccessView } = useWaitlistContext();
  const { state: locationState } = useLocationContext();
  const navigate = useNavigate();

  // Form state
  const [email, setEmail] = useState("");
  const [interests, setInterests] = useState({
    buying: false,
    selling: false,
    updates: false
  });
  const [productInterests, setProductInterests] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Initialize form with tracked behavior
  useEffect(() => {
    if (state.isModalOpen && !state.isSuccessView) {
      const trackedBehavior = getTrackedBehavior();
      const prechecked = getPrecheckedInterests(trackedBehavior);
      const prefilledProducts = getPrefilledProductInterest(trackedBehavior);
      
      setInterests(prechecked);
      setProductInterests(prefilledProducts);
      setError("");
      
      // Track modal open
      trackUserBehavior('opened_waitlist_modal', {
        type: state.modalType,
        location: state.currentLocationData?.formattedAddress
      }, locationState);
    }
  }, [state.isModalOpen, state.isSuccessView, state.modalType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      const locationData = state.currentLocationData;
      const parsedLocation = parseLocation(locationData?.formattedAddress || locationData?.city + ', ' + locationData?.state || '');
      
      const selectedInterests = Object.entries(interests)
        .filter(([_, selected]) => selected)
        .map(([key, _]) => key);

      const formData = {
        email: email.trim(),
        location: locationData?.formattedAddress || `${locationData?.city}, ${locationData?.state}`,
        city: parsedLocation.city || locationData?.city || '',
        state: parsedLocation.state || locationData?.state || '',
        zipCode: parsedLocation.zipCode || locationData?.zipCode,
        interests: selectedInterests,
        productInterests: productInterests.trim(),
        waitlistType: state.modalType || 'geographic'
      };

      const result = await submitWaitlist(formData);

      if (result.success) {
        // Track successful submission
        await trackUserBehavior('submitted_waitlist', {
          type: state.modalType,
          interests: selectedInterests,
          location: formData.location,
          queuePosition: result.queuePosition
        }, locationState);

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
    closeWaitlistModal();
    navigate('/shop');
  };

  const handleMaybeLater = () => {
    trackUserBehavior('dismissed_waitlist_modal', {
      type: state.modalType,
      location: state.currentLocationData?.formattedAddress
    }, locationState);
    closeWaitlistModal();
  };

  if (!state.isModalOpen) return null;

  // Success View
  if (state.isSuccessView) {
    const isGeographic = state.modalType === 'geographic';
    const cityName = state.currentLocationData?.city || 'your area';
    
    return (
      <DialogLayout open={true} onOpenChange={closeWaitlistModal}>
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
  const cityName = state.currentLocationData?.city || 'your city';
  const locationDisplay = state.currentLocationData?.formattedAddress || 
                         `${state.currentLocationData?.city}, ${state.currentLocationData?.state}`;

  return (
    <DialogLayout open={true} onOpenChange={closeWaitlistModal}>
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
          
          <TextField
            className="h-auto w-full flex-none"
            disabled={true}
            variant="filled"
            label="Location"
            helpText=""
          >
            <TextField.Input
              placeholder={locationDisplay}
              value={locationDisplay}
              onChange={() => {}}
            />
          </TextField>
          
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
              disabled={!email.trim() || isSubmitting}
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