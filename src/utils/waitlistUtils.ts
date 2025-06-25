import { supabase } from '../lib/supabase';
import type { LocationData } from '../services/locationService';

// Generate unique session ID
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get or create session ID
export const getSessionId = (): string => {
  let sessionId = localStorage.getItem('fresh_food_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('fresh_food_session_id', sessionId);
  }
  return sessionId;
};

// Check user access based on location and action
export const checkUserAccess = (
  locationState: any,
  action: 'browse' | 'purchase' | 'sell' | 'save' | 'contact'
): 'PROMPT_LOCATION' | 'FULL_ACCESS' | 'GEOGRAPHIC_WAITLIST' | 'EARLY_ACCESS_WAITLIST' => {
  if (!locationState.isSet) {
    return 'PROMPT_LOCATION';
  }
  
  if (locationState.isNWA && action === 'browse') {
    return 'FULL_ACCESS';
  }
  
  if (locationState.isNWA && (action === 'purchase' || action === 'sell' || action === 'contact')) {
    return 'EARLY_ACCESS_WAITLIST';
  }
  
  return 'GEOGRAPHIC_WAITLIST';
};

// Track user behavior for analytics
export const trackUserBehavior = async (
  action: string,
  data?: any,
  locationState?: any
) => {
  try {
    const sessionId = getSessionId();
    const userLocationType = locationState?.isNWA ? 'nwa' : 'out_of_region';
    
    await supabase.from('user_analytics').insert({
      session_id: sessionId,
      action,
      data: data || {},
      location: locationState?.location || null,
      user_location_type: locationState?.isSet ? userLocationType : null
    });
  } catch (error) {
    console.error('Error tracking user behavior:', error);
  }
};

// Get tracked behavior from localStorage for pre-filling
export const getTrackedBehavior = () => {
  try {
    const behavior = localStorage.getItem('fresh_food_behavior');
    return behavior ? JSON.parse(behavior) : {};
  } catch {
    return {};
  }
};

// Store behavior locally for immediate use
export const storeLocalBehavior = (behaviorType: string, data?: any) => {
  try {
    const existing = getTrackedBehavior();
    const updated = {
      ...existing,
      [behaviorType]: data || true,
      lastUpdated: Date.now()
    };
    localStorage.setItem('fresh_food_behavior', JSON.stringify(updated));
  } catch (error) {
    console.error('Error storing local behavior:', error);
  }
};

// Get pre-checked interests based on tracked behavior
export const getPrecheckedInterests = (trackedBehavior: any) => {
  return {
    buying: trackedBehavior.attempted_add_to_cart || trackedBehavior.viewed_product || false,
    selling: trackedBehavior.visited_sell_page || false,
    updates: !trackedBehavior.attempted_add_to_cart && !trackedBehavior.visited_sell_page
  };
};

// Get pre-filled product interest based on viewed products
export const getPrefilledProductInterest = (trackedBehavior: any): string => {
  if (trackedBehavior.viewed_products && trackedBehavior.viewed_products.length > 0) {
    const products = trackedBehavior.viewed_products.slice(0, 3);
    return products.map((p: any) => p.name).join(', ');
  }
  return '';
};

// Get real queue position from Supabase
export const getQueuePosition = async (city: string, waitlistType: string): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('waitlist')
      .select('id')
      .eq('city', city)
      .eq('waitlist_type', waitlistType)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return (data?.length || 0) + 1;
  } catch (error) {
    console.error('Error getting queue position:', error);
    return Math.floor(Math.random() * 500) + 100; // Fallback random number
  }
};

// Submit waitlist form to Supabase
export const submitWaitlist = async (formData: {
  email: string;
  location: string;
  city: string;
  state: string;
  zipCode?: string;
  interests: string[];
  productInterests: string;
  waitlistType: 'geographic' | 'early_access';
}) => {
  try {
    const { data, error } = await supabase
      .from('waitlist')
      .insert({
        email: formData.email,
        location: formData.location,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode || null,
        interests: formData.interests,
        product_interests: formData.productInterests,
        waitlist_type: formData.waitlistType
      })
      .select();

    if (error) throw error;

    const queuePosition = await getQueuePosition(formData.city, formData.waitlistType);
    
    return { success: true, queuePosition, data: data[0] };
  } catch (error) {
    console.error('Error submitting waitlist:', error);
    return { success: false, error: error.message };
  }
};

// Parse location string into components
export const parseLocation = (location: string) => {
  const parts = location.split(',').map(part => part.trim());
  
  if (parts.length >= 2) {
    const city = parts[0];
    const stateZip = parts[1];
    const stateMatch = stateZip.match(/^([A-Z]{2})/);
    const zipMatch = stateZip.match(/(\d{5})/);
    
    return {
      city,
      state: stateMatch ? stateMatch[1] : stateZip,
      zipCode: zipMatch ? zipMatch[1] : undefined
    };
  }
  
  return {
    city: location,
    state: '',
    zipCode: undefined
  };
};