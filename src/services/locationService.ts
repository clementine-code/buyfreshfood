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
const MAJOR_CITIES: { [key: string]: { state: string; zip?: string; lat?: number; lng?: number } } = {
  // Arkansas cities (with coordinates)
  'little rock': { state: 'AR', zip: '72201', lat: 34.7465, lng: -92.2896 },
  'fort smith': { state: 'AR', zip: '72901', lat: 35.3859, lng: -94.3985 },
  'fayetteville': { state: 'AR', zip: '72701', lat: 36.0822, lng: -94.1719 },
  'springdale': { state: 'AR', zip: '72762', lat: 36.1867, lng: -94.1288 },
  'jonesboro': { state: 'AR', zip: '72401', lat: 35.8423, lng: -90.7043 },
  'north little rock': { state: 'AR', zip: '72114', lat: 34.7695, lng: -92.2671 },
  'conway': { state: 'AR', zip: '72032', lat: 35.0887, lng: -92.4421 },
  'rogers': { state: 'AR', zip: '72756', lat: 36.3321, lng: -94.1185 },
  'bentonville': { state: 'AR', zip: '72712', lat: 36.3729, lng: -94.2088 },
  'pine bluff': { state: 'AR', zip: '71601', lat: 34.2284, lng: -92.0032 },
  
  // Major US cities
  'new york': { state: 'NY', zip: '10001', lat: 40.7128, lng: -74.0060 },
  'los angeles': { state: 'CA', zip: '90001', lat: 34.0522, lng: -118.2437 },
  'chicago': { state: 'IL', zip: '60601', lat: 41.8781, lng: -87.6298 },
  'houston': { state: 'TX', zip: '77002', lat: 29.7604, lng: -95.3698 },
  'phoenix': { state: 'AZ', zip: '85001', lat: 33.4484, lng: -112.0740 },
  'philadelphia': { state: 'PA', zip: '19101', lat: 39.9526, lng: -75.1652 },
  'san antonio': { state: 'TX', zip: '78205', lat: 29.4241, lng: -98.4936 },
  'san diego': { state: 'CA', zip: '92101', lat: 32.7157, lng: -117.1611 },
  'dallas': { state: 'TX', zip: '75201', lat: 32.7767, lng: -96.7970 },
  'san jose': { state: 'CA', zip: '95101', lat: 37.3382, lng: -121.8863 },
  'austin': { state: 'TX', zip: '78701', lat: 30.2672, lng: -97.7431 },
  'jacksonville': { state: 'FL', zip: '32099', lat: 30.3322, lng: -81.6557 },
  'fort worth': { state: 'TX', zip: '76102', lat: 32.7555, lng: -97.3308 },
  'columbus': { state: 'OH', zip: '43215', lat: 39.9612, lng: -82.9988 },
  'charlotte': { state: 'NC', zip: '28201', lat: 35.2271, lng: -80.8431 },
  'san francisco': { state: 'CA', zip: '94102', lat: 37.7749, lng: -122.4194 },
  'indianapolis': { state: 'IN', zip: '46201', lat: 39.7684, lng: -86.1581 },
  'seattle': { state: 'WA', zip: '98101', lat: 47.6062, lng: -122.3321 },
  'denver': { state: 'CO', zip: '80201', lat: 39.7392, lng: -104.9903 },
  'washington': { state: 'DC', zip: '20001', lat: 38.9072, lng: -77.0369 },
  'boston': { state: 'MA', zip: '02101', lat: 42.3601, lng: -71.0589 },
  'el paso': { state: 'TX', zip: '79901', lat: 31.7619, lng: -106.4850 },
  'detroit': { state: 'MI', zip: '48201', lat: 42.3314, lng: -83.0458 },
  'nashville': { state: 'TN', zip: '37201', lat: 36.1627, lng: -86.7816 },
  'portland': { state: 'OR', zip: '97201', lat: 45.5152, lng: -122.6784 },
  'oklahoma city': { state: 'OK', zip: '73101', lat: 35.4676, lng: -97.5164 },
  'las vegas': { state: 'NV', zip: '89101', lat: 36.1699, lng: -115.1398 },
  'louisville': { state: 'KY', zip: '40201', lat: 38.2527, lng: -85.7585 },
  'baltimore': { state: 'MD', zip: '21201', lat: 39.2904, lng: -76.6122 },
  'milwaukee': { state: 'WI', zip: '53201', lat: 43.0389, lng: -87.9065 },
  'albuquerque': { state: 'NM', zip: '87101', lat: 35.0844, lng: -106.6504 },
  'tucson': { state: 'AZ', zip: '85701', lat: 32.2226, lng: -110.9747 },
  'fresno': { state: 'CA', zip: '93701', lat: 36.7378, lng: -119.7871 },
  'sacramento': { state: 'CA', zip: '95814', lat: 38.5816, lng: -121.4944 },
  'kansas city': { state: 'MO', zip: '64101', lat: 39.0997, lng: -94.5786 },
  'mesa': { state: 'AZ', zip: '85201', lat: 33.4152, lng: -111.8315 },
  'atlanta': { state: 'GA', zip: '30301', lat: 33.7490, lng: -84.3880 },
  'colorado springs': { state: 'CO', zip: '80901', lat: 38.8339, lng: -104.8214 },
  'raleigh': { state: 'NC', zip: '27601', lat: 35.7796, lng: -78.6382 },
  'omaha': { state: 'NE', zip: '68101', lat: 41.2565, lng: -95.9345 },
  'miami': { state: 'FL', zip: '33101', lat: 25.7617, lng: -80.1918 },
  'oakland': { state: 'CA', zip: '94601', lat: 37.8044, lng: -122.2711 },
  'minneapolis': { state: 'MN', zip: '55401', lat: 44.9778, lng: -93.2650 },
  'tulsa': { state: 'OK', zip: '74101', lat: 36.1540, lng: -95.9928 },
  'cleveland': { state: 'OH', zip: '44113', lat: 41.4993, lng: -81.6944 },
  'wichita': { state: 'KS', zip: '67201', lat: 37.6872, lng: -97.3301 },
  'arlington': { state: 'TX', zip: '76001', lat: 32.7357, lng: -97.1081 }
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
   * Enhanced location suggestions with comprehensive coverage
   */
  async getLocationSuggestions(input: string): Promise<LocationSuggestion[]> {
    if (input.length < 2) {
      return [];
    }

    const suggestions: LocationSuggestion[] = [];
    const query = input.toLowerCase().trim();

    console.log('🔍 Searching for location suggestions:', query);

    try {
      // 1. Zip code suggestions (highest priority)
      if (/^\d{1,5}$/.test(input)) {
        const zipSuggestions = this.getZipCodeSuggestions(input);
        suggestions.push(...zipSuggestions);
        console.log('📮 Found zip suggestions:', zipSuggestions.length);
      }

      // 2. City name suggestions (NWA cities first)
      const citySuggestions = this.getCitySuggestions(query);
      suggestions.push(...citySuggestions);
      console.log('🏙️ Found city suggestions:', citySuggestions.length);

      // 3. Address suggestions
      if (this.looksLikeAddress(input)) {
        const addressSuggestions = this.getAddressSuggestions(input);
        suggestions.push(...addressSuggestions);
        console.log('🏠 Found address suggestions:', addressSuggestions.length);
      }

      // 4. State suggestions for broader searches
      const stateSuggestions = this.getStateSuggestions(query);
      suggestions.push(...stateSuggestions);
      console.log('🗺️ Found state suggestions:', stateSuggestions.length);

      // Remove duplicates and limit results
      const uniqueSuggestions = suggestions.filter((suggestion, index, self) => 
        index === self.findIndex(s => s.description.toLowerCase() === suggestion.description.toLowerCase())
      );

      console.log('✅ Total unique suggestions:', uniqueSuggestions.length);
      return uniqueSuggestions.slice(0, 8);

    } catch (error) {
      console.error('❌ Error in getLocationSuggestions:', error);
      return [];
    }
  }

  /**
   * Get zip code suggestions with accurate state mapping
   */
  private getZipCodeSuggestions(input: string): LocationSuggestion[] {
    const suggestions: LocationSuggestion[] = [];
    const zipNum = parseInt(input);

    // Check NWA zip codes first (highest priority)
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
      if (zipNum >= range.min && zipNum <= range.max && suggestions.length < 6) {
        // Generate realistic zip codes in this range
        const baseZip = Math.floor(zipNum / 1000) * 1000;
        for (let i = 0; i < 3; i++) {
          const suggestedZip = (baseZip + i * 100).toString().padStart(5, '0');
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

    return suggestions;
  }

  /**
   * Get city suggestions with better nationwide coverage
   */
  private getCitySuggestions(query: string): LocationSuggestion[] {
    const suggestions: LocationSuggestion[] = [];

    // Check NWA cities first (highest priority)
    const nwaCities = Array.from(NWA_CITIES).filter(city => 
      city.includes(query) || query.includes(city)
    ).slice(0, 4);

    nwaCities.forEach(city => {
      const formattedCity = this.formatCityName(city);
      const cityData = MAJOR_CITIES[city];
      suggestions.push({
        place_id: `nwa_city_${city}`,
        description: `${formattedCity}, Arkansas, USA`,
        main_text: formattedCity,
        secondary_text: 'Arkansas, USA',
        coordinates: cityData?.lat && cityData?.lng ? {
          lat: cityData.lat,
          lng: cityData.lng
        } : undefined
      });
    });

    // Check major US cities
    const majorCityMatches = Object.entries(MAJOR_CITIES).filter(([city, data]) => 
      city.includes(query) || query.includes(city)
    ).slice(0, 6);

    majorCityMatches.forEach(([city, data]) => {
      const formattedCity = this.formatCityName(city);
      suggestions.push({
        place_id: `major_city_${city}`,
        description: `${formattedCity}, ${data.state}, USA`,
        main_text: formattedCity,
        secondary_text: `${data.state}, USA`,
        coordinates: data.lat && data.lng ? {
          lat: data.lat,
          lng: data.lng
        } : undefined
      });
    });

    return suggestions;
  }

  /**
   * Get state suggestions for broader searches
   */
  private getStateSuggestions(query: string): LocationSuggestion[] {
    const suggestions: LocationSuggestion[] = [];
    
    // State name mappings
    const stateNames: { [key: string]: string } = {
      'arkansas': 'AR', 'texas': 'TX', 'oklahoma': 'OK', 'missouri': 'MO',
      'louisiana': 'LA', 'tennessee': 'TN', 'mississippi': 'MS', 'alabama': 'AL',
      'california': 'CA', 'florida': 'FL', 'new york': 'NY', 'illinois': 'IL',
      'pennsylvania': 'PA', 'ohio': 'OH', 'georgia': 'GA', 'north carolina': 'NC',
      'michigan': 'MI', 'new jersey': 'NJ', 'virginia': 'VA', 'washington': 'WA',
      'arizona': 'AZ', 'massachusetts': 'MA', 'indiana': 'IN', 'tennessee': 'TN',
      'maryland': 'MD', 'minnesota': 'MN', 'colorado': 'CO', 'wisconsin': 'WI'
    };

    // Check if query matches a state name
    for (const [stateName, stateCode] of Object.entries(stateNames)) {
      if (stateName.includes(query) && query.length >= 3) {
        suggestions.push({
          place_id: `state_${stateCode}`,
          description: `${this.formatCityName(stateName)}, USA`,
          main_text: this.formatCityName(stateName),
          secondary_text: 'State, USA'
        });
      }
    }

    return suggestions.slice(0, 2); // Limit state suggestions
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
      const cityData = MAJOR_CITIES[detectedCity];
      suggestions.push({
        place_id: `address_${detectedCity}`,
        description: `${input}, ${formattedCity}, ${detectedState}, USA`,
        main_text: input,
        secondary_text: `${formattedCity}, ${detectedState}, USA`,
        coordinates: cityData?.lat && cityData?.lng ? {
          lat: cityData.lat,
          lng: cityData.lng
        } : undefined
      });
    } else {
      // Generic address suggestions for major NWA cities
      ['Fayetteville', 'Rogers', 'Bentonville', 'Springdale'].forEach(city => {
        const cityData = MAJOR_CITIES[city.toLowerCase()];
        suggestions.push({
          place_id: `address_${city.toLowerCase()}`,
          description: `${input}, ${city}, AR, USA`,
          main_text: input,
          secondary_text: `${city}, AR, USA`,
          coordinates: cityData?.lat && cityData?.lng ? {
            lat: cityData.lat,
            lng: cityData.lng
          } : undefined
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
      console.log('🔍 Getting location details for:', placeId, coordinates);

      // Handle zip code suggestions
      if (placeId?.startsWith('zip_')) {
        const zipCode = placeId.replace('zip_', '');
        const state = this.getStateFromZipCode(zipCode);
        const isNWA = this.isNWAZipCode(zipCode);
        
        return {
          isNWA,
          city: '',
          state: state,
          zipCode,
          formattedAddress: `${zipCode}, ${state}, USA`
        };
      }

      // Handle NWA city suggestions
      if (placeId?.startsWith('nwa_city_')) {
        const city = placeId.replace('nwa_city_', '');
        const formattedCity = this.formatCityName(city);
        const cityData = MAJOR_CITIES[city];
        
        return {
          isNWA: true,
          city: formattedCity,
          state: 'AR',
          zipCode: cityData?.zip || '',
          latitude: cityData?.lat,
          longitude: cityData?.lng,
          formattedAddress: `${formattedCity}, AR, USA`
        };
      }

      // Handle major city suggestions
      if (placeId?.startsWith('major_city_')) {
        const city = placeId.replace('major_city_', '');
        const formattedCity = this.formatCityName(city);
        const cityData = MAJOR_CITIES[city];
        
        if (cityData) {
          return {
            isNWA: cityData.state === 'AR' && this.isNWACity(city),
            city: formattedCity,
            state: cityData.state,
            zipCode: cityData.zip || '',
            latitude: cityData.lat,
            longitude: cityData.lng,
            formattedAddress: `${formattedCity}, ${cityData.state}, USA`
          };
        }
      }

      // Handle state suggestions
      if (placeId?.startsWith('state_')) {
        const stateCode = placeId.replace('state_', '');
        const stateNames: { [key: string]: string } = {
          'AR': 'Arkansas', 'TX': 'Texas', 'OK': 'Oklahoma', 'MO': 'Missouri',
          'CA': 'California', 'FL': 'Florida', 'NY': 'New York', 'IL': 'Illinois'
        };
        
        return {
          isNWA: stateCode === 'AR',
          city: '',
          state: stateCode,
          zipCode: '',
          formattedAddress: `${stateNames[stateCode] || stateCode}, USA`
        };
      }

      // Handle address suggestions
      if (placeId?.startsWith('address_')) {
        const cityKey = placeId.replace('address_', '');
        
        if (this.isNWACity(cityKey)) {
          const formattedCity = this.formatCityName(cityKey);
          const cityData = MAJOR_CITIES[cityKey];
          return {
            isNWA: true,
            city: formattedCity,
            state: 'AR',
            zipCode: cityData?.zip || '',
            latitude: cityData?.lat,
            longitude: cityData?.lng,
            formattedAddress: `${formattedCity}, AR, USA`
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
            latitude: cityData.lat,
            longitude: cityData.lng,
            formattedAddress: `${formattedCity}, ${cityData.state}, USA`
          };
        }
      }

      // Handle direct match with coordinates
      if (placeId === 'direct_match' && coordinates) {
        return this.createFallbackLocationData(coordinates);
      }

      // Fallback for coordinates
      if (coordinates) {
        return this.createFallbackLocationData(coordinates);
      }

      console.log('⚠️ No location data found for:', placeId);
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
   * Enhanced validation for location input with comprehensive support
   */
  async validateLocationInput(input: string): Promise<LocationData | null> {
    const trimmedInput = input.trim();
    
    console.log('🔍 Validating location input:', trimmedInput);

    try {
      // Check if it's a zip code
      const zipMatch = trimmedInput.match(/^\d{5}(-\d{4})?$/);
      if (zipMatch) {
        const zipCode = zipMatch[0].substring(0, 5);
        const state = this.getStateFromZipCode(zipCode);
        const isNWA = this.isNWAZipCode(zipCode);
        
        console.log('📮 Validated as zip code:', zipCode, state, isNWA);
        
        return {
          isNWA,
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
        const cityData = MAJOR_CITIES[cityMatch];
        
        console.log('🏙️ Validated as NWA city:', formattedCity);
        
        return {
          isNWA: true,
          city: formattedCity,
          state: 'AR',
          zipCode: cityData?.zip || '',
          latitude: cityData?.lat,
          longitude: cityData?.lng,
          formattedAddress: `${formattedCity}, AR, USA`
        };
      }

      // Check major cities
      const majorCityData = MAJOR_CITIES[cityMatch];
      if (majorCityData) {
        const formattedCity = this.formatCityName(cityMatch);
        
        console.log('🏙️ Validated as major city:', formattedCity, majorCityData.state);
        
        return {
          isNWA: majorCityData.state === 'AR' && this.isNWACity(cityMatch),
          city: formattedCity,
          state: majorCityData.state,
          zipCode: majorCityData.zip || '',
          latitude: majorCityData.lat,
          longitude: majorCityData.lng,
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
          const cityData = MAJOR_CITIES[cityLower];
          
          console.log('🏠 Validated as NWA address:', formattedCity);
          
          return {
            isNWA: true,
            city: formattedCity,
            state: detectedState || 'AR',
            zipCode: zip || cityData?.zip || '',
            latitude: cityData?.lat,
            longitude: cityData?.lng,
            formattedAddress: `${street.trim()}, ${formattedCity}, ${detectedState || 'AR'} ${zip || ''}`.trim()
          };
        }

        // Check if it's a major city
        if (cityLower) {
          const majorCityData = MAJOR_CITIES[cityLower];
          if (majorCityData) {
            const formattedCity = this.formatCityName(cityLower);
            
            console.log('🏠 Validated as major city address:', formattedCity);
            
            return {
              isNWA: false,
              city: formattedCity,
              state: detectedState || majorCityData.state,
              zipCode: zip || majorCityData.zip || '',
              latitude: majorCityData.lat,
              longitude: majorCityData.lng,
              formattedAddress: `${street.trim()}, ${formattedCity}, ${detectedState || majorCityData.state} ${zip || ''}`.trim()
            };
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