-- Remove the automatic workspace creation trigger
DROP TRIGGER IF EXISTS on_auth_user_created_workspaces ON auth.users;
DROP FUNCTION IF EXISTS public.create_default_workspaces();

-- Instead, we'll create workspaces based on user selection during onboarding
-- Add a flag to track onboarding completion in user metadata or profiles table
-- We'll use localStorage for simplicity, but could also add a profiles table