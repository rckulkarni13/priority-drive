-- Create workspace type enum
CREATE TYPE public.workspace_type AS ENUM ('work', 'school', 'home', 'custom');

-- Create workspaces table
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type workspace_type NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, type)
);

-- Enable RLS on workspaces
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- RLS policies for workspaces
CREATE POLICY "Users can view own workspaces"
  ON public.workspaces FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workspaces"
  ON public.workspaces FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workspaces"
  ON public.workspaces FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workspaces"
  ON public.workspaces FOR DELETE
  USING (auth.uid() = user_id);

-- Add workspace_id to existing tables
ALTER TABLE public.tasks ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.themes ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.strategic_pillars ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;
ALTER TABLE public.domains ADD COLUMN workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE;

-- Function to create default workspaces for a user
CREATE OR REPLACE FUNCTION public.create_default_workspaces()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create Work workspace
  INSERT INTO public.workspaces (user_id, name, type, icon, color)
  VALUES (NEW.id, 'Work', 'work', '💼', '#3b82f6');
  
  -- Create School workspace
  INSERT INTO public.workspaces (user_id, name, type, icon, color)
  VALUES (NEW.id, 'School', 'school', '📚', '#8b5cf6');
  
  -- Create Home workspace
  INSERT INTO public.workspaces (user_id, name, type, icon, color)
  VALUES (NEW.id, 'Home', 'home', '🏠', '#10b981');
  
  RETURN NEW;
END;
$$;

-- Trigger to create default workspaces for new users
CREATE TRIGGER on_auth_user_created_workspaces
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_workspaces();

-- Backfill existing users with default workspaces and link their data
DO $$
DECLARE
  user_record RECORD;
  work_workspace_id UUID;
BEGIN
  FOR user_record IN SELECT DISTINCT user_id FROM public.tasks
  LOOP
    -- Create workspaces for existing user if they don't exist
    INSERT INTO public.workspaces (user_id, name, type, icon, color)
    VALUES (user_record.user_id, 'Work', 'work', '💼', '#3b82f6')
    ON CONFLICT (user_id, type) DO NOTHING
    RETURNING id INTO work_workspace_id;
    
    -- If workspace already existed, get its ID
    IF work_workspace_id IS NULL THEN
      SELECT id INTO work_workspace_id FROM public.workspaces 
      WHERE user_id = user_record.user_id AND type = 'work';
    END IF;
    
    -- Link all existing data to Work workspace
    UPDATE public.tasks SET workspace_id = work_workspace_id WHERE user_id = user_record.user_id AND workspace_id IS NULL;
    UPDATE public.themes SET workspace_id = work_workspace_id WHERE user_id = user_record.user_id AND workspace_id IS NULL;
    UPDATE public.strategic_pillars SET workspace_id = work_workspace_id WHERE user_id = user_record.user_id AND workspace_id IS NULL;
    UPDATE public.domains SET workspace_id = work_workspace_id WHERE user_id = user_record.user_id AND workspace_id IS NULL;
    
    -- Create School workspace
    INSERT INTO public.workspaces (user_id, name, type, icon, color)
    VALUES (user_record.user_id, 'School', 'school', '📚', '#8b5cf6')
    ON CONFLICT (user_id, type) DO NOTHING;
    
    -- Create Home workspace
    INSERT INTO public.workspaces (user_id, name, type, icon, color)
    VALUES (user_record.user_id, 'Home', 'home', '🏠', '#10b981')
    ON CONFLICT (user_id, type) DO NOTHING;
  END LOOP;
END $$;

-- Make workspace_id NOT NULL after backfill
ALTER TABLE public.tasks ALTER COLUMN workspace_id SET NOT NULL;
ALTER TABLE public.themes ALTER COLUMN workspace_id SET NOT NULL;
ALTER TABLE public.strategic_pillars ALTER COLUMN workspace_id SET NOT NULL;
ALTER TABLE public.domains ALTER COLUMN workspace_id SET NOT NULL;