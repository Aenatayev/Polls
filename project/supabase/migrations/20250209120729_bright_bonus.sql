/*
  # Fix Profile RLS Policies

  1. Changes
    - Add policy to allow profile creation for authenticated users
    - Add policy to allow users to read their own profile
    - Add policy to allow users to update their own profile
    - Add policy to allow users to read public profile information

  2. Security
    - Maintains RLS protection
    - Only allows users to modify their own profiles
    - Allows public read access for basic profile info
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable read access for users" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;

-- Create new policies
CREATE POLICY "Allow authenticated users to create their own profile"
  ON profiles FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to read their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow public read access to basic profile info"
  ON profiles FOR SELECT
  USING (true);