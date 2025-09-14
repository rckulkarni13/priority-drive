-- Fix existing tasks that should be subtasks
UPDATE tasks 
SET type = 'subtask' 
WHERE parent_task_id IS NOT NULL AND type = 'task';