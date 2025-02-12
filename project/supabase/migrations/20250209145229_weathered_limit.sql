/*
  # Add Category Columns to Polls Table
  
  1. Changes
    - Add category column to polls table
    - Add subcategory column to polls table
  
  2. Notes
    - These columns are needed for categorizing polls
    - Both columns are optional (nullable)
*/

-- Add category and subcategory columns to polls table
ALTER TABLE polls 
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS subcategory text;