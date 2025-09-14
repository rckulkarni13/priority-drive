-- Add missing UPDATE policies for junction tables to ensure users can only update relationships for entities they own

-- Add UPDATE policy for pillar_domains table
CREATE POLICY "Users can update own pillar_domains" 
ON public.pillar_domains 
FOR UPDATE 
USING (EXISTS ( 
  SELECT 1
  FROM strategic_pillars
  WHERE ((strategic_pillars.id = pillar_domains.pillar_id) AND (strategic_pillars.user_id = auth.uid()))
));

-- Add UPDATE policy for task_themes table  
CREATE POLICY "Users can update own task_themes"
ON public.task_themes 
FOR UPDATE 
USING (EXISTS ( 
  SELECT 1
  FROM tasks
  WHERE ((tasks.id = task_themes.task_id) AND (tasks.user_id = auth.uid()))
));

-- Add UPDATE policy for theme_pillars table
CREATE POLICY "Users can update own theme_pillars"
ON public.theme_pillars 
FOR UPDATE 
USING (EXISTS ( 
  SELECT 1
  FROM themes
  WHERE ((themes.id = theme_pillars.theme_id) AND (themes.user_id = auth.uid()))
));