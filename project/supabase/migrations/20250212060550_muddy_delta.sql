/*
  # Fix Profile Policies Recursion

  1. Changes
    - Drop all existing profile policies
    - Create simplified, non-recursive policies
    - Add proper security policies for profiles table

  2. Security
    - Enable RLS
    - Add policies for insert, select, and update operations
    - Ensure proper access control
*/

-- First, drop all existing policies to start fresh
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Enable profile creation during signup" ON profiles;
  DROP POLICY IF EXISTS "Enable read access for all profiles" ON profiles;
  DROP POLICY IF EXISTS "Enable users to update own profile" ON profiles;
  DROP POLICY IF EXISTS "Allow authenticated users to create their own profile" ON profiles;
  DROP POLICY IF EXISTS "Allow users to read their own profile" ON profiles;
  DROP POLICY IF EXISTS "Allow users to update their own profile" ON profiles;
  DROP POLICY IF EXISTS "Allow public read access to basic profile info" ON profiles;
  DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
  DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
  DROP POLICY IF EXISTS "Enable read access for users" ON profiles;
  DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create new, simplified policies
CREATE POLICY "Profiles insert policy"
ON profiles FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Profiles select policy"
ON profiles FOR SELECT
USING (true);  -- Allow public read access to all profiles

CREATE POLICY "Profiles update policy"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);