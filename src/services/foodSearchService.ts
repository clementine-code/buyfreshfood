// Food search service with fuzzy search and discovery features
export interface FoodItem {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  keywords: string[];
  seller: string;
  location: string;
  price: string;
  unit: string;
  image: string;
  zipCode: string;
  description: string;
  isOrganic: boolean;
  isLocal: boolean;
  tags: string[];
  inStock: boolean;
  stockLevel: 'high' | 'medium' | 'low';
  harvestDate?: string;
  availableUntil?: string;
}

export interface FoodSearchSuggestion {
  id: string;
  type: 'product' | 'category' | 'seller' | 'related';
  title: string;
  subtitle: string;
  image?: string;
  price?: string;
  location?: string;
  matchScore: number;
  isOrganic?: boolean;
  tags?: string[];
}

// Mock fresh food inventory for NWA region
const MOCK_FOOD_INVENTORY: FoodItem[] = [
  // Vegetables & Greens
  {
    id: 'veg-001',
    name: 'Heirloom Tomatoes',
    category: 'Vegetables',
    subcategory: 'Tomatoes',
    keywords: ['tomato', 'heirloom', 'red', 'fresh', 'vine', 'ripe', 'salad', 'cooking'],
    seller: "Green Acres Farm",
    location: "Fayetteville, AR",
    price: "$4.99",
    unit: "lb",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800",
    zipCode: "72701",
    description: "Juicy, flavorful heirloom tomatoes in mixed varieties",
    isOrganic: true,
    isLocal: true,
    tags: ['heirloom', 'vine-ripened', 'pesticide-free'],
    inStock: true,
    stockLevel: 'high',
    harvestDate: '2024-01-15',
    availableUntil: '2024-01-22'
  },
  {
    id: 'veg-002',
    name: 'Cherry Tomatoes',
    category: 'Vegetables',
    subcategory: 'Tomatoes',
    keywords: ['cherry', 'tomato', 'small', 'sweet', 'snack', 'salad', 'red', 'bite-size'],
    seller: "Sunset Gardens",
    location: "Tontitown, AR",
    price: "$3.99",
    unit: "pint",
    image: "https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=800",
    zipCode: "72762",
    description: "Sweet, bite-sized cherry tomatoes perfect for snacking",
    isOrganic: false,
    isLocal: true,
    tags: ['sweet', 'snack-size', 'fresh'],
    inStock: true,
    stockLevel: 'medium'
  },
  {
    id: 'veg-003',
    name: 'Roma Tomatoes',
    category: 'Vegetables',
    subcategory: 'Tomatoes',
    keywords: ['roma', 'tomato', 'paste', 'sauce', 'cooking', 'meaty', 'italian'],
    seller: "Urban Greens",
    location: "Fayetteville, AR",
    price: "$3.49",
    unit: "lb",
    image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800",
    zipCode: "72701",
    description: "Meaty Roma tomatoes ideal for sauces and cooking",
    isOrganic: true,
    isLocal: true,
    tags: ['cooking', 'sauce', 'meaty'],
    inStock: true,
    stockLevel: 'high'
  },
  {
    id: 'veg-004',
    name: 'Baby Spinach',
    category: 'Vegetables',
    subcategory: 'Leafy Greens',
    keywords: ['spinach', 'baby', 'greens', 'salad', 'iron', 'healthy', 'leaves'],
    seller: "Green Acres Farm",
    location: "Fayetteville, AR",
    price: "$4.49",
    unit: "bag",
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800",
    zipCode: "72701",
    description: "Tender baby spinach leaves, perfect for salads",
    isOrganic: true,
    isLocal: true,
    tags: ['baby-greens', 'salad-ready', 'iron-rich'],
    inStock: true,
    stockLevel: 'high'
  },
  {
    id: 'veg-005',
    name: 'Rainbow Swiss Chard',
    category: 'Vegetables',
    subcategory: 'Leafy Greens',
    keywords: ['chard', 'swiss', 'rainbow', 'colorful', 'greens', 'stems', 'nutritious'],
    seller: "Green Acres Farm",
    location: "Fayetteville, AR",
    price: "$3.99",
    unit: "bunch",
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800",
    zipCode: "72701",
    description: "Colorful and nutritious leafy greens with vibrant stems",
    isOrganic: true,
    isLocal: true,
    tags: ['colorful', 'nutrient-dense', 'rainbow'],
    inStock: true,
    stockLevel: 'medium'
  },

  // Fruits & Berries
  {
    id: 'fruit-001',
    name: 'Fresh Strawberries',
    category: 'Fruits',
    subcategory: 'Berries',
    keywords: ['strawberry', 'berry', 'red', 'sweet', 'fresh', 'vitamin', 'dessert'],
    seller: "Berry Patch Farm",
    location: "Rogers, AR",
    price: "$8.99",
    unit: "lb",
    image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800",
    zipCode: "72756",
    description: "Sweet, juicy strawberries picked fresh daily",
    isOrganic: false,
    isLocal: true,
    tags: ['sweet', 'fresh-picked', 'vitamin-c'],
    inStock: true,
    stockLevel: 'high'
  },
  {
    id: 'fruit-002',
    name: 'Blueberries',
    category: 'Fruits',
    subcategory: 'Berries',
    keywords: ['blueberry', 'berry', 'blue', 'antioxidant', 'healthy', 'sweet', 'superfood'],
    seller: "Ozark Berry Farm",
    location: "Bentonville, AR",
    price: "$12.99",
    unit: "pint",
    image: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=800",
    zipCode: "72712",
    description: "Plump, sweet blueberries packed with antioxidants",
    isOrganic: true,
    isLocal: true,
    tags: ['antioxidant', 'superfood', 'sweet'],
    inStock: true,
    stockLevel: 'medium'
  },
  {
    id: 'fruit-003',
    name: 'Blackberries',
    category: 'Fruits',
    subcategory: 'Berries',
    keywords: ['blackberry', 'berry', 'dark', 'tart', 'wild', 'jam', 'pie'],
    seller: "Wild Berry Co",
    location: "Springdale, AR",
    price: "$9.99",
    unit: "pint",
    image: "https://images.unsplash.com/photo-1577003833619-76bbd7f82948?w=800",
    zipCode: "72762",
    description: "Wild blackberries with rich, complex flavor",
    isOrganic: false,
    isLocal: true,
    tags: ['wild', 'tart', 'complex-flavor'],
    inStock: true,
    stockLevel: 'low'
  },
  {
    id: 'fruit-004',
    name: 'Heritage Apples',
    category: 'Fruits',
    subcategory: 'Tree Fruits',
    keywords: ['apple', 'heritage', 'heirloom', 'crisp', 'sweet', 'orchard', 'variety'],
    seller: "Orchard Valley",
    location: "Elkins, AR",
    price: "$5.99",
    unit: "bag",
    image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800",
    zipCode: "72727",
    description: "Rare heritage apple varieties with unique flavors",
    isOrganic: false,
    isLocal: true,
    tags: ['heritage', 'rare-varieties', 'heirloom'],
    inStock: true,
    stockLevel: 'high'
  },

  // Dairy & Eggs
  {
    id: 'dairy-001',
    name: 'Farm Fresh Eggs',
    category: 'Dairy & Eggs',
    subcategory: 'Eggs',
    keywords: ['eggs', 'fresh', 'farm', 'free-range', 'pasture', 'protein', 'breakfast'],
    seller: "Happy Hen Farm",
    location: "Farmington, AR",
    price: "$6.99",
    unit: "dozen",
    image: "https://images.unsplash.com/photo-1590005354167-6da97870c757?w=800",
    zipCode: "72730",
    description: "Free-range eggs from pasture-raised hens",
    isOrganic: false,
    isLocal: true,
    tags: ['free-range', 'pasture-raised', 'golden-yolks'],
    inStock: true,
    stockLevel: 'high'
  },
  {
    id: 'dairy-002',
    name: 'Fresh Whole Milk',
    category: 'Dairy & Eggs',
    subcategory: 'Milk',
    keywords: ['milk', 'whole', 'fresh', 'cream', 'dairy', 'grass-fed', 'local'],
    seller: "Hillside Dairy",
    location: "Rogers, AR",
    price: "$5.99",
    unit: "half-gallon",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800",
    zipCode: "72756",
    description: "Creamy whole milk from grass-fed cows",
    isOrganic: false,
    isLocal: true,
    tags: ['grass-fed', 'non-homogenized', 'local'],
    inStock: true,
    stockLevel: 'medium'
  },

  // Meat & Poultry
  {
    id: 'meat-001',
    name: 'Grass-Fed Ground Beef',
    category: 'Meat & Poultry',
    subcategory: 'Beef',
    keywords: ['beef', 'ground', 'grass-fed', 'pasture', 'hormone-free', 'local', 'protein'],
    seller: "Heritage Meats",
    location: "Bentonville, AR",
    price: "$9.99",
    unit: "lb",
    image: "https://images.unsplash.com/photo-1588347818481-c7c1b6b3b5b3?w=800",
    zipCode: "72712",
    description: "Premium grass-fed ground beef from local pastures",
    isOrganic: false,
    isLocal: true,
    tags: ['grass-fed', 'hormone-free', 'pasture-raised'],
    inStock: true,
    stockLevel: 'medium'
  },
  {
    id: 'meat-002',
    name: 'Free-Range Chicken',
    category: 'Meat & Poultry',
    subcategory: 'Chicken',
    keywords: ['chicken', 'free-range', 'whole', 'pasture', 'natural', 'fresh', 'poultry'],
    seller: "Heritage Meats",
    location: "Bentonville, AR",
    price: "$16.99",
    unit: "whole",
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=800",
    zipCode: "72712",
    description: "Whole free-range chicken raised on pasture",
    isOrganic: false,
    isLocal: true,
    tags: ['free-range', 'pasture-raised', 'whole-bird'],
    inStock: true,
    stockLevel: 'low'
  },

  // Baked Goods
  {
    id: 'baked-001',
    name: 'Artisan Sourdough Bread',
    category: 'Baked Goods',
    subcategory: 'Bread',
    keywords: ['bread', 'sourdough', 'artisan', 'fresh', 'wild-yeast', 'traditional', 'loaf'],
    seller: "Sweet Life Bakery",
    location: "Springdale, AR",
    price: "$8.99",
    unit: "loaf",
    image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=800",
    zipCode: "72762",
    description: "Traditional sourdough bread made with wild yeast starter",
    isOrganic: false,
    isLocal: true,
    tags: ['artisan', 'wild-yeast', 'traditional'],
    inStock: true,
    stockLevel: 'medium'
  },

  // Honey & Preserves
  {
    id: 'honey-001',
    name: 'Raw Wildflower Honey',
    category: 'Honey & Preserves',
    subcategory: 'Honey',
    keywords: ['honey', 'raw', 'wildflower', 'natural', 'sweet', 'local', 'unfiltered'],
    seller: "Busy Bee Apiary",
    location: "Prairie Grove, AR",
    price: "$15.99",
    unit: "jar",
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800",
    zipCode: "72753",
    description: "Pure, raw honey harvested from local beehives",
    isOrganic: false,
    isLocal: true,
    tags: ['raw', 'unfiltered', 'wildflower', 'local'],
    inStock: true,
    stockLevel: 'high'
  },

  // Specialty Items
  {
    id: 'specialty-001',
    name: 'Microgreens Mix',
    category: 'Vegetables',
    subcategory: 'Microgreens',
    keywords: ['microgreens', 'mix', 'sprouts', 'nutrition', 'garnish', 'fresh', 'variety'],
    seller: "Urban Greens",
    location: "Fayetteville, AR",
    price: "$7.99",
    unit: "container",
    image: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=800",
    zipCode: "72701",
    description: "Nutrient-dense microgreens mix for garnishes and salads",
    isOrganic: true,
    isLocal: true,
    tags: ['microgreens', 'nutrient-dense', 'variety-mix'],
    inStock: true,
    stockLevel: 'medium'
  },
  {
    id: 'specialty-002',
    name: 'Shiitake Mushrooms',
    category: 'Vegetables',
    subcategory: 'Mushrooms',
    keywords: ['mushroom', 'shiitake', 'umami', 'gourmet', 'fresh', 'specialty', 'asian'],
    seller: "Ozark Mushrooms",
    location: "Winslow, AR",
    price: "$12.99",
    unit: "lb",
    image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=800",
    zipCode: "72959",
    description: "Fresh shiitake mushrooms with rich, umami flavor",
    isOrganic: false,
    isLocal: true,
    tags: ['gourmet', 'umami', 'specialty'],
    inStock: true,
    stockLevel: 'low'
  }
];

