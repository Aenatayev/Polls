/*
  # Database Improvements

  1. Performance Optimizations
    - Add indexes for commonly queried columns
    - Add composite indexes for related queries
  
  2. Soft Delete Support
    - Add deleted_at column to relevant tables
    - Update policies to filter soft-deleted records
  
  3. Enhanced Security
    - Add rate limiting for responses
    - Improve RLS policies
  
  4. Error Handling
    - Add check constraints
    - Add validation functions
*/

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_polls_created_by ON polls (created_by);
CREATE INDEX IF NOT EXISTS idx_polls_category ON polls (category, subcategory);
CREATE INDEX IF NOT EXISTS idx_questions_poll_id ON questions (poll_id);
CREATE INDEX IF NOT EXISTS idx_responses_poll_id ON responses (poll_id);
CREATE INDEX IF NOT EXISTS idx_responses_user_id ON responses (user_id);
CREATE INDEX IF NOT EXISTS idx_surveys_created_by ON surveys (created_by);
CREATE INDEX IF NOT EXISTS idx_survey_questions_survey_id ON survey_questions (survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON survey_responses (survey_id);

-- Add soft delete support
ALTER TABLE polls ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE responses ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE survey_responses ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Add check constraints for validation
ALTER TABLE polls 
  ADD CONSTRAINT check_poll_dates 
  CHECK (
    (expires_at IS NULL) OR 
    (expires_at > created_at)
  );

ALTER TABLE polls 
  ADD CONSTRAINT check_points 
  CHECK (
    (NOT points_enabled) OR 
    (points_per_completion >= 0)
  );

-- Create function to check response limits
CREATE OR REPLACE FUNCTION check_response_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM responses 
    WHERE user_id = auth.uid() 
    AND poll_id = NEW.poll_id 
    AND created_at > NOW() - INTERVAL '1 minute'
    LIMIT 5
  ) THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please wait before submitting another response.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for rate limiting
DROP TRIGGER IF EXISTS check_response_limit_trigger ON responses;
CREATE TRIGGER check_response_limit_trigger
  BEFORE INSERT ON responses
  FOR EACH ROW
  EXECUTE FUNCTION check_response_limit();

-- Update policies to handle soft deletes
CREATE POLICY "Filter out soft deleted polls"
  ON polls
  FOR ALL
  USING (deleted_at IS NULL);

CREATE POLICY "Filter out soft deleted surveys"
  ON surveys
  FOR ALL
  USING (deleted_at IS NULL);

-- Add function for soft delete
CREATE OR REPLACE FUNCTION soft_delete_poll(poll_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE polls 
  SET deleted_at = NOW()
  WHERE id = poll_id 
  AND created_by = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;