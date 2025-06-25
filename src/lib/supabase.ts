import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  },
  global: {
    fetch: (url, options = {}) => {
      return fetch(url, {
        ...options,
        signal: AbortSignal.timeout(10000) // 10 second timeout
      }).catch(error => {
        console.error('Supabase fetch error:', error);
        throw new Error('Network connection failed. Please check your internet connection and try again.');
      });
    }
  }
})

// Database types
export interface Seller {
  id: string
  name: string
  description: string | null
  location: string
  latitude: number | null
  longitude: number | null
  seller_type: 'farm' | 'bakery' | 'dairy' | 'meat' | 'orchard' | 'apiary' | 'market'
  contact_email: string | null
  contact_phone: string | null
  website: string | null
  verified: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  description: string | null
  icon: string | null
  created_at: string
}

export interface Product {
  id: string
  seller_id: string
  category_id: string | null
  name: string
  description: string | null
  price: number
  unit: string
  image_url: string | null
  stock_quantity: number
  is_organic: boolean
  is_local: boolean
  harvest_date: string | null
  available_from: string
  available_until: string | null
  tags: string[]
  created_at: string
  updated_at: string
  // Joined data
  seller?: Seller
  category?: Category
  reviews?: ProductReview[]
  average_rating?: number
}

export interface ProductReview {
  id: string
  product_id: string
  customer_name: string
  rating: number
  comment: string | null
  created_at: string
}

