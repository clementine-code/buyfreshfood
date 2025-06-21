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
  '72719', '72720', '72721', '72722', '72727', '72728', '72729', '72730',
  '72732', '72734', '72736', '72737', '72738', '72739', '72740', '72741',
  '72742', '72744', '72745', '72749', '72751', '72753', '72761', '72768', '72769'
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

// US State zip code ranges for better state detection
const STATE_ZIP_RANGES: { [key: string]: { min: number; max: number; state: string } } = {
  'OH': { min: 43000, max: 45999, state: 'OH' },
  'AR': { min: 71600, max: 72999, state: 'AR' },
  'TX': { min: 73000, max: 79999, state: 'TX' },
  'OK': { min: 73000, max: 74999, state: 'OK' },
  'MO': { min: 63000, max: 65999, state: 'MO' },
  'TN': { min: 37000, max: 38599, state: 'TN' },
  'MS': { min: 38600, max: 39799, state: 'MS' },
  'LA': { min: 70000, max: 71599, state: 'LA' },
  'KS': { min: 66000, max: 67999, state: 'KS' },
  'AL': { min: 35000, max: 36999, state: 'AL' },
  'GA': { min: 30000, max: 31999, state: 'GA' },
  'FL': { min: 32000, max: 34999, state: 'FL' },
  'SC': { min: 29000, max: 29999, state: 'SC' },
  'NC': { min: 27000, max: 28999, state: 'NC' },
  'VA': { min: 20100, max: 26999, state: 'VA' },
  'WV': { min: 24700, max: 26999, state: 'WV' },
  'KY': { min: 40000, max: 42799, state: 'KY' },
  'IN': { min: 46000, max: 47999, state: 'IN' },
  'IL': { min: 60000, max: 62999, state: 'IL' },
  'WI': { min: 53000, max: 54999, state: 'WI' },
  'MI': { min: 48000, max: 49999, state: 'MI' },
  'IA': { min: 50000, max: 52999, state: 'IA' },
  'MN': { min: 55000, max: 56799, state: 'MN' },
  'SD': { min: 57000, max: 57799, state: 'SD' },
  'ND': { min: 58000, max: 58899, state: 'ND' },
  'MT': { min: 59000, max: 59999, state: 'MT' },
  'WY': { min: 82000, max: 83199, state: 'WY' },
  'CO': { min: 80000, max: 81699, state: 'CO' },
  'NM': { min: 87000, max: 88499, state: 'NM' },
  'AZ': { min: 85000, max: 86599, state: 'AZ' },
  'UT': { min: 84000, max: 84799, state: 'UT' },
  'NV': { min: 89000, max: 89899, state: 'NV' },
  'ID': { min: 83200, max: 83899, state: 'ID' },
  'WA': { min: 98000, max: 99499, state: 'WA' },
  'OR': { min: 97000, max: 97999, state: 'OR' },
  'CA': { min: 90000, max: 96199, state: 'CA' },
  'AK': { min: 99500, max: 99999, state: 'AK' },
  'HI': { min: 96700, max: 96899, state: 'HI' },
  'NY': { min: 10000, max: 14999, state: 'NY' },
  'PA': { min: 15000, max: 19699, state: 'PA' },
  'NJ': { min: 7000, max: 8999, state: 'NJ' },
  'CT': { min: 6000, max: 6999, state: 'CT' },
  'MA': { min: 1000, max: 2799, state: 'MA' },
  'RI': { min: 2800, max: 2999, state: 'RI' },
  'VT': { min: 5000, max: 5999, state: 'VT' },
  'NH': { min: 3000, max: 3899, state: 'NH' },
  'ME': { min: 3900, max: 4999, state: 'ME' },
  'DE': { min: 19700, max: 19999, state: 'DE' },
  'MD': { min: 20000, max: 21999, state: 'MD' },
  'DC': { min: 20000, max: 20599, state: 'DC' }
};

class LocationService {
  private googleApiKey: string;
  private mapboxToken: string;

  constructor() {
    this.googleApiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || '';
    this.mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
  }

