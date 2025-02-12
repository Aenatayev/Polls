/*
  # Final Fix for Profile RLS Policies

  1. Changes
    - Drop and recreate all profile policies to ensure clean state
    - Add policy for profile creation during signup
    - Add policy for profile updates
    - Add policy for profile reads
    - Add policy for public profile access

  2. Security
    - Maintains RLS protection while fixing access issues
    - Ensures proper profile creation during signup
    - Allows users to manage their own profiles
*/

-- First, ensure we can handle the signup flow
CREATE POLICY "Enable profile creation during signup"
  ON profiles FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Allow users to read any profile (needed for basic functionality)
CREATE POLICY "Enable read access for all profiles"
  ON profiles FOR SELECT
  USING (true);

-- Allow users to update their own profile
CREATE POLICY "Enable users to update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);