// Category mappings for discovery
const CATEGORY_EXPANSIONS: { [key: string]: string[] } = {
  'fruit': ['Fruits', 'Berries', 'Tree Fruits'],
  'fruits': ['Fruits', 'Berries', 'Tree Fruits'],
  'berry': ['Berries'],
  'berries': ['Berries'],
  'vegetable': ['Vegetables', 'Leafy Greens', 'Root Vegetables'],
  'vegetables': ['Vegetables', 'Leafy Greens', 'Root Vegetables'],
  'greens': ['Leafy Greens'],
  'meat': ['Meat & Poultry', 'Beef', 'Chicken', 'Pork'],
  'dairy': ['Dairy & Eggs', 'Milk', 'Cheese'],
  'bread': ['Baked Goods', 'Bread'],
  'honey': ['Honey & Preserves', 'Honey'],
  'mushroom': ['Mushrooms'],
  'mushrooms': ['Mushrooms']
};

// Common typos and variations
const TYPO_CORRECTIONS: { [key: string]: string } = {
  'tomatoe': 'tomato',
  'tomatos': 'tomato',
  'tomateos': 'tomato',
  'strawbery': 'strawberry',
  'strawberrys': 'strawberry',
  'blubery': 'blueberry',
  'blueberrys': 'blueberry',
  'spinnach': 'spinach',
  'spinich': 'spinach',
  'mushrrom': 'mushroom',
  'mushrom': 'mushroom',
  'honney': 'honey',
  'honny': 'honey'
};

class FoodSearchService {
  /**
   * Get fuzzy search suggestions with discovery focus
   */
  async getFoodSuggestions(query: string): Promise<FoodSearchSuggestion[]> {
    if (query.length < 2) {
      return this.getPopularSuggestions();
    }

    const suggestions: FoodSearchSuggestion[] = [];
    const normalizedQuery = this.normalizeQuery(query);

    // 1. Direct product matches (highest priority)
    const productMatches = this.findProductMatches(normalizedQuery);
    suggestions.push(...productMatches);

    // 2. Category matches
    const categoryMatches = this.findCategoryMatches(normalizedQuery);
    suggestions.push(...categoryMatches);

    // 3. Related/similar items
    const relatedMatches = this.findRelatedItems(normalizedQuery);
    suggestions.push(...relatedMatches);

    // 4. Seller matches
    const sellerMatches = this.findSellerMatches(normalizedQuery);
    suggestions.push(...sellerMatches);

    // Remove duplicates and sort by relevance
    const uniqueSuggestions = this.removeDuplicates(suggestions);
    const sortedSuggestions = this.sortByRelevance(uniqueSuggestions);

    // Always return 8-10 suggestions for discovery
    return this.ensureMinimumSuggestions(sortedSuggestions, normalizedQuery);
  }

