-- Create comments table for task comments
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for comments
CREATE POLICY "Users can view comments on their own tasks" 
ON public.comments 
FOR SELECT 
USING (EXISTS (
  SELECT 1 
  FROM tasks 
  WHERE tasks.id = comments.task_id AND tasks.user_id = auth.uid()
));

CREATE POLICY "Users can create comments on their own tasks" 
ON public.comments 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (
    SELECT 1 
    FROM tasks 
    WHERE tasks.id = comments.task_id AND tasks.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own comments" 
ON public.comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update updated_date
CREATE OR REPLACE FUNCTION public.update_comments_updated_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_date = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_comments_updated_date
BEFORE UPDATE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.update_comments_updated_date();

-- Add foreign key constraint (optional but good practice)
ALTER TABLE public.comments 
ADD CONSTRAINT fk_comments_task_id 
FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE;