/*
  # Unified Waitlist System Tables

  1. New Tables
    - `waitlist` - Real queue numbers and user signups
      - `id` (uuid, primary key)
      - `email` (text) - User email
      - `location` (text) - Full location string
      - `city` (text) - Parsed city name
      - `state` (text) - Parsed state
      - `zip_code` (text) - Zip code if available
      - `interests` (text[]) - Array of interests
      - `product_interests` (text) - What they want to find
      - `waitlist_type` (text) - geographic or early_access
      - `created_at` (timestamp)

    - `user_analytics` - Market intelligence data
      - `id` (uuid, primary key)
      - `session_id` (text) - Session tracking
      - `action` (text) - User action type
      - `data` (jsonb) - Action details
      - `location` (text) - User location
      - `user_location_type` (text) - nwa or out_of_region
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access to insert data
*/

-- Create waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  location text NOT NULL,
  city text,
  state text,
  zip_code text,
  interests text[] DEFAULT '{}',
  product_interests text,
  waitlist_type text NOT NULL CHECK (waitlist_type IN ('geographic', 'early_access')),
  created_at timestamptz DEFAULT now()
);

-- Create user analytics table
CREATE TABLE IF NOT EXISTS user_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text,
  action text NOT NULL,
  data jsonb DEFAULT '{}',
  location text,
  user_location_type text CHECK (user_location_type IN ('nwa', 'out_of_region')),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Public can insert waitlist entries"
  ON waitlist
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can insert analytics"
  ON user_analytics
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_waitlist_city_type ON waitlist(city, waitlist_type);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_session ON user_analytics(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_action ON user_analytics(action);
CREATE INDEX IF NOT EXISTS idx_analytics_location_type ON user_analytics(user_location_type);