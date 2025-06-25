// Location service with Google Places API integration
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
  private googleApiKey: string;

  constructor() {
    this.googleApiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || '';
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
   * Get location suggestions using Google Places Autocomplete API
   */
  async getLocationSuggestions(input: string): Promise<LocationSuggestion[]> {
    if (input.length < 2 || !this.googleApiKey) {
      return [];
    }

    try {
      console.log('🔍 Fetching suggestions from Google Places API for:', input);

      const url = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
      url.searchParams.append('input', input);
      url.searchParams.append('key', this.googleApiKey);
      url.searchParams.append('types', '(cities)');
      url.searchParams.append('components', 'country:us');
      url.searchParams.append('language', 'en');

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Google Places API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        console.error('Google Places API error:', data.status, data.error_message);
        return this.getFallbackSuggestions(input);
      }

      const suggestions: LocationSuggestion[] = data.predictions?.map((prediction: any) => ({
        place_id: prediction.place_id,
        description: prediction.description,
        main_text: prediction.structured_formatting?.main_text || prediction.description,
        secondary_text: prediction.structured_formatting?.secondary_text || '',
      })) || [];

      console.log('✅ Got suggestions from Google Places:', suggestions.length);
      return suggestions.slice(0, 8); // Limit to 8 suggestions

    } catch (error) {
      console.error('❌ Error fetching location suggestions:', error);
      return this.getFallbackSuggestions(input);
    }
  }

  /**
   * Fallback suggestions when Google Places API is unavailable
   */
  private getFallbackSuggestions(input: string): LocationSuggestion[] {
    const fallbackCities = [
      { city: 'Fayetteville', state: 'AR' },
      { city: 'Rogers', state: 'AR' },
      { city: 'Bentonville', state: 'AR' },
      { city: 'Springdale', state: 'AR' },
      { city: 'Little Rock', state: 'AR' },
      { city: 'Fort Smith', state: 'AR' },
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
      .slice(0, 5);
  }

  /**
   * Get detailed location information using Google Places Details API
   */
  async getLocationDetails(placeId?: string, coordinates?: { lat: number; lng: number }): Promise<LocationData | null> {
    try {
      console.log('🔍 Getting location details for:', placeId, coordinates);

      // Handle fallback suggestions
      if (placeId?.startsWith('fallback_')) {
        return this.handleFallbackPlaceId(placeId);
      }

      if (placeId && this.googleApiKey) {
        return await this.getDetailsFromPlaceId(placeId);
      }

      if (coordinates) {
        return await this.getDetailsFromCoordinates(coordinates);
      }

      console.log('⚠️ No place ID or coordinates provided');
      return null;

    } catch (error) {
      console.error('❌ Error getting location details:', error);
      
      if (coordinates) {
        return this.createFallbackLocationData(coordinates);
      }
      
      return null;
    }
  }

  /**
   * Get location details from Google Places Details API
   */
  private async getDetailsFromPlaceId(placeId: string): Promise<LocationData | null> {
    try {
      const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
      url.searchParams.append('place_id', placeId);
      url.searchParams.append('key', this.googleApiKey);
      url.searchParams.append('fields', 'address_components,formatted_address,geometry,name');

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Google Places Details API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== 'OK') {
        console.error('Google Places Details API error:', data.status, data.error_message);
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
      console.error('❌ Error fetching place details:', error);
      return null;
    }
  }

  /**
   * Get location details from coordinates using Google Geocoding API
   */
  private async getDetailsFromCoordinates(coordinates: { lat: number; lng: number }): Promise<LocationData | null> {
    try {
      const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
      url.searchParams.append('latlng', `${coordinates.lat},${coordinates.lng}`);
      url.searchParams.append('key', this.googleApiKey);

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Google Geocoding API error: ${response.status}`);
      }

      const data = await response.json();

      if (data.status !== 'OK' || !data.results?.length) {
        console.error('Google Geocoding API error:', data.status, data.error_message);
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
      console.error('❌ Error reverse geocoding:', error);
      return this.createFallbackLocationData(coordinates);
    }
  }

  /**
   * Handle fallback place IDs
   */
  private handleFallbackPlaceId(placeId: string): LocationData {
    const fallbackData = {
      'fallback_0': { city: 'Fayetteville', state: 'AR', isNWA: true },
      'fallback_1': { city: 'Rogers', state: 'AR', isNWA: true },
      'fallback_2': { city: 'Bentonville', state: 'AR', isNWA: true },
      'fallback_3': { city: 'Springdale', state: 'AR', isNWA: true },
      'fallback_4': { city: 'Little Rock', state: 'AR', isNWA: false },
      'fallback_5': { city: 'Fort Smith', state: 'AR', isNWA: false },
    };

    const data = fallbackData[placeId as keyof typeof fallbackData];
    
    return {
      isNWA: data?.isNWA || false,
      city: data?.city || 'Unknown',
      state: data?.state || 'AR',
      zipCode: '',
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
   * Get user's current location using browser geolocation
   */
  async getCurrentLocation(): Promise<LocationData | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.error('❌ Geolocation is not supported by this browser');
        resolve(null);
        return;
      }

      console.log('📍 Requesting current location...');

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          console.log('✅ Got coordinates:', coordinates);

          try {
            const locationData = await this.getLocationDetails(undefined, coordinates);
            resolve(locationData);
          } catch (error) {
            console.error('❌ Error getting location details:', error);
            resolve(this.createFallbackLocationData(coordinates));
          }
        },
        (error) => {
          console.error('❌ Error getting current location:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  /**
   * Validate location input using Google Places API
   */
  async validateLocationInput(input: string): Promise<LocationData | null> {
    const trimmedInput = input.trim();
    
    console.log('🔍 Validating location input:', trimmedInput);

    try {
      // Get suggestions first
      const suggestions = await this.getLocationSuggestions(trimmedInput);
      
      if (suggestions.length > 0) {
        // Use the first suggestion
        const firstSuggestion = suggestions[0];
        return await this.getLocationDetails(firstSuggestion.place_id);
      }

      // If no suggestions, try direct geocoding
      if (this.googleApiKey) {
        const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
        url.searchParams.append('address', trimmedInput);
        url.searchParams.append('key', this.googleApiKey);
        url.searchParams.append('components', 'country:US');

        const response = await fetch(url.toString());
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.status === 'OK' && data.results?.length > 0) {
            const result = data.results[0];
            return await this.getLocationDetails(result.place_id);
          }
        }
      }

      console.log('⚠️ Could not validate location input:', trimmedInput);
      return null;

    } catch (error) {
      console.error('❌ Error validating location input:', error);
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