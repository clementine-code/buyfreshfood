// Location service with backend proxy for Google Places API
export interface LocationData {
  isNWA: boolean;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
  placeId?: string;
}

export interface LocationSuggestion {
  place_id: string;
  description: string;
  main_text: string;
  secondary_text: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Northwest Arkansas metro area boundaries (keep for NWA detection)
const NWA_BOUNDS = {
  north: 36.5,
  south: 35.8,
  east: -93.8,
  west: -94.6
};

// NWA cities for local detection
const NWA_CITIES = new Set([
  'fayetteville', 'rogers', 'bentonville', 'springdale', 'bella vista',
  'siloam springs', 'prairie grove', 'farmington', 'elkins', 'west fork',
  'tontitown', 'lowell', 'cave springs', 'centerton', 'pea ridge',
  'gentry', 'gravette', 'decatur', 'goshen', 'johnson', 'elm springs',
  'highfill', 'maysel', 'sulphur springs', 'winslow', 'hindsville',
  'huntsville', 'garfield', 'gateway'
]);

class LocationService {
  private supabaseUrl: string;
  private supabaseAnonKey: string;
  private isOnline: boolean = true;

  constructor() {
    this.supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    this.supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    
    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      console.error('Missing Supabase configuration');
      this.isOnline = false;
    }

