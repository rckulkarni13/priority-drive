-- Make due_date optional so users can clear it
ALTER TABLE public.tasks
ALTER COLUMN due_date DROP NOT NULL;