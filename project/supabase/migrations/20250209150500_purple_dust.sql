/*
  # Form Builder Enhancement

  1. New Tables
    - form_templates: Store reusable form templates
    - form_sections: Manage form sections for both polls and surveys
    - form_validations: Store validation rules for form questions
    - form_themes: Store custom themes for forms

  2. Changes
    - Add new columns to polls and surveys tables for themes, templates, points, and conditional logic
    
  3. Security
    - Enable RLS on all new tables
    - Add policies for templates, sections, validations, and themes
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
    -- Form templates policies
    DROP POLICY IF EXISTS "Users can view public templates" ON form_templates;
    DROP POLICY IF EXISTS "Users can view their own templates" ON form_templates;
    DROP POLICY IF EXISTS "Users can create templates" ON form_templates;
    
    -- Form sections policies
    DROP POLICY IF EXISTS "Users can view sections for public forms" ON form_sections;
    DROP POLICY IF EXISTS "Users can view their own form sections" ON form_sections;
    
    -- Form validations policies
    DROP POLICY IF EXISTS "Users can view validations for public forms" ON form_validations;
    
    -- Form themes policies
    DROP POLICY IF EXISTS "Users can view public themes" ON form_themes;
    DROP POLICY IF EXISTS "Users can view their own themes" ON form_themes;
    DROP POLICY IF EXISTS "Users can create themes" ON form_themes;
EXCEPTION
    WHEN undefined_table THEN null;
    WHEN undefined_object THEN null;
END $$;

-- Create form templates table
CREATE TABLE IF NOT EXISTS form_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  category text,
  subcategory text,
  structure jsonb NOT NULL,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create form sections table
CREATE TABLE IF NOT EXISTS form_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL,
  form_type text NOT NULL CHECK (form_type IN ('poll', 'survey')),
  title text NOT NULL,
  description text,
  order_index integer NOT NULL,
  conditional_logic jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create form validations table
CREATE TABLE IF NOT EXISTS form_validations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL,
  form_type text NOT NULL CHECK (form_type IN ('poll', 'survey')),
  validation_type text NOT NULL,
  validation_rules jsonb NOT NULL,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create form themes table
CREATE TABLE IF NOT EXISTS form_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  styles jsonb NOT NULL,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add columns to polls table
ALTER TABLE polls 
  ADD COLUMN IF NOT EXISTS theme_id uuid REFERENCES form_themes(id),
  ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES form_templates(id),
  ADD COLUMN IF NOT EXISTS points_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS points_per_completion integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS conditional_logic jsonb;

-- Add columns to surveys table
ALTER TABLE surveys 
  ADD COLUMN IF NOT EXISTS theme_id uuid REFERENCES form_themes(id),
  ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES form_templates(id),
  ADD COLUMN IF NOT EXISTS points_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS points_per_completion integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS conditional_logic jsonb;

-- Create triggers to validate form_sections foreign keys
CREATE OR REPLACE FUNCTION check_form_sections_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.form_type = 'poll' THEN
    IF NOT EXISTS (SELECT 1 FROM polls WHERE id = NEW.form_id) THEN
      RAISE EXCEPTION 'Invalid poll reference';
    END IF;
  ELSIF NEW.form_type = 'survey' THEN
    IF NOT EXISTS (SELECT 1 FROM surveys WHERE id = NEW.form_id) THEN
      RAISE EXCEPTION 'Invalid survey reference';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_form_sections_reference_trigger
BEFORE INSERT OR UPDATE ON form_sections
FOR EACH ROW
EXECUTE FUNCTION check_form_sections_reference();

-- Create triggers to validate form_validations foreign keys
CREATE OR REPLACE FUNCTION check_form_validations_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.form_type = 'poll' THEN
    IF NOT EXISTS (SELECT 1 FROM questions WHERE id = NEW.question_id) THEN
      RAISE EXCEPTION 'Invalid poll question reference';
    END IF;
  ELSIF NEW.form_type = 'survey' THEN
    IF NOT EXISTS (SELECT 1 FROM survey_questions WHERE id = NEW.question_id) THEN
      RAISE EXCEPTION 'Invalid survey question reference';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_form_validations_reference_trigger
BEFORE INSERT OR UPDATE ON form_validations
FOR EACH ROW
EXECUTE FUNCTION check_form_validations_reference();

-- Enable RLS
ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_themes ENABLE ROW LEVEL SECURITY;

-- Form templates policies
CREATE POLICY "Users can view public templates"
  ON form_templates FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can view their own templates"
  ON form_templates FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can create templates"
  ON form_templates FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

-- Form sections policies
CREATE POLICY "Users can view sections for public forms"
  ON form_sections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM polls WHERE id = form_id AND is_public = true
      UNION
      SELECT 1 FROM surveys WHERE id = form_id AND is_public = true
    )
  );

CREATE POLICY "Users can view their own form sections"
  ON form_sections FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM polls WHERE id = form_id AND created_by = auth.uid()
      UNION
      SELECT 1 FROM surveys WHERE id = form_id AND created_by = auth.uid()
    )
  );

-- Form validations policies
CREATE POLICY "Users can view validations for public forms"
  ON form_validations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM polls p 
      JOIN questions q ON q.poll_id = p.id 
      WHERE q.id = question_id AND p.is_public = true
      UNION
      SELECT 1 FROM surveys s
      JOIN survey_questions sq ON sq.survey_id = s.id
      WHERE sq.id = question_id AND s.is_public = true
    )
  );

-- Form themes policies
CREATE POLICY "Users can view public themes"
  ON form_themes FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can view their own themes"
  ON form_themes FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can create themes"
  ON form_themes FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());