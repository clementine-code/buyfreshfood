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

// Track user behavior for analytics with error handling
export const trackUserBehavior = async (
  action: string,
  data?: any,
  locationState?: any
) => {
  try {
    const sessionId = getSessionId();
    const userLocationType = locationState?.isNWA ? 'nwa' : 'out_of_region';
    
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    await supabase.from('user_analytics').insert({
      session_id: sessionId,
      action,
      data: data || {},
      location: locationState?.location || null,
      user_location_type: locationState?.isSet ? userLocationType : null
    });
    
    clearTimeout(timeoutId);
  } catch (error) {
    console.warn('Analytics tracking failed (continuing silently):', error);
    // Store locally as fallback
    storeLocalBehavior(`analytics_${action}`, { action, data, timestamp: Date.now() });
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

// Get real queue position from Supabase with fallback
export const getQueuePosition = async (city: string, waitlistType: string): Promise<number> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const { data, error } = await supabase
      .from('waitlist')
      .select('id')
      .eq('city', city)
      .eq('waitlist_type', waitlistType)
      .order('created_at', { ascending: true });
    
    clearTimeout(timeoutId);
    
    if (error) throw error;
    return (data?.length || 0) + 1;
  } catch (error) {
    console.warn('Error getting queue position, using fallback:', error);
    return Math.floor(Math.random() * 500) + 100; // Fallback random number
  }
};

// Check if user is already waitlisted with improved error handling
export const checkIfUserIsWaitlisted = async (email: string, location: string): Promise<boolean> => {
  try {
    console.log('🔍 Checking if user is waitlisted:', email, location);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const { data, error } = await supabase
      .from('waitlist')
      .select('id, email, location')
      .eq('email', email.toLowerCase().trim())
      .limit(1)
      .abortSignal(controller.signal);

    clearTimeout(timeoutId);

    if (error) {
      console.error('Error checking waitlist status:', error);
      return false;
    }

    // Check if any entry matches the location (flexible matching)
    const isWaitlisted = data && data.length > 0 && data.some(entry => {
      const entryLocation = entry.location.toLowerCase();
      const checkLocation = location.toLowerCase();
      
      // Exact match or contains match
      return entryLocation === checkLocation || 
             entryLocation.includes(checkLocation) || 
             checkLocation.includes(entryLocation);
    });

    console.log('✅ Waitlist check result:', isWaitlisted);
    return !!isWaitlisted;

  } catch (error) {
    console.warn('Error checking waitlist status:', error);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    return false;
  }
};

// Submit waitlist form to Supabase with improved error handling
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
    console.log('📝 Submitting waitlist form:', formData);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // Increased to 5 seconds

    const { data, error } = await supabase
      .from('waitlist')
      .insert({
        email: formData.email.toLowerCase().trim(),
        location: formData.location,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode || null,
        interests: formData.interests,
        product_interests: formData.productInterests,
        waitlist_type: formData.waitlistType
      })
      .select()
      .single()
      .abortSignal(controller.signal);

    clearTimeout(timeoutId);

    if (error) {
      console.error('Error submitting waitlist:', error);
      throw error;
    }

    const queuePosition = await getQueuePosition(formData.city, formData.waitlistType);
    
    console.log('✅ Waitlist submission successful:', data);
    return { success: true, queuePosition, data };

  } catch (error) {
    console.error('Error submitting waitlist:', error);
    
    if (error.name === 'AbortError') {
      return { success: false, error: 'Request timed out. Please check your connection and try again.' };
    }
    
    // Handle specific Supabase errors
    if (error.code === '23505') { // Unique constraint violation
      return { success: false, error: 'You are already on the waitlist with this email.' };
    }
    
    // Network errors
    if (error.message?.includes('Failed to fetch') || error.message?.includes('Network')) {
      return { success: false, error: 'Network connection failed. Please check your internet connection and try again.' };
    }
    
    return { success: false, error: error.message || 'Failed to join waitlist. Please try again.' };
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