// Fallback data for when Supabase is unavailable
const fallbackProducts: Product[] = [
  {
    id: 'fallback-1',
    seller_id: 'fallback-seller-1',
    category_id: 'fallback-category-1',
    name: 'Fresh Organic Tomatoes',
    description: 'Locally grown organic tomatoes, perfect for salads and cooking',
    price: 4.99,
    unit: 'lb',
    image_url: 'https://images.unsplash.com/photo-1546470427-e26264be0b0d?w=800',
    stock_quantity: 25,
    is_organic: true,
    is_local: true,
    harvest_date: new Date().toISOString().split('T')[0],
    available_from: new Date().toISOString().split('T')[0],
    available_until: null,
    tags: ['organic', 'fresh', 'local'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    seller: {
      id: 'fallback-seller-1',
      name: 'Green Valley Farm',
      description: 'Family-owned organic farm',
      location: 'Fayetteville, AR',
      latitude: 36.0625,
      longitude: -94.1574,
      seller_type: 'farm',
      contact_email: 'info@greenvalley.com',
      contact_phone: '(479) 555-0123',
      website: 'https://greenvalley.com',
      verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    category: {
      id: 'fallback-category-1',
      name: 'Vegetables',
      description: 'Fresh vegetables',
      icon: '🥕',
      created_at: new Date().toISOString()
    },
    reviews: [],
    average_rating: 4.5
  },
  {
    id: 'fallback-2',
    seller_id: 'fallback-seller-2',
    category_id: 'fallback-category-2',
    name: 'Farm Fresh Eggs',
    description: 'Free-range chicken eggs from pasture-raised hens',
    price: 6.50,
    unit: 'dozen',
    image_url: 'https://images.unsplash.com/photo-1518569656558-1f25e69d93d7?w=800',
    stock_quantity: 15,
    is_organic: true,
    is_local: true,
    harvest_date: new Date().toISOString().split('T')[0],
    available_from: new Date().toISOString().split('T')[0],
    available_until: null,
    tags: ['free-range', 'fresh', 'local'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    seller: {
      id: 'fallback-seller-2',
      name: 'Sunrise Poultry',
      description: 'Pasture-raised poultry farm',
      location: 'Rogers, AR',
      latitude: 36.3320,
      longitude: -94.1185,
      seller_type: 'farm',
      contact_email: 'info@sunrisepoultry.com',
      contact_phone: '(479) 555-0456',
      website: 'https://sunrisepoultry.com',
      verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    category: {
      id: 'fallback-category-2',
      name: 'Dairy & Eggs',
      description: 'Fresh dairy and eggs',
      icon: '🥚',
      created_at: new Date().toISOString()
    },
    reviews: [],
    average_rating: 4.8
  },
  {
    id: 'fallback-3',
    seller_id: 'fallback-seller-3',
    category_id: 'fallback-category-3',
    name: 'Artisan Sourdough Bread',
    description: 'Hand-crafted sourdough bread made with local flour',
    price: 8.00,
    unit: 'loaf',
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
    stock_quantity: 8,
    is_organic: false,
    is_local: true,
    harvest_date: new Date().toISOString().split('T')[0],
    available_from: new Date().toISOString().split('T')[0],
    available_until: null,
    tags: ['artisan', 'fresh', 'local'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    seller: {
      id: 'fallback-seller-3',
      name: 'Ozark Bakery',
      description: 'Traditional artisan bakery',
      location: 'Bentonville, AR',
      latitude: 36.3729,
      longitude: -94.2088,
      seller_type: 'bakery',
      contact_email: 'info@ozarkbakery.com',
      contact_phone: '(479) 555-0789',
      website: 'https://ozarkbakery.com',
      verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    category: {
      id: 'fallback-category-3',
      name: 'Bakery',
      description: 'Fresh baked goods',
      icon: '🍞',
      created_at: new Date().toISOString()
    },
    reviews: [],
    average_rating: 4.7
  }
];

const fallbackCategories = [
  { id: 'fallback-category-1', name: 'Vegetables', description: 'Fresh vegetables', icon: '🥕', created_at: new Date().toISOString() },
  { id: 'fallback-category-2', name: 'Dairy & Eggs', description: 'Fresh dairy and eggs', icon: '🥚', created_at: new Date().toISOString() },
  { id: 'fallback-category-3', name: 'Bakery', description: 'Fresh baked goods', icon: '🍞', created_at: new Date().toISOString() },
  { id: 'fallback-category-4', name: 'Fruits', description: 'Fresh fruits', icon: '🍎', created_at: new Date().toISOString() },
  { id: 'fallback-category-5', name: 'Meat', description: 'Fresh meat', icon: '🥩', created_at: new Date().toISOString() }
];

const fallbackSellers = [
  {
    id: 'fallback-seller-1',
    name: 'Green Valley Farm',
    description: 'Family-owned organic farm',
    location: 'Fayetteville, AR',
    latitude: 36.0625,
    longitude: -94.1574,
    seller_type: 'farm' as const,
    contact_email: 'info@greenvalley.com',
    contact_phone: '(479) 555-0123',
    website: 'https://greenvalley.com',
    verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'fallback-seller-2',
    name: 'Sunrise Poultry',
    description: 'Pasture-raised poultry farm',
    location: 'Rogers, AR',
    latitude: 36.3320,
    longitude: -94.1185,
    seller_type: 'farm' as const,
    contact_email: 'info@sunrisepoultry.com',
    contact_phone: '(479) 555-0456',
    website: 'https://sunrisepoultry.com',
    verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'fallback-seller-3',
    name: 'Ozark Bakery',
    description: 'Traditional artisan bakery',
    location: 'Bentonville, AR',
    latitude: 36.3729,
    longitude: -94.2088,
    seller_type: 'bakery' as const,
    contact_email: 'info@ozarkbakery.com',
    contact_phone: '(479) 555-0789',
    website: 'https://ozarkbakery.com',
    verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// API functions with fallback support
export const getProducts = async (filters?: {
  category?: string
  seller?: string
  organic?: boolean
  search?: string
  limit?: number
  offset?: number
}) => {
  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        seller:sellers(*),
        category:categories(*),
        reviews:product_reviews(rating)
      `)
      .gt('stock_quantity', 0)
      .order('created_at', { ascending: false })

    if (filters?.category) {
      query = query.eq('category.name', filters.category)
    }

    if (filters?.seller) {
      query = query.eq('seller.name', filters.seller)
    }

    if (filters?.organic) {
      query = query.eq('is_organic', true)
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    if (filters?.offset) {
      query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching products:', error)
      throw error
    }

    // Calculate average ratings
    const productsWithRatings = data?.map(product => ({
      ...product,
      average_rating: product.reviews?.length 
        ? product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.reviews.length
        : null
    })) || []

    return { data: productsWithRatings, error: null }

  } catch (error) {
    console.warn('Supabase unavailable, using fallback data:', error)
    
    // Apply filters to fallback data
    let filteredProducts = [...fallbackProducts]
    
    if (filters?.category) {
      filteredProducts = filteredProducts.filter(p => p.category?.name === filters.category)
    }
    
    if (filters?.seller) {
      filteredProducts = filteredProducts.filter(p => p.seller?.name === filters.seller)
    }
    
    if (filters?.organic) {
      filteredProducts = filteredProducts.filter(p => p.is_organic)
    }
    
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase()
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchLower) || 
        p.description?.toLowerCase().includes(searchLower)
      )
    }
    
    if (filters?.offset) {
      const start = filters.offset
      const end = start + (filters.limit || 10)
      filteredProducts = filteredProducts.slice(start, end)
    } else if (filters?.limit) {
      filteredProducts = filteredProducts.slice(0, filters.limit)
    }
    
    return { data: filteredProducts, error: null }
  }
}

export const getSellers = async () => {
  try {
    const { data, error } = await supabase
      .from('sellers')
      .select('*')
      .eq('verified', true)
      .order('name')

    if (error) {
      throw error
    }

    return { data: data || [], error: null }

  } catch (error) {
    console.warn('Supabase unavailable, using fallback sellers:', error)
    return { data: fallbackSellers, error: null }
  }
}

export const getCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (error) {
      throw error
    }

    return { data: data || [], error: null }

  } catch (error) {
    console.warn('Supabase unavailable, using fallback categories:', error)
    return { data: fallbackCategories, error: null }
  }
}

export const getProductById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        seller:sellers(*),
        category:categories(*),
        reviews:product_reviews(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      throw error
    }

    // Calculate average rating
    const average_rating = data.reviews?.length 
      ? data.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / data.reviews.length
      : null

    return { 
      data: { ...data, average_rating }, 
      error: null 
    }

  } catch (error) {
    console.warn('Supabase unavailable, using fallback product:', error)
    
    // Find fallback product
    const fallbackProduct = fallbackProducts.find(p => p.id === id)
    if (fallbackProduct) {
      return { data: fallbackProduct, error: null }
    }
    
    return { data: null, error: 'Product not found' }
  }
}

export const addProductReview = async (review: {
  product_id: string
  customer_name: string
  rating: number
  comment?: string
}) => {
  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .insert([review])
      .select()
      .single()

    if (error) {
      throw error
    }

    return { data, error: null }

  } catch (error) {
    console.warn('Supabase unavailable, review not saved:', error)
    return { 
      data: null, 
      error: 'Unable to save review. Please try again later.' 
    }
  }
}