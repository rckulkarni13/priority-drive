ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS recurrence_rule jsonb,
  ADD COLUMN IF NOT EXISTS recurrence_anchor_date timestamp with time zone;