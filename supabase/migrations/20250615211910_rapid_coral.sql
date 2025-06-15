/*
  # Fresh Local Food Marketplace Database Schema

  1. New Tables
    - `sellers` - Local producers, farms, and vendors
      - `id` (uuid, primary key)
      - `name` (text) - Business/farm name
      - `description` (text) - About the seller
      - `location` (text) - Address/location description
      - `latitude` (decimal) - GPS coordinates
      - `longitude` (decimal) - GPS coordinates
      - `seller_type` (text) - farm, bakery, dairy, etc.
      - `contact_email` (text)
      - `contact_phone` (text)
      - `website` (text, optional)
      - `verified` (boolean) - Verified seller status
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `categories` - Product categories
      - `id` (uuid, primary key)
      - `name` (text) - Category name
      - `description` (text)
      - `icon` (text) - Icon identifier
      - `created_at` (timestamp)

    - `products` - All available products
      - `id` (uuid, primary key)
      - `seller_id` (uuid, foreign key to sellers)
      - `category_id` (uuid, foreign key to categories)
      - `name` (text) - Product name
      - `description` (text) - Product description
      - `price` (decimal) - Price per unit
      - `unit` (text) - lb, dozen, bunch, etc.
      - `image_url` (text) - Product image
      - `stock_quantity` (integer) - Available quantity
      - `is_organic` (boolean)
      - `is_local` (boolean)
      - `harvest_date` (date, optional) - When harvested
      - `available_from` (date) - Availability start
      - `available_until` (date) - Availability end
      - `tags` (text[]) - Array of tags like "grass-fed", "free-range"
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `product_reviews` - Customer reviews
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products)
      - `customer_name` (text)
      - `rating` (integer) - 1-5 stars
      - `comment` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Add policies for authenticated users to manage their own data

  3. Indexes
    - Add indexes for common queries (location, category, seller)
*/

-- Create sellers table
CREATE TABLE IF NOT EXISTS sellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  location text NOT NULL,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  seller_type text NOT NULL CHECK (seller_type IN ('farm', 'bakery', 'dairy', 'meat', 'orchard', 'apiary', 'market')),
  contact_email text,
  contact_phone text,
  website text,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  icon text,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES sellers(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price decimal(10, 2) NOT NULL,
  unit text NOT NULL,
  image_url text,
  stock_quantity integer DEFAULT 0,
  is_organic boolean DEFAULT false,
  is_local boolean DEFAULT true,
  harvest_date date,
  available_from date DEFAULT CURRENT_DATE,
  available_until date,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create product reviews table
CREATE TABLE IF NOT EXISTS product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public can read sellers"
  ON sellers
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can read categories"
  ON categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can read products"
  ON products
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public can read reviews"
  ON product_reviews
  FOR SELECT
  TO public
  USING (true);

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can insert reviews"
  ON product_reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sellers_location ON sellers(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_sellers_type ON sellers(seller_type);
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_organic ON products(is_organic);
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON product_reviews(rating);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_sellers_updated_at BEFORE UPDATE ON sellers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();