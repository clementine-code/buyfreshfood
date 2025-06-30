import { supabase } from '../lib/supabase';
import type { LocationData } from '../services/locationService';

// Simple waitlist form data interface
export interface WaitlistFormData {
  email: string;
  location: string;
  city: string;
  state: string;
  zipCode?: string;
  interests: string[];
  productInterests: string;
  waitlistType: 'geographic' | 'early_access';
  honeypot?: string; // Honeypot field to catch bots
}

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

// Submit waitlist form to Supabase with improved error handling
export const submitWaitlist = async (formData: WaitlistFormData) => {
  try {
    console.log('📝 Submitting waitlist form:', formData);

    // Check honeypot field - if it's filled, this is likely a bot
    if (formData.honeypot && formData.honeypot.length > 0) {
      console.log('🤖 Bot detected! Honeypot field was filled.');
      // Return success to the bot but don't actually submit anything
      return { 
        success: true, 
        queuePosition: Math.floor(Math.random() * 500) + 100,
        data: {
          id: `fake-${Date.now()}`,
          email: formData.email,
          location: formData.location,
          city: formData.city,
          state: formData.state,
          waitlist_type: formData.waitlistType,
          created_at: new Date().toISOString()
        }
      };
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // Remove honeypot field before sending to database
    const { honeypot, ...cleanFormData } = formData;

    const { data, error } = await supabase
      .from('waitlist')
      .insert({
        email: cleanFormData.email.toLowerCase().trim(),
        location: cleanFormData.location,
        city: cleanFormData.city,
        state: cleanFormData.state,
        zip_code: cleanFormData.zipCode || null,
        interests: cleanFormData.interests,
        product_interests: cleanFormData.productInterests,
        waitlist_type: cleanFormData.waitlistType
      })
      .select()
      .single()
      .abortSignal(controller.signal);

    clearTimeout(timeoutId);

    if (error) {
      console.error('Error submitting waitlist:', error);
      throw error;
    }

    const queuePosition = await getQueuePosition(cleanFormData.city, cleanFormData.waitlistType);
    
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