  /**
   * Normalize query for better matching
   */
  private normalizeQuery(query: string): string {
    let normalized = query.toLowerCase().trim();
    
    // Apply typo corrections
    for (const [typo, correction] of Object.entries(TYPO_CORRECTIONS)) {
      if (normalized.includes(typo)) {
        normalized = normalized.replace(new RegExp(typo, 'g'), correction);
      }
    }

    return normalized;
  }

  /**
   * Find direct product matches
   */
  private findProductMatches(query: string): FoodSearchSuggestion[] {
    const matches: FoodSearchSuggestion[] = [];

    for (const item of MOCK_FOOD_INVENTORY) {
      const score = this.calculateMatchScore(query, item);
      
      if (score > 0.3) { // Lower threshold for more discovery
        matches.push({
          id: item.id,
          type: 'product',
          title: item.name,
          subtitle: `${item.seller} • ${item.location}`,
          image: item.image,
          price: `${item.price}/${item.unit}`,
          location: item.location,
          matchScore: score,
          isOrganic: item.isOrganic,
          tags: item.tags
        });
      }
    }

    return matches;
  }

  /**
   * Calculate match score for fuzzy matching
   */
  private calculateMatchScore(query: string, item: FoodItem): number {
    let score = 0;
    const queryWords = query.split(/\s+/);

    // Exact name match (highest score)
    if (item.name.toLowerCase().includes(query)) {
      score += 1.0;
    }

    // Keyword matches
    for (const keyword of item.keywords) {
      if (keyword.includes(query)) {
        score += 0.8;
      }
      
      // Partial keyword matches
      for (const queryWord of queryWords) {
        if (keyword.includes(queryWord) && queryWord.length > 2) {
          score += 0.4;
        }
      }
    }

    // Category/subcategory matches
    if (item.category.toLowerCase().includes(query)) {
      score += 0.6;
    }
    if (item.subcategory?.toLowerCase().includes(query)) {
      score += 0.7;
    }

    // Tag matches
    for (const tag of item.tags) {
      if (tag.toLowerCase().includes(query)) {
        score += 0.5;
      }
    }

    // Boost for in-stock items
    if (item.inStock) {
      score += 0.1;
    }

    // Boost for organic items when searching for "organic"
    if (query.includes('organic') && item.isOrganic) {
      score += 0.3;
    }

    return Math.min(score, 2.0); // Cap at 2.0
  }

