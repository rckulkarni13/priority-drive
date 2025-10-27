-- Add color column to strategic_pillars table
ALTER TABLE strategic_pillars 
ADD COLUMN color text NOT NULL DEFAULT '#8b5cf6';

-- Add color column to themes table
ALTER TABLE themes 
ADD COLUMN color text NOT NULL DEFAULT '#06b6d4';