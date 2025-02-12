/*
  # Add Survey Tables and Policies

  1. New Tables
    - `surveys`: Main survey table
    - `survey_questions`: Questions for surveys
    - `survey_responses`: Responses to surveys

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for public access where appropriate

  3. Changes
    - Add survey-specific tables and policies
    - Mirror poll structure but with survey-specific fields
*/

-- Create surveys table
CREATE TABLE IF NOT EXISTS surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  is_anonymous boolean DEFAULT true,
  is_public boolean DEFAULT false,
  category text,
  subcategory text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create survey questions table
CREATE TABLE IF NOT EXISTS survey_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid REFERENCES surveys ON DELETE CASCADE NOT NULL,
  text text NOT NULL,
  type text NOT NULL CHECK (type IN ('multiple_choice', 'ranking', 'text')),
  options jsonb,
  required boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create survey responses table
CREATE TABLE IF NOT EXISTS survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid REFERENCES surveys ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles ON DELETE SET NULL,
  answers jsonb NOT NULL,
  location jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Surveys policies
CREATE POLICY "Anyone can view public surveys"
  ON surveys FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can view their own private surveys"
  ON surveys FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can create surveys"
  ON surveys FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own surveys"
  ON surveys FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

-- Survey questions policies
CREATE POLICY "Anyone can view questions for public surveys"
  ON survey_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM surveys
      WHERE surveys.id = survey_id
      AND surveys.is_public = true
    )
  );

CREATE POLICY "Users can view questions for their own surveys"
  ON survey_questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM surveys
      WHERE surveys.id = survey_id
      AND surveys.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can create questions for their surveys"
  ON survey_questions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM surveys
      WHERE surveys.id = survey_id
      AND surveys.created_by = auth.uid()
    )
  );

-- Survey responses policies
CREATE POLICY "Survey creators can view all responses"
  ON survey_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM surveys
      WHERE surveys.id = survey_id
      AND surveys.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can view their own responses"
  ON survey_responses FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can submit responses"
  ON survey_responses FOR INSERT
  TO authenticated
  WITH CHECK (true);