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

// US State zip code ranges for accurate state detection
const STATE_ZIP_RANGES: { [key: string]: { min: number; max: number; state: string } } = {
  'AL': { min: 35000, max: 36999, state: 'AL' },
  'AK': { min: 99500, max: 99999, state: 'AK' },
  'AZ': { min: 85000, max: 86599, state: 'AZ' },
  'AR': { min: 71600, max: 72999, state: 'AR' },
  'CA': { min: 90000, max: 96199, state: 'CA' },
  'CO': { min: 80000, max: 81699, state: 'CO' },
  'CT': { min: 6000, max: 6999, state: 'CT' },
  'DE': { min: 19700, max: 19999, state: 'DE' },
  'DC': { min: 20000, max: 20599, state: 'DC' },
  'FL': { min: 32000, max: 34999, state: 'FL' },
  'GA': { min: 30000, max: 31999, state: 'GA' },
  'HI': { min: 96700, max: 96899, state: 'HI' },
  'ID': { min: 83200, max: 83899, state: 'ID' },
  'IL': { min: 60000, max: 62999, state: 'IL' },
  'IN': { min: 46000, max: 47999, state: 'IN' },
  'IA': { min: 50000, max: 52999, state: 'IA' },
  'KS': { min: 66000, max: 67999, state: 'KS' },
  'KY': { min: 40000, max: 42799, state: 'KY' },
  'LA': { min: 70000, max: 71599, state: 'LA' },
  'ME': { min: 3900, max: 4999, state: 'ME' },
  'MD': { min: 20000, max: 21999, state: 'MD' },
  'MA': { min: 1000, max: 2799, state: 'MA' },
  'MI': { min: 48000, max: 49999, state: 'MI' },
  'MN': { min: 55000, max: 56799, state: 'MN' },
  'MS': { min: 38600, max: 39799, state: 'MS' },
  'MO': { min: 63000, max: 65999, state: 'MO' },
  'MT': { min: 59000, max: 59999, state: 'MT' },
  'NE': { min: 68000, max: 69399, state: 'NE' },
  'NV': { min: 89000, max: 89899, state: 'NV' },
  'NH': { min: 3000, max: 3899, state: 'NH' },
  'NJ': { min: 7000, max: 8999, state: 'NJ' },
  'NM': { min: 87000, max: 88499, state: 'NM' },
  'NY': { min: 10000, max: 14999, state: 'NY' },
  'NC': { min: 27000, max: 28999, state: 'NC' },
  'ND': { min: 58000, max: 58899, state: 'ND' },
  'OH': { min: 43000, max: 45999, state: 'OH' },
  'OK': { min: 73000, max: 74999, state: 'OK' },
  'OR': { min: 97000, max: 97999, state: 'OR' },
  'PA': { min: 15000, max: 19699, state: 'PA' },
  'RI': { min: 2800, max: 2999, state: 'RI' },
  'SC': { min: 29000, max: 29999, state: 'SC' },
  'SD': { min: 57000, max: 57799, state: 'SD' },
  'TN': { min: 37000, max: 38599, state: 'TN' },
  'TX': { min: 73000, max: 79999, state: 'TX' },
  'UT': { min: 84000, max: 84799, state: 'UT' },
  'VT': { min: 5000, max: 5999, state: 'VT' },
  'VA': { min: 20100, max: 26999, state: 'VA' },
  'WA': { min: 98000, max: 99499, state: 'WA' },
  'WV': { min: 24700, max: 26999, state: 'WV' },
  'WI': { min: 53000, max: 54999, state: 'WI' },
  'WY': { min: 82000, max: 83199, state: 'WY' }
};

// Major US cities database for better address suggestions
const MAJOR_CITIES: { [key: string]: { state: string; zip?: string } } = {
  // Ohio cities
  'columbus': { state: 'OH', zip: '43215' },
  'cleveland': { state: 'OH', zip: '44113' },
  'cincinnati': { state: 'OH', zip: '45202' },
  'toledo': { state: 'OH', zip: '43604' },
  'akron': { state: 'OH', zip: '44308' },
  'dayton': { state: 'OH', zip: '45402' },
  // Arkansas cities
  'little rock': { state: 'AR', zip: '72201' },
  'fort smith': { state: 'AR', zip: '72901' },
  'fayetteville': { state: 'AR', zip: '72701' },
  'springdale': { state: 'AR', zip: '72762' },
  'jonesboro': { state: 'AR', zip: '72401' },
  'north little rock': { state: 'AR', zip: '72114' },
  'conway': { state: 'AR', zip: '72032' },
  'rogers': { state: 'AR', zip: '72756' },
  'bentonville': { state: 'AR', zip: '72712' },
  'pine bluff': { state: 'AR', zip: '71601' },
  // Texas cities
  'houston': { state: 'TX', zip: '77002' },
  'dallas': { state: 'TX', zip: '75201' },
  'san antonio': { state: 'TX', zip: '78205' },
  'austin': { state: 'TX', zip: '78701' },
  'fort worth': { state: 'TX', zip: '76102' },
  'el paso': { state: 'TX', zip: '79901' },
  // Add more major cities as needed
};

