// Location service for NWA marketplace geographic constraints
export interface LocationData {
  isNWA: boolean;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
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

// Northwest Arkansas metro area boundaries
const NWA_BOUNDS = {
  north: 36.5,
  south: 35.8,
  east: -93.8,
  west: -94.6
};

// NWA metro area zip codes
const NWA_ZIP_CODES = new Set([
  // Fayetteville area
  '72701', '72702', '72703', '72704', '72718',
  // Rogers area
  '72756', '72757', '72758',
  // Bentonville area
  '72712', '72713', '72714', '72716',
  // Springdale area
  '72762', '72764', '72765', '72766',
  // Other NWA communities
  '72719', // Cave Springs
  '72720', // Centerton
  '72721', // Decatur
  '72722', // Elm Springs
  '72727', // Gentry
  '72728', // Goshen
  '72729', // Gravette
  '72730', // Highfill
  '72732', // Johnson
  '72734', // Lowell
  '72736', // Maysel
  '72737', // Pea Ridge
  '72738', // Prairie Grove
  '72739', // Siloam Springs
  '72740', // Sulphur Springs
  '72741', // Tontitown
  '72742', // Winslow
  '72744', // West Fork
  '72745', // Farmington
  '72749', // Elkins
  '72751', // Hindsville
  '72753', // Huntsville
  '72758', // Rogers
  '72761', // Bella Vista
  '72768', // Garfield
  '72769', // Gateway
]);

// NWA cities
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
  private mapboxToken: string;

  constructor() {
    this.googleApiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || '';
    this.mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
  }

  /**
   * Check if coordinates are within NWA metro area
   */
  isInNWABounds(latitude: number, longitude: number): boolean {
    return (
      latitude >= NWA_BOUNDS.south &&
      latitude <= NWA_BOUNDS.north &&
      longitude >= NWA_BOUNDS.west &&
      longitude <= NWA_BOUNDS.east
    );
  }

  /**
   * Check if zip code is in NWA metro area
   */
  isNWAZipCode(zipCode: string): boolean {
    const cleanZip = zipCode.replace(/\D/g, '').substring(0, 5);
    return NWA_ZIP_CODES.has(cleanZip);
  }

  /**
   * Check if city is in NWA metro area
   */
  isNWACity(city: string): boolean {
    return NWA_CITIES.has(city.toLowerCase().trim());
  }

  /**
   * Get location suggestions - enhanced for better address support
   */
  async getLocationSuggestions(input: string): Promise<LocationSuggestion[]> {
    if (input.length < 3) {
      return [];
    }

    // Try multiple approaches for better results
    const suggestions: LocationSuggestion[] = [];

    // 1. Try Google Places API if available
    if (this.googleApiKey) {
      try {
        const googleResults = await this.getGooglePlacesSuggestions(input);
        suggestions.push(...googleResults);
      } catch (error) {
        console.warn('Google Places API error:', error);
      }
    }

    // 2. If no results or API unavailable, use fallback
    if (suggestions.length === 0) {
      const fallbackResults = this.getFallbackSuggestions(input);
      suggestions.push(...fallbackResults);
    }

    // 3. Remove duplicates and limit results
    const uniqueSuggestions = suggestions.filter((suggestion, index, self) => 
      index === self.findIndex(s => s.description === suggestion.description)
    );

    return uniqueSuggestions.slice(0, 8);
  }