  /**
   * Get state from zip code using zip code ranges
   */
  getStateFromZipCode(zipCode: string): string {
    const zip = parseInt(zipCode.replace(/\D/g, '').substring(0, 5));
    
    for (const [, range] of Object.entries(STATE_ZIP_RANGES)) {
      if (zip >= range.min && zip <= range.max) {
        return range.state;
      }
    }
    
    return 'Unknown';
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

    const suggestions: LocationSuggestion[] = [];

    // 1. Always start with fallback suggestions for immediate response
    const fallbackResults = this.getFallbackSuggestions(input);
    suggestions.push(...fallbackResults);

    // 2. Try external APIs if available (but don't block on them)
    try {
      if (this.googleApiKey && this.googleApiKey !== 'your_google_places_api_key_here') {
        const googleResults = await this.getGooglePlacesSuggestions(input);
        suggestions.push(...googleResults);
      } else {
        // If no API key, enhance fallback suggestions
        const enhancedFallback = this.getEnhancedFallbackSuggestions(input);
        suggestions.push(...enhancedFallback);
      }
    } catch (error) {
      console.warn('External API error, using fallback suggestions:', error);
    }

    // 3. Remove duplicates and limit results
    const uniqueSuggestions = suggestions.filter((suggestion, index, self) => 
      index === self.findIndex(s => s.description.toLowerCase() === suggestion.description.toLowerCase())
    );

    return uniqueSuggestions.slice(0, 8);
  }

  /**
   * Enhanced fallback suggestions when APIs aren't available
   */
  private getEnhancedFallbackSuggestions(input: string): LocationSuggestion[] {
    const suggestions: LocationSuggestion[] = [];
    const query = input.toLowerCase().trim();

    // Enhanced address pattern matching
    if (this.looksLikeAddress(input)) {
      // Try common address patterns for NWA
      const commonStreets = ['main', 'college', 'university', 'center', 'north', 'south', 'east', 'west'];
      const addressParts = input.toLowerCase().split(/[\s,]+/);
      
      for (const street of commonStreets) {
        if (addressParts.some(part => part.includes(street))) {
          // Suggest completions for NWA cities
          ['Fayetteville', 'Rogers', 'Bentonville', 'Springdale'].forEach(city => {
            suggestions.push({
              place_id: `enhanced_address_${city.toLowerCase()}`,
              description: `${input}, ${city}, AR, USA`,
              main_text: input,
              secondary_text: `${city}, AR, USA`
            });
          });
          break;
        }
      }
    }

    // Enhanced city matching with partial matches
    const partialCityMatches = Array.from(NWA_CITIES).filter(city => 
      city.includes(query) || query.includes(city) || this.fuzzyMatch(city, query)
    ).slice(0, 6);

    partialCityMatches.forEach(city => {
      const formattedCity = city.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
      
      suggestions.push({
        place_id: `enhanced_city_${city}`,
        description: `${formattedCity}, Arkansas, USA`,
        main_text: formattedCity,
        secondary_text: 'Arkansas, USA'
      });
    });

    return suggestions;
  }

  /**
   * Simple fuzzy matching for city names
   */
  private fuzzyMatch(target: string, query: string): boolean {
    if (query.length < 3) return false;
    
    // Check if query is a substring or if target starts with query
    return target.startsWith(query) || 
           target.includes(query) ||
           query.split('').every((char, i) => target.indexOf(char, i) !== -1);
  }

  /**
   * Get suggestions from Google Places API with improved parameters for addresses
   */
  private async getGooglePlacesSuggestions(input: string): Promise<LocationSuggestion[]> {
    // Note: This is a mock implementation since we don't have a real API key
    // In production, you would implement the actual Google Places API call here
    
    // For now, return enhanced fallback suggestions
    return this.getEnhancedFallbackSuggestions(input);
  }

  /**
   * Enhanced fallback suggestions with better address and zip code support
   */
  private getFallbackSuggestions(input: string): LocationSuggestion[] {
    const query = input.toLowerCase().trim();
    const suggestions: LocationSuggestion[] = [];

    // Enhanced zip code matching
    if (/^\d{1,5}$/.test(input)) {
      const zipNum = parseInt(input);
      
      // Check NWA zip codes first
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

      // Add suggestions for other states based on zip code ranges
      for (const [, range] of Object.entries(STATE_ZIP_RANGES)) {
        if (zipNum >= range.min && zipNum <= range.max) {
          // Generate some example zip codes in this range
          const baseZip = Math.floor(zipNum / 100) * 100;
          for (let i = 0; i < 3; i++) {
            const suggestedZip = (baseZip + i).toString().padStart(5, '0');
            if (suggestedZip.startsWith(input) && suggestedZip !== input) {
              suggestions.push({
                place_id: `zip_${suggestedZip}`,
                description: `${suggestedZip}, ${range.state}, USA`,
                main_text: suggestedZip,
                secondary_text: `${range.state}, USA`
              });
            }
          }
          break;
        }
      }
    }

    // Enhanced city matching for NWA
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

    // Enhanced address pattern matching
    if (this.looksLikeAddress(input)) {
      // Try to extract city from address
      const addressParts = input.split(',').map(part => part.trim());
      let detectedCity = '';
      
      // Look for NWA cities in the address
      for (const part of addressParts) {
        const words = part.toLowerCase().split(/\s+/);
        for (const word of words) {
          if (this.isNWACity(word)) {
            detectedCity = word;
            break;
          }
        }
        if (detectedCity) break;
      }

      if (detectedCity) {
        const formattedCity = detectedCity.charAt(0).toUpperCase() + detectedCity.slice(1);
        suggestions.push({
          place_id: `address_${detectedCity}`,
          description: `${input}, ${formattedCity}, AR, USA`,
          main_text: input,
          secondary_text: `${formattedCity}, AR, USA`
        });
      } else {
        // Generic address suggestion for major NWA cities
        ['Fayetteville', 'Rogers', 'Bentonville', 'Springdale'].forEach(city => {
          suggestions.push({
            place_id: `address_${city.toLowerCase()}`,
            description: `${input}, ${city}, AR, USA`,
            main_text: input,
            secondary_text: `${city}, AR, USA`
          });
        });
      }
    }

    return suggestions;
  }

