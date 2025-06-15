import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

// API functions
export const getProducts = async (filters?: {
  category?: string
  seller?: string
  organic?: boolean
  search?: string
  limit?: number
  offset?: number
}) => {
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
    return { data: [], error }
  }

  // Calculate average ratings
  const productsWithRatings = data?.map(product => ({
    ...product,
    average_rating: product.reviews?.length 
      ? product.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / product.reviews.length
      : null
  })) || []

  return { data: productsWithRatings, error: null }
}

export const getSellers = async () => {
  const { data, error } = await supabase
    .from('sellers')
    .select('*')
    .eq('verified', true)
    .order('name')

  return { data: data || [], error }
}

export const getCategories = async () => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  return { data: data || [], error }
}

export const getProductById = async (id: string) => {
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
    return { data: null, error }
  }

  // Calculate average rating
  const average_rating = data.reviews?.length 
    ? data.reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / data.reviews.length
    : null

  return { 
    data: { ...data, average_rating }, 
    error: null 
  }
}

export const addProductReview = async (review: {
  product_id: string
  customer_name: string
  rating: number
  comment?: string
}) => {
  const { data, error } = await supabase
    .from('product_reviews')
    .insert([review])
    .select()
    .single()

  return { data, error }
}