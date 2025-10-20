-- Add color column to domains table
ALTER TABLE public.domains ADD COLUMN color text NOT NULL DEFAULT '#3b82f6';