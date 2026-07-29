CREATE TABLE public.checklists (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  current_version_id uuid,
  created_date timestamp with time zone NOT NULL DEFAULT now(),
  updated_date timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.checklist_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id uuid NOT NULL REFERENCES public.checklists(id) ON DELETE CASCADE,
  version_number integer NOT NULL DEFAULT 1,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_date timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (checklist_id, version_number)
);

ALTER TABLE public.checklists
  ADD CONSTRAINT checklists_current_version_fkey
  FOREIGN KEY (current_version_id) REFERENCES public.checklist_versions(id) ON DELETE SET NULL;

CREATE INDEX idx_checklists_workspace ON public.checklists(workspace_id);
CREATE INDEX idx_checklist_versions_checklist ON public.checklist_versions(checklist_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.checklists TO authenticated;
GRANT ALL ON public.checklists TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.checklist_versions TO authenticated;
GRANT ALL ON public.checklist_versions TO service_role;

ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own checklists" ON public.checklists
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own checklists" ON public.checklists
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own checklists" ON public.checklists
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own checklists" ON public.checklists
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view own checklist versions" ON public.checklist_versions
  FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.checklists c WHERE c.id = checklist_versions.checklist_id AND c.user_id = auth.uid()));
CREATE POLICY "Users can create own checklist versions" ON public.checklist_versions
  FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.checklists c WHERE c.id = checklist_versions.checklist_id AND c.user_id = auth.uid()));
CREATE POLICY "Users can update own checklist versions" ON public.checklist_versions
  FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.checklists c WHERE c.id = checklist_versions.checklist_id AND c.user_id = auth.uid()));
CREATE POLICY "Users can delete own checklist versions" ON public.checklist_versions
  FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.checklists c WHERE c.id = checklist_versions.checklist_id AND c.user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.update_checklists_updated_date()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_date = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_checklists_updated_date
  BEFORE UPDATE ON public.checklists
  FOR EACH ROW EXECUTE FUNCTION public.update_checklists_updated_date();