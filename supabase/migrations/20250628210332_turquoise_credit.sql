/*
  # Fix waitlist table RLS policy for anonymous users

  1. Security Updates
    - Drop existing INSERT policy that may not be working correctly
    - Create new INSERT policy that explicitly allows anonymous (anon) users
    - Ensure the policy works for both authenticated and anonymous users

  2. Changes
    - Remove old "Public can insert waitlist entries" policy
    - Add new "Allow anonymous and authenticated users to insert waitlist entries" policy
    - Policy allows both 'anon' and 'authenticated' roles to insert
*/

-- Drop the existing policy if it exists
DROP POLICY IF EXISTS "Public can insert waitlist entries" ON waitlist;

-- Create a new policy that explicitly allows both anonymous and authenticated users to insert
CREATE POLICY "Allow anonymous and authenticated users to insert waitlist entries"
  ON waitlist
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Also ensure we have a SELECT policy for reading waitlist data (for queue position calculation)
DROP POLICY IF EXISTS "Allow anonymous and authenticated users to read waitlist entries" ON waitlist;

CREATE POLICY "Allow anonymous and authenticated users to read waitlist entries"
  ON waitlist
  FOR SELECT
  TO anon, authenticated
  USING (true);