  /**
   * Find category matches for discovery
   */
  private findCategoryMatches(query: string): FoodSearchSuggestion[] {
    const matches: FoodSearchSuggestion[] = [];

    // Check for category expansions
    for (const [searchTerm, categories] of Object.entries(CATEGORY_EXPANSIONS)) {
      if (query.includes(searchTerm)) {
        for (const category of categories) {
          const categoryItems = MOCK_FOOD_INVENTORY.filter(item => 
            item.category === category || item.subcategory === category
          );

          if (categoryItems.length > 0) {
            const representativeItem = categoryItems[0];
            matches.push({
              id: `category-${category.toLowerCase().replace(/\s+/g, '-')}`,
              type: 'category',
              title: `All ${category}`,
              subtitle: `${categoryItems.length} items available`,
              image: representativeItem.image,
              matchScore: 0.8
            });
          }
        }
      }
    }

    return matches;
  }

  /**
   * Find related items for discovery
   */
  private findRelatedItems(query: string): FoodSearchSuggestion[] {
    const matches: FoodSearchSuggestion[] = [];

    // Find items with related keywords
    const relatedKeywords = this.getRelatedKeywords(query);
    
    for (const keyword of relatedKeywords) {
      const relatedItems = MOCK_FOOD_INVENTORY.filter(item =>
        item.keywords.some(k => k.includes(keyword)) &&
        !item.keywords.some(k => k.includes(query)) // Exclude direct matches
      );

      for (const item of relatedItems.slice(0, 3)) { // Limit related items
        matches.push({
          id: `related-${item.id}`,
          type: 'related',
          title: item.name,
          subtitle: `Related to "${query}" • ${item.seller}`,
          image: item.image,
          price: `${item.price}/${item.unit}`,
          matchScore: 0.5,
          isOrganic: item.isOrganic,
          tags: item.tags
        });
      }
    }

    return matches;
  }

  /**
   * Get related keywords for discovery
   */
  private getRelatedKeywords(query: string): string[] {
    const related: { [key: string]: string[] } = {
      'tomato': ['pepper', 'cucumber', 'basil', 'sauce'],
      'berry': ['fruit', 'jam', 'sweet', 'antioxidant'],
      'apple': ['fruit', 'orchard', 'cider', 'pie'],
      'chicken': ['egg', 'poultry', 'protein', 'farm'],
      'milk': ['dairy', 'cheese', 'cream', 'butter'],
      'bread': ['flour', 'yeast', 'bakery', 'grain'],
      'honey': ['bee', 'sweet', 'natural', 'raw'],
      'mushroom': ['fungi', 'umami', 'gourmet', 'forest']
    };

    for (const [key, keywords] of Object.entries(related)) {
      if (query.includes(key)) {
        return keywords;
      }
    }

    return [];
  }

