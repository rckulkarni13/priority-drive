UPDATE public.tasks t
SET created_date = '2026-07-30 15:30:21.676035+00'::timestamptz + ((t.task_order - 130) * interval '1 second')
FROM public.task_themes tt
WHERE tt.task_id = t.id
  AND tt.theme_id = '5c874e45-6b37-4f88-98e3-5e6d4da9ec5f'
  AND t.task_order BETWEEN 130 AND 142;