  /**
   * Get suggestions from Google Places API with improved parameters
   */
  private async getGooglePlacesSuggestions(input: string): Promise<LocationSuggestion[]> {
    const baseUrl = 'https://maps.googleapis.com/maps/api/place/autocomplete/json';
    const params = new URLSearchParams({
      input: input,
      types: 'address',
      components: 'country:us|administrative_area:ar',
      location: '36.1627,-94.1574',
      radius: '80000', // Increased radius for better coverage
      key: this.googleApiKey
    });

    const response = await fetch(`${baseUrl}?${params}`);
    
    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API status: ${data.status}`);
    }

    return data.predictions?.map((prediction: any) => ({
      place_id: prediction.place_id,
      description: prediction.description,
      main_text: prediction.structured_formatting?.main_text || prediction.description,
      secondary_text: prediction.structured_formatting?.secondary_text || '',
    })) || [];
  }

  /**
   * Enhanced fallback suggestions
   */
  private getFallbackSuggestions(input: string): LocationSuggestion[] {
    const query = input.toLowerCase().trim();
    const suggestions: LocationSuggestion[] = [];

    // Check zip codes first
    if (/^\d{1,5}$/.test(input)) {
      NWA_ZIP_CODES.forEach(zip => {
        if (zip.startsWith(input)) {
          suggestions.push({
            place_id: `zip_${zip}`,
            description: `${zip}, Arkansas, USA`,
            main_text: zip,
            secondary_text: 'Arkansas, USA'
          });
        }
      });
    }

    // Check cities with partial matching
    const matchingCities = Array.from(NWA_CITIES).filter(city => 
      city.includes(query) || query.includes(city)
    ).slice(0, 5);

    matchingCities.forEach(city => {
      const formattedCity = city.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      
      suggestions.push({
        place_id: `city_${city}`,
        description: `${formattedCity}, Arkansas, USA`,
        main_text: formattedCity,
        secondary_text: 'Arkansas, USA'
      });
    });

    // Add common address patterns for NWA
    if (query.includes('street') || query.includes('st') || query.includes('avenue') || query.includes('ave') || 
        query.includes('road') || query.includes('rd') || query.includes('drive') || query.includes('dr')) {
      
      // Try to extract potential city names from the address
      const words = query.split(/\s+/);
      for (const word of words) {
        if (this.isNWACity(word)) {
          const formattedCity = word.charAt(0).toUpperCase() + word.slice(1);
          suggestions.push({
            place_id: `address_${word}`,
            description: `${input}, ${formattedCity}, AR, USA`,
            main_text: input,
            secondary_text: `${formattedCity}, AR, USA`
          });
          break;
        }
      }
    }

    return suggestions;
  }

  /**
   * Enhanced location details with better error handling
   */
  async getLocationDetails(placeId?: string, coordinates?: { lat: number; lng: number }): Promise<LocationData | null> {
    try {
      let locationData: any = null;

      // Handle fallback place IDs
      if (placeId?.startsWith('zip_')) {
        const zipCode = placeId.replace('zip_', '');
        return {
          isNWA: this.isNWAZipCode(zipCode),
          city: '',
          state: 'AR',
          zipCode,
          formattedAddress: `${zipCode}, AR, USA`
        };
      }

      if (placeId?.startsWith('city_')) {
        const city = placeId.replace('city_', '');
        const formattedCity = city.split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        
        return {
          isNWA: this.isNWACity(city),
          city: formattedCity,
          state: 'AR',
          zipCode: '',
          formattedAddress: `${formattedCity}, AR, USA`
        };
      }

      if (placeId?.startsWith('address_')) {
        const city = placeId.replace('address_', '');
        const formattedCity = city.charAt(0).toUpperCase() + city.slice(1);
        
        return {
          isNWA: this.isNWACity(city),
          city: formattedCity,
          state: 'AR',
          zipCode: '',
          formattedAddress: `Address in ${formattedCity}, AR, USA`
        };
      }

      // Try Google Places Details API
      if (placeId && this.googleApiKey) {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?` +
          `place_id=${placeId}&` +
          `fields=address_components,geometry,formatted_address&` +
          `key=${this.googleApiKey}`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.status === 'OK') {
            locationData = data.result;
          }
        }
      }

      // Try reverse geocoding if we have coordinates
      if (!locationData && coordinates && this.googleApiKey) {
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?` +
          `latlng=${coordinates.lat},${coordinates.lng}&` +
          `key=${this.googleApiKey}`
        );

        if (response.ok) {
          const data = await response.json();
          if (data.status === 'OK') {
            locationData = data.results?.[0];
          }
        }
      }

      if (locationData) {
        return this.parseLocationData(locationData);
      }

      // Fallback for coordinates
      if (coordinates) {
        return this.createFallbackLocationData(coordinates);
      }

      return null;
    } catch (error) {
      console.error('Error getting location details:', error);
      
      // Fallback for coordinates
      if (coordinates) {
        return this.createFallbackLocationData(coordinates);
      }
      
      return null;
    }
  }

  /**
   * Parse Google Places/Geocoding API response
   */
  private parseLocationData(locationData: any): LocationData {
    const components = locationData.address_components || [];
    const geometry = locationData.geometry?.location;
    
    let city = '';
    let state = '';
    let zipCode = '';

    components.forEach((component: any) => {
      const types = component.types;
      
      if (types.includes('locality') || types.includes('sublocality')) {
        city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        state = component.short_name;
      } else if (types.includes('postal_code')) {
        zipCode = component.long_name;
      }
    });

    const latitude = geometry?.lat || 0;
    const longitude = geometry?.lng || 0;

    return {
      isNWA: this.isInNWABounds(latitude, longitude) || this.isNWAZipCode(zipCode) || this.isNWACity(city),
      city,
      state,
      zipCode,
      latitude,
      longitude,
      formattedAddress: locationData.formatted_address
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
      state: 'AR',
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
        console.error('Geolocation is not supported by this browser');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coordinates = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          try {
            const locationData = await this.getLocationDetails(undefined, coordinates);
            resolve(locationData);
          } catch (error) {
            console.error('Error getting location details:', error);
            resolve(this.createFallbackLocationData(coordinates));
          }
        },
        (error) => {
          console.error('Error getting current location:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000, // Increased timeout
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  /**
   * Enhanced validation for location input
   */
  async validateLocationInput(input: string): Promise<LocationData | null> {
    const trimmedInput = input.trim();
    
    // Check if it's a zip code
    const zipMatch = trimmedInput.match(/^\d{5}(-\d{4})?$/);
    if (zipMatch) {
      const zipCode = zipMatch[0].substring(0, 5);
      return {
        isNWA: this.isNWAZipCode(zipCode),
        city: '',
        state: 'AR',
        zipCode,
        formattedAddress: `${zipCode}, AR, USA`
      };
    }

    // Check if it's a known NWA city
    const cityMatch = trimmedInput.toLowerCase();
    if (this.isNWACity(cityMatch)) {
      const formattedCity = trimmedInput.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      
      return {
        isNWA: true,
        city: formattedCity,
        state: 'AR',
        zipCode: '',
        formattedAddress: `${formattedCity}, AR, USA`
      };
    }

    // Try to parse as an address
    const addressPattern = /^(.+?),?\s*([a-zA-Z\s]+),?\s*([A-Z]{2})?\s*(\d{5})?/;
    const addressMatch = trimmedInput.match(addressPattern);
    
    if (addressMatch) {
      const [, street, city, state, zip] = addressMatch;
      
      if (city && this.isNWACity(city.trim())) {
        const formattedCity = city.trim().split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        
        return {
          isNWA: true,
          city: formattedCity,
          state: state || 'AR',
          zipCode: zip || '',
          formattedAddress: `${street.trim()}, ${formattedCity}, ${state || 'AR'} ${zip || ''}`.trim()
        };
      }
    }

    return null;
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