  /**
   * Find seller matches
   */
  private findSellerMatches(query: string): FoodSearchSuggestion[] {
    const matches: FoodSearchSuggestion[] = [];
    const sellerItems = new Map<string, FoodItem[]>();

    // Group items by seller
    for (const item of MOCK_FOOD_INVENTORY) {
      if (item.seller.toLowerCase().includes(query)) {
        if (!sellerItems.has(item.seller)) {
          sellerItems.set(item.seller, []);
        }
        sellerItems.get(item.seller)!.push(item);
      }
    }

    // Create seller suggestions
    for (const [seller, items] of sellerItems) {
      const representativeItem = items[0];
      matches.push({
        id: `seller-${seller.toLowerCase().replace(/\s+/g, '-')}`,
        type: 'seller',
        title: seller,
        subtitle: `${items.length} products • ${representativeItem.location}`,
        image: representativeItem.image,
        location: representativeItem.location,
        matchScore: 0.6
      });
    }

    return matches;
  }

  /**
   * Remove duplicate suggestions
   */
  private removeDuplicates(suggestions: FoodSearchSuggestion[]): FoodSearchSuggestion[] {
    const seen = new Set<string>();
    return suggestions.filter(suggestion => {
      const key = `${suggestion.type}-${suggestion.title}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Sort suggestions by relevance
   */
  private sortByRelevance(suggestions: FoodSearchSuggestion[]): FoodSearchSuggestion[] {
    return suggestions.sort((a, b) => {
      // Prioritize by type: product > category > related > seller
      const typeOrder = { product: 4, category: 3, related: 2, seller: 1 };
      const typeDiff = (typeOrder[b.type] || 0) - (typeOrder[a.type] || 0);
      
      if (typeDiff !== 0) {
        return typeDiff;
      }

      // Then by match score
      return b.matchScore - a.matchScore;
    });
  }

  /**
   * Ensure minimum suggestions for discovery
   */
  private ensureMinimumSuggestions(suggestions: FoodSearchSuggestion[], query: string): FoodSearchSuggestion[] {
    if (suggestions.length >= 8) {
      return suggestions.slice(0, 10);
    }

    // Add popular items to reach minimum
    const popularItems = this.getPopularSuggestions();
    const additionalItems = popularItems.filter(popular => 
      !suggestions.some(existing => existing.id === popular.id)
    );

    const combined = [...suggestions, ...additionalItems];
    return combined.slice(0, 10);
  }

  /**
   * Get popular suggestions for empty queries
   */
  private getPopularSuggestions(): FoodSearchSuggestion[] {
    const popular = [
      'veg-001', 'fruit-001', 'dairy-001', 'meat-001', 'baked-001', 
      'honey-001', 'specialty-001', 'fruit-002'
    ];

    return popular.map(id => {
      const item = MOCK_FOOD_INVENTORY.find(i => i.id === id);
      if (!item) return null;

      return {
        id: item.id,
        type: 'product' as const,
        title: item.name,
        subtitle: `${item.seller} • ${item.location}`,
        image: item.image,
        price: `${item.price}/${item.unit}`,
        location: item.location,
        matchScore: 1.0,
        isOrganic: item.isOrganic,
        tags: item.tags
      };
    }).filter(Boolean) as FoodSearchSuggestion[];
  }

  /**
   * Get detailed food item by ID
   */
  async getFoodItemById(id: string): Promise<FoodItem | null> {
    return MOCK_FOOD_INVENTORY.find(item => item.id === id) || null;
  }

  /**
   * Get items by category
   */
  async getItemsByCategory(category: string): Promise<FoodItem[]> {
    return MOCK_FOOD_INVENTORY.filter(item => 
      item.category.toLowerCase() === category.toLowerCase() ||
      item.subcategory?.toLowerCase() === category.toLowerCase()
    );
  }

  /**
   * Get items by seller
   */
  async getItemsBySeller(seller: string): Promise<FoodItem[]> {
    return MOCK_FOOD_INVENTORY.filter(item => 
      item.seller.toLowerCase() === seller.toLowerCase()
    );
  }
}

// Export singleton instance
export const foodSearchService = new FoodSearchService();

// Utility functions
export const formatFoodPrice = (price: string, unit: string): string => {
  return `${price}/${unit}`;
};

export const getFoodItemImage = (item: FoodItem): string => {
  return item.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800';
};

export const isFoodItemAvailable = (item: FoodItem): boolean => {
  if (!item.inStock) return false;
  
  if (item.availableUntil) {
    const availableUntil = new Date(item.availableUntil);
    return availableUntil > new Date();
  }
  
  return true;
};