class LocationService {
  private googleApiKey: string;
  private mapboxToken: string;

  constructor() {
    this.googleApiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || '';
    this.mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
  }

  /**
   * Get state from zip code using accurate zip code ranges
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
   * Enhanced location suggestions with better address and city support
   */
  async getLocationSuggestions(input: string): Promise<LocationSuggestion[]> {
    if (input.length < 3) {
      return [];
    }

    const suggestions: LocationSuggestion[] = [];
    const query = input.toLowerCase().trim();

    // 1. Zip code suggestions (highest priority)
    if (/^\d{1,5}$/.test(input)) {
      const zipSuggestions = this.getZipCodeSuggestions(input);
      suggestions.push(...zipSuggestions);
    }

    // 2. City name suggestions
    const citySuggestions = this.getCitySuggestions(query);
    suggestions.push(...citySuggestions);

    // 3. Address suggestions (improved)
    if (this.looksLikeAddress(input)) {
      const addressSuggestions = this.getAddressSuggestions(input);
      suggestions.push(...addressSuggestions);
    }

    // 4. Remove duplicates and limit results
    const uniqueSuggestions = suggestions.filter((suggestion, index, self) => 
      index === self.findIndex(s => s.description.toLowerCase() === suggestion.description.toLowerCase())
    );

    return uniqueSuggestions.slice(0, 8);
  }

