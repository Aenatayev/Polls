/*
  # Initial Schema Setup for PollMaster

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `name` (text)
      - `avatar_url` (text)
      - `points` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `polls`
      - `id` (uuid, primary key)
      - `created_by` (uuid, references profiles)
      - `title` (text)
      - `description` (text)
      - `is_anonymous` (boolean)
      - `is_public` (boolean)
      - `expires_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `questions`
      - `id` (uuid, primary key)
      - `poll_id` (uuid, references polls)
      - `text` (text)
      - `type` (text)
      - `options` (jsonb)
      - `required` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `responses`
      - `id` (uuid, primary key)
      - `poll_id` (uuid, references polls)
      - `user_id` (uuid, references profiles)
      - `answers` (jsonb)
      - `location` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  avatar_url text,
  points integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create polls table
CREATE TABLE IF NOT EXISTS polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  is_anonymous boolean DEFAULT false,
  is_public boolean DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES polls ON DELETE CASCADE NOT NULL,
  text text NOT NULL,
  type text NOT NULL CHECK (type IN ('multiple_choice', 'ranking', 'text')),
  options jsonb,
  required boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create responses table
CREATE TABLE IF NOT EXISTS responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid REFERENCES polls ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles ON DELETE SET NULL,
  answers jsonb NOT NULL,
  location jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Polls policies
CREATE POLICY "Anyone can view public polls"
  ON polls FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can view their own private polls"
  ON polls FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can create polls"
  ON polls FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own polls"
  ON polls FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Questions policies
CREATE POLICY "Anyone can view questions for public polls"
  ON questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM polls
      WHERE polls.id = poll_id
      AND polls.is_public = true
    )
  );

CREATE POLICY "Users can view questions for their own polls"
  ON questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM polls
      WHERE polls.id = poll_id
      AND polls.created_by = auth.uid()
    )
  );

-- Responses policies
CREATE POLICY "Poll creators can view all responses"
  ON responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM polls
      WHERE polls.id = poll_id
      AND polls.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view their own responses"
  ON responses FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can submit responses"
  ON responses FOR INSERT
  TO authenticated
  WITH CHECK (true);