    // Monitor online status
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Connection restored');
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📴 Connection lost');
    });
  }

  /**
   * Check if coordinates are within NWA metro area
   */
  private isInNWABounds(latitude: number, longitude: number): boolean {
    return (
      latitude >= NWA_BOUNDS.south &&
      latitude <= NWA_BOUNDS.north &&
      longitude >= NWA_BOUNDS.west &&
      longitude <= NWA_BOUNDS.east
    );
  }

  /**
   * Check if city is in NWA metro area
   */
  private isNWACity(city: string): boolean {
    return NWA_CITIES.has(city.toLowerCase().trim());
  }

  /**
   * Determine if location is in NWA based on city, state, and coordinates
   */
  private determineIsNWA(city: string, state: string, latitude?: number, longitude?: number): boolean {
    // Check by city name first
    if (this.isNWACity(city)) {
      return true;
    }

    // Check by coordinates if available
    if (latitude && longitude) {
      return this.isInNWABounds(latitude, longitude);
    }

    // Check if it's in Arkansas (broader check)
    return state.toLowerCase() === 'arkansas' || state.toLowerCase() === 'ar';
  }

  /**
   * Make authenticated request to backend API with improved error handling
   */
  private async makeBackendRequest(endpoint: string, data: any): Promise<any> {
    if (!this.isOnline) {
      throw new Error('No internet connection');
    }

    const url = `${this.supabaseUrl}/functions/v1/${endpoint}`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Backend API error: ${response.status}`);
      }

      return await response.json();

    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - please check your connection');
      }
      
      if (error.message?.includes('Failed to fetch')) {
        this.isOnline = false;
        throw new Error('Network connection failed');
      }
      
      throw error;
    }
  }

  /**
   * Get location suggestions using backend proxy with fallback
   */
  async getLocationSuggestions(input: string): Promise<LocationSuggestion[]> {
    if (input.length < 2) {
      return [];
    }

    try {
      console.log('🔍 Fetching suggestions via backend proxy for:', input);

      const data = await this.makeBackendRequest('places-autocomplete', {
        input,
        types: 'geocode',
        componentRestrictions: { country: 'us' }
      });

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        console.error('Backend API error:', data.status, data.error_message);
        return this.getFallbackSuggestions(input);
      }

      const suggestions: LocationSuggestion[] = data.predictions?.map((prediction: any) => ({
        place_id: prediction.place_id,
        description: prediction.description,
        main_text: prediction.structured_formatting?.main_text || prediction.description,
        secondary_text: prediction.structured_formatting?.secondary_text || '',
      })) || [];

      console.log('✅ Got suggestions via backend:', suggestions.length);
      return suggestions.slice(0, 8); // Limit to 8 suggestions

    } catch (error) {
      console.warn('❌ Backend unavailable, using fallback suggestions:', error);
      return this.getFallbackSuggestions(input);
    }
  }

  /**
   * Fallback suggestions when backend API is unavailable
   */
  private getFallbackSuggestions(input: string): LocationSuggestion[] {
    const fallbackCities = [
      { city: 'Fayetteville', state: 'AR' },
      { city: 'Rogers', state: 'AR' },
      { city: 'Bentonville', state: 'AR' },
      { city: 'Springdale', state: 'AR' },
      { city: 'Little Rock', state: 'AR' },
      { city: 'Fort Smith', state: 'AR' },
      { city: 'Bella Vista', state: 'AR' },
      { city: 'Siloam Springs', state: 'AR' },
      { city: 'Prairie Grove', state: 'AR' },
      { city: 'Farmington', state: 'AR' }
    ];

    const query = input.toLowerCase();
    return fallbackCities
      .filter(location => 
        location.city.toLowerCase().includes(query) || 
        location.state.toLowerCase().includes(query)
      )
      .map((location, index) => ({
        place_id: `fallback_${index}`,
        description: `${location.city}, ${location.state}, USA`,
        main_text: location.city,
        secondary_text: `${location.state}, USA`
      }))
      .slice(0, 8);
  }

  /**
   * Get detailed location information using backend proxy with fallback
   */
  async getLocationDetails(placeId?: string, coordinates?: { lat: number; lng: number }): Promise<LocationData | null> {
    try {
      console.log('🔍 Getting location details via backend for:', placeId, coordinates);

      // Handle fallback suggestions
      if (placeId?.startsWith('fallback_')) {
        return this.handleFallbackPlaceId(placeId);
      }

      if (placeId) {
        return await this.getDetailsFromPlaceId(placeId);
      }

      if (coordinates) {
        return await this.getDetailsFromCoordinates(coordinates);
      }

      console.log('⚠️ No place ID or coordinates provided');
      return null;

    } catch (error) {
      console.warn('❌ Backend unavailable, using fallback location data:', error);
      
      if (coordinates) {
        return this.createFallbackLocationData(coordinates);
      }
      
      if (placeId?.startsWith('fallback_')) {
        return this.handleFallbackPlaceId(placeId);
      }
      
      return null;
    }
  }

  /**
   * Get location details from backend using place ID with fallback
   */
  private async getDetailsFromPlaceId(placeId: string): Promise<LocationData | null> {
    try {
      const data = await this.makeBackendRequest('places-details', {
        place_id: placeId,
        fields: ['address_components', 'formatted_address', 'geometry', 'name']
      });

      if (data.status !== 'OK') {
        console.error('Backend Places Details API error:', data.status, data.error_message);
        return null;
      }

      const result = data.result;
      const addressComponents = result.address_components || [];
      
      let city = '';
      let state = '';
      let zipCode = '';

      // Parse address components
      for (const component of addressComponents) {
        const types = component.types;
        
        if (types.includes('locality')) {
          city = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
          state = component.short_name;
        } else if (types.includes('postal_code')) {
          zipCode = component.long_name;
        }
      }

      const latitude = result.geometry?.location?.lat;
      const longitude = result.geometry?.location?.lng;
      const isNWA = this.determineIsNWA(city, state, latitude, longitude);

      return {
        isNWA,
        city,
        state,
        zipCode,
        latitude,
        longitude,
        formattedAddress: result.formatted_address,
        placeId
      };

    } catch (error) {
      console.warn('❌ Error fetching place details via backend, using fallback:', error);
      return null;
    }
  }

  /**
   * Get location details from coordinates using backend proxy with fallback
   */
  private async getDetailsFromCoordinates(coordinates: { lat: number; lng: number }): Promise<LocationData | null> {
    try {
      const data = await this.makeBackendRequest('places-reverse-geocode', {
        lat: coordinates.lat,
        lng: coordinates.lng
      });

      if (data.status !== 'OK' || !data.results?.length) {
        console.error('Backend Reverse Geocoding API error:', data.status, data.error_message);
        return this.createFallbackLocationData(coordinates);
      }

      const result = data.results[0];
      const addressComponents = result.address_components || [];
      
      let city = '';
      let state = '';
      let zipCode = '';

      // Parse address components
      for (const component of addressComponents) {
        const types = component.types;
        
        if (types.includes('locality')) {
          city = component.long_name;
        } else if (types.includes('administrative_area_level_1')) {
          state = component.short_name;
        } else if (types.includes('postal_code')) {
          zipCode = component.long_name;
        }
      }

      const isNWA = this.determineIsNWA(city, state, coordinates.lat, coordinates.lng);

      return {
        isNWA,
        city,
        state,
        zipCode,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        formattedAddress: result.formatted_address,
        placeId: result.place_id
      };

    } catch (error) {
      console.warn('❌ Error reverse geocoding via backend, using fallback:', error);
      return this.createFallbackLocationData(coordinates);
    }
  }

  /**
   * Handle fallback place IDs
   */
  private handleFallbackPlaceId(placeId: string): LocationData {
    const fallbackData = {
      'fallback_0': { city: 'Fayetteville', state: 'AR', isNWA: true, lat: 36.0625, lng: -94.1574 },
      'fallback_1': { city: 'Rogers', state: 'AR', isNWA: true, lat: 36.3320, lng: -94.1185 },
      'fallback_2': { city: 'Bentonville', state: 'AR', isNWA: true, lat: 36.3729, lng: -94.2088 },
      'fallback_3': { city: 'Springdale', state: 'AR', isNWA: true, lat: 36.1867, lng: -94.1288 },
      'fallback_4': { city: 'Little Rock', state: 'AR', isNWA: false, lat: 34.7465, lng: -92.2896 },
      'fallback_5': { city: 'Fort Smith', state: 'AR', isNWA: false, lat: 35.3859, lng: -94.3985 },
      'fallback_6': { city: 'Bella Vista', state: 'AR', isNWA: true, lat: 36.4812, lng: -94.2688 },
      'fallback_7': { city: 'Siloam Springs', state: 'AR', isNWA: true, lat: 36.1881, lng: -94.5405 },
      'fallback_8': { city: 'Prairie Grove', state: 'AR', isNWA: true, lat: 35.9995, lng: -94.3169 },
      'fallback_9': { city: 'Farmington', state: 'AR', isNWA: true, lat: 36.0420, lng: -94.2469 }
    };

    const data = fallbackData[placeId as keyof typeof fallbackData];
    
    return {
      isNWA: data?.isNWA || false,
      city: data?.city || 'Unknown',
      state: data?.state || 'AR',
      zipCode: '',
      latitude: data?.lat,
      longitude: data?.lng,
      formattedAddress: `${data?.city}, ${data?.state}, USA`,
      placeId
    };
  }

  /**
   * Create fallback location data when API is unavailable
   */
  private createFallbackLocationData(coordinates: { lat: number; lng: number }): LocationData {
    const isNWA = this.isInNWABounds(coordinates.lat, coordinates.lng);
    
    return {
      isNWA,
      city: isNWA ? 'Northwest Arkansas' : 'Unknown',
      state: isNWA ? 'AR' : 'Unknown',
      zipCode: '',
      latitude: coordinates.lat,
      longitude: coordinates.lng,
      formattedAddress: `${coordinates.lat.toFixed(4)}, ${coordinates.lng.toFixed(4)}`
    };
  }

  /**
   * Get user's current location using browser geolocation with improved error handling
   */
  async getCurrentLocation(): Promise<LocationData | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.error('❌ Geolocation is not supported by this browser');
        resolve(null);
        return;
      }

      console.log('📍 Requesting current location...');

      const timeoutId = setTimeout(() => {
        console.warn('⏰ Geolocation timeout, using fallback');
        resolve(null);
      }, 15000);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          clearTimeout(timeoutId);
          
          const coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          console.log('✅ Got coordinates:', coordinates);

          try {
            const locationData = await this.getLocationDetails(undefined, coordinates);
            resolve(locationData);
          } catch (error) {
            console.warn('❌ Error getting location details, using fallback:', error);
            resolve(this.createFallbackLocationData(coordinates));
          }
        },
        (error) => {
          clearTimeout(timeoutId);
          console.warn('❌ Error getting current location:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  /**
   * Validate location input using backend proxy with fallback
   */
  async validateLocationInput(input: string): Promise<LocationData | null> {
    const trimmedInput = input.trim();
    
    console.log('🔍 Validating location input via backend:', trimmedInput);

    try {
      // Get suggestions first
      const suggestions = await this.getLocationSuggestions(trimmedInput);
      
      if (suggestions.length > 0) {
        // Use the first suggestion
        const firstSuggestion = suggestions[0];
        return await this.getLocationDetails(firstSuggestion.place_id);
      }

      // If no suggestions, try direct geocoding via backend
      try {
        const data = await this.makeBackendRequest('places-geocode', {
          address: trimmedInput,
          components: 'country:US'
        });
        
        if (data.status === 'OK' && data.results?.length > 0) {
          const result = data.results[0];
          return await this.getLocationDetails(result.place_id);
        }
      } catch (geocodeError) {
        console.warn('Geocoding via backend failed:', geocodeError);
      }

      console.log('⚠️ Could not validate location input via backend:', trimmedInput);
      return null;

    } catch (error) {
      console.warn('❌ Error validating location input via backend, using fallback:', error);
      
      // Try to match against fallback cities
      const fallbackSuggestions = this.getFallbackSuggestions(trimmedInput);
      if (fallbackSuggestions.length > 0) {
        return this.handleFallbackPlaceId(fallbackSuggestions[0].place_id);
      }
      
      return null;
    }
  }
}

// Export singleton instance
export const locationService = new LocationService();

// Utility functions
export const isValidNWALocation = (location: LocationData): boolean => {
  return location.isNWA;
};

export const formatLocationDisplay = (location: LocationData): string => {
  if (location.formattedAddress) {
    return location.formattedAddress;
  }
  
  const parts = [location.city, location.state, location.zipCode].filter(Boolean);
  return parts.join(', ');
};

export const getLocationErrorMessage = (location: LocationData | null): string | null => {
  if (!location) {
    return 'Unable to find this location. Please try a different address or zip code.';
  }
  
  if (!location.isNWA) {
    return 'Sorry, we currently only serve the Northwest Arkansas metro area. Please enter a location in Fayetteville, Rogers, Bentonville, Springdale, or surrounding communities.';
  }
  
  return null;
};