  /**
   * Get zip code suggestions with accurate state mapping
   */
  private getZipCodeSuggestions(input: string): LocationSuggestion[] {
    const suggestions: LocationSuggestion[] = [];
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
        // Generate realistic zip codes in this range
        const baseZip = Math.floor(zipNum / 1000) * 1000;
        for (let i = 0; i < 5; i++) {
          const suggestedZip = (baseZip + i * 100).toString().padStart(5, '0');
          if (suggestedZip.startsWith(input) && suggestedZip !== input && suggestions.length < 6) {
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

    return suggestions;
  }

  /**
   * Get city suggestions with better nationwide coverage
   */
  private getCitySuggestions(query: string): LocationSuggestion[] {
    const suggestions: LocationSuggestion[] = [];

    // Check NWA cities first
    const nwaCities = Array.from(NWA_CITIES).filter(city => 
      city.includes(query) || query.includes(city)
    ).slice(0, 3);

    nwaCities.forEach(city => {
      const formattedCity = this.formatCityName(city);
      suggestions.push({
        place_id: `city_${city}`,
        description: `${formattedCity}, Arkansas, USA`,
        main_text: formattedCity,
        secondary_text: 'Arkansas, USA'
      });
    });

    // Check major US cities
    const majorCityMatches = Object.entries(MAJOR_CITIES).filter(([city, data]) => 
      city.includes(query) || query.includes(city)
    ).slice(0, 5);

    majorCityMatches.forEach(([city, data]) => {
      const formattedCity = this.formatCityName(city);
      suggestions.push({
        place_id: `major_city_${city}`,
        description: `${formattedCity}, ${data.state}, USA`,
        main_text: formattedCity,
        secondary_text: `${data.state}, USA`
      });
    });

    return suggestions;
  }

  /**
   * Get address suggestions with better city detection
   */
  private getAddressSuggestions(input: string): LocationSuggestion[] {
    const suggestions: LocationSuggestion[] = [];
    const addressParts = input.toLowerCase().split(/[\s,]+/);
    
    // Try to detect city in the address
    let detectedCity = '';
    let detectedState = '';

    // Check for NWA cities in address
    for (const part of addressParts) {
      if (this.isNWACity(part)) {
        detectedCity = part;
        detectedState = 'AR';
        break;
      }
    }

    // Check for major cities in address
    if (!detectedCity) {
      for (const part of addressParts) {
        const cityData = MAJOR_CITIES[part];
        if (cityData) {
          detectedCity = part;
          detectedState = cityData.state;
          break;
        }
      }
    }

    if (detectedCity) {
      const formattedCity = this.formatCityName(detectedCity);
      suggestions.push({
        place_id: `address_${detectedCity}`,
        description: `${input}, ${formattedCity}, ${detectedState}, USA`,
        main_text: input,
        secondary_text: `${formattedCity}, ${detectedState}, USA`
      });
    } else {
      // Generic address suggestions for major NWA cities
      ['Fayetteville', 'Rogers', 'Bentonville', 'Springdale'].forEach(city => {
        suggestions.push({
          place_id: `address_${city.toLowerCase()}`,
          description: `${input}, ${city}, AR, USA`,
          main_text: input,
          secondary_text: `${city}, AR, USA`
        });
      });

      // Add suggestions for major cities in nearby states
      ['Little Rock, AR', 'Tulsa, OK', 'Kansas City, MO'].forEach(cityState => {
        const [city, state] = cityState.split(', ');
        suggestions.push({
          place_id: `address_${city.toLowerCase().replace(' ', '_')}`,
          description: `${input}, ${cityState}, USA`,
          main_text: input,
          secondary_text: `${cityState}, USA`
        });
      });
    }

    return suggestions;
  }

  /**
   * Format city name properly
   */
  private formatCityName(city: string): string {
    return city.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
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
   * Enhanced location details with better handling of all suggestion types
   */
  async getLocationDetails(placeId?: string, coordinates?: { lat: number; lng: number }): Promise<LocationData | null> {
    try {
      // Handle zip code suggestions
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

      // Handle city suggestions
      if (placeId?.startsWith('city_') || placeId?.startsWith('major_city_')) {
        const city = placeId.replace(/^(city_|major_city_)/, '');
        const formattedCity = this.formatCityName(city);
        
        // Check if it's an NWA city
        if (this.isNWACity(city)) {
          return {
            isNWA: true,
            city: formattedCity,
            state: 'AR',
            zipCode: '',
            formattedAddress: `${formattedCity}, AR, USA`
          };
        }

        // Check if it's a major city
        const cityData = MAJOR_CITIES[city];
        if (cityData) {
          return {
            isNWA: false,
            city: formattedCity,
            state: cityData.state,
            zipCode: cityData.zip || '',
            formattedAddress: `${formattedCity}, ${cityData.state}, USA`
          };
        }
      }

      // Handle address suggestions
      if (placeId?.startsWith('address_')) {
        const cityKey = placeId.replace('address_', '');
        
        if (this.isNWACity(cityKey)) {
          const formattedCity = this.formatCityName(cityKey);
          return {
            isNWA: true,
            city: formattedCity,
            state: 'AR',
            zipCode: '',
            formattedAddress: `Address in ${formattedCity}, AR, USA`
          };
        }

        // Handle major city addresses
        const cityData = MAJOR_CITIES[cityKey.replace('_', ' ')];
        if (cityData) {
          const formattedCity = this.formatCityName(cityKey.replace('_', ' '));
          return {
            isNWA: false,
            city: formattedCity,
            state: cityData.state,
            zipCode: cityData.zip || '',
            formattedAddress: `Address in ${formattedCity}, ${cityData.state}, USA`
          };
        }
      }

      // Handle direct match
      if (placeId === 'direct_match' && coordinates) {
        return this.createFallbackLocationData(coordinates);
      }

      // Fallback for coordinates
      if (coordinates) {
        return this.createFallbackLocationData(coordinates);
      }

      return null;
    } catch (error) {
      console.error('Error getting location details:', error);
      
      if (coordinates) {
        return this.createFallbackLocationData(coordinates);
      }
      
      return null;
    }
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
   * Enhanced validation for location input with better address and city support
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

    // Check if it's a known city (NWA or major city)
    const cityMatch = trimmedInput.toLowerCase();
    if (this.isNWACity(cityMatch)) {
      const formattedCity = this.formatCityName(cityMatch);
      return {
        isNWA: true,
        city: formattedCity,
        state: 'AR',
        zipCode: '',
        formattedAddress: `${formattedCity}, AR, USA`
      };
    }

    // Check major cities
    const majorCityData = MAJOR_CITIES[cityMatch];
    if (majorCityData) {
      const formattedCity = this.formatCityName(cityMatch);
      return {
        isNWA: false,
        city: formattedCity,
        state: majorCityData.state,
        zipCode: majorCityData.zip || '',
        formattedAddress: `${formattedCity}, ${majorCityData.state}, USA`
      };
    }

    // Try to parse as an address with better city and state detection
    const addressPattern = /^(.+?),?\s*([a-zA-Z\s]+),?\s*([A-Z]{2})?\s*(\d{5})?/;
    const addressMatch = trimmedInput.match(addressPattern);
    
    if (addressMatch) {
      const [, street, city, state, zip] = addressMatch;
      const cityLower = city?.trim().toLowerCase();
      
      let detectedState = state;
      if (!detectedState && zip) {
        detectedState = this.getStateFromZipCode(zip);
      }
      
      // Check if it's an NWA city
      if (cityLower && this.isNWACity(cityLower)) {
        const formattedCity = this.formatCityName(cityLower);
        return {
          isNWA: true,
          city: formattedCity,
          state: detectedState || 'AR',
          zipCode: zip || '',
          formattedAddress: `${street.trim()}, ${formattedCity}, ${detectedState || 'AR'} ${zip || ''}`.trim()
        };
      }

      // Check if it's a major city
      if (cityLower) {
        const majorCityData = MAJOR_CITIES[cityLower];
        if (majorCityData) {
          const formattedCity = this.formatCityName(cityLower);
          return {
            isNWA: false,
            city: formattedCity,
            state: detectedState || majorCityData.state,
            zipCode: zip || majorCityData.zip || '',
            formattedAddress: `${street.trim()}, ${formattedCity}, ${detectedState || majorCityData.state} ${zip || ''}`.trim()
          };
        }
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