  /**
   * Check if input looks like a street address
   */
  private looksLikeAddress(input: string): boolean {
    const addressPatterns = [
      /^\d+\s+\w+/, // Starts with number and word (123 Main)
      /\d+\s+\w+\s+(street|st|avenue|ave|road|rd|drive|dr|lane|ln|court|ct|circle|cir|way|blvd|boulevard)/i,
      /\w+\s+(street|st|avenue|ave|road|rd|drive|dr|lane|ln|court|ct|circle|cir|way|blvd|boulevard)/i
    ];
    
    return addressPatterns.some(pattern => pattern.test(input.trim()));
  }

  /**
   * Enhanced location details with better error handling and state detection
   */
  async getLocationDetails(placeId?: string, coordinates?: { lat: number; lng: number }): Promise<LocationData | null> {
    try {
      let locationData: any = null;

      // Handle fallback place IDs with improved state detection
      if (placeId?.startsWith('zip_')) {
        const zipCode = placeId.replace('zip_', '');
        const state = this.getStateFromZipCode(zipCode);
        return {
          isNWA: this.isNWAZipCode(zipCode),
          city: '',
          state: state,
          zipCode,
          formattedAddress: `${zipCode}, ${state}, USA`
        };
      }

      if (placeId?.startsWith('city_') || placeId?.startsWith('enhanced_city_')) {
        const city = placeId.replace(/^(city_|enhanced_city_)/, '');
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

      if (placeId?.startsWith('address_') || placeId?.startsWith('enhanced_address_')) {
        const city = placeId.replace(/^(address_|enhanced_address_)/, '');
        if (city !== 'generic') {
          const formattedCity = city.charAt(0).toUpperCase() + city.slice(1);
          return {
            isNWA: this.isNWACity(city),
            city: formattedCity,
            state: 'AR',
            zipCode: '',
            formattedAddress: `Address in ${formattedCity}, AR, USA`
          };
        }
      }

      // For real API integration, you would implement Google Places Details API here
      // For now, fallback to coordinate-based location
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
   * Parse Google Places/Geocoding API response with better state detection
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
        state = component.short_name; // This should give us the correct state abbreviation
      } else if (types.includes('postal_code')) {
        zipCode = component.long_name;
      }
    });

    // Fallback state detection from zip code if not found in components
    if (!state && zipCode) {
      state = this.getStateFromZipCode(zipCode);
    }

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
          timeout: 15000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  /**
   * Enhanced validation for location input with better state detection
   */
  async validateLocationInput(input: string): Promise<LocationData | null> {
    const trimmedInput = input.trim();
    
    // Check if it's a zip code
    const zipMatch = trimmedInput.match(/^\d{5}(-\d{4})?$/);
    if (zipMatch) {
      const zipCode = zipMatch[0].substring(0, 5);
      const state = this.getStateFromZipCode(zipCode);
      return {
        isNWA: this.isNWAZipCode(zipCode),
        city: '',
        state: state,
        zipCode,
        formattedAddress: `${zipCode}, ${state}, USA`
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

    // Try to parse as an address with better state detection
    const addressPattern = /^(.+?),?\s*([a-zA-Z\s]+),?\s*([A-Z]{2})?\s*(\d{5})?/;
    const addressMatch = trimmedInput.match(addressPattern);
    
    if (addressMatch) {
      const [, street, city, state, zip] = addressMatch;
      
      let detectedState = state;
      if (!detectedState && zip) {
        detectedState = this.getStateFromZipCode(zip);
      }
      
      if (city && this.isNWACity(city.trim())) {
        const formattedCity = city.trim().split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        
        return {
          isNWA: true,
          city: formattedCity,
          state: detectedState || 'AR',
          zipCode: zip || '',
          formattedAddress: `${street.trim()}, ${formattedCity}, ${detectedState || 'AR'} ${zip || ''}`.trim()
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