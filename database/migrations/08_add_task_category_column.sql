-- =====================================================
-- Add task_category column to release_tasks table
-- =====================================================
-- This migration adds a task_category column to distinguish between
-- checklist tasks and timeline tasks

BEGIN;

-- Add task_category column to release_tasks table
ALTER TABLE release_tasks 
ADD COLUMN task_category VARCHAR(50) DEFAULT 'checklist';

-- Add constraint to ensure valid task categories
ALTER TABLE release_tasks 
ADD CONSTRAINT valid_task_category 
CHECK (task_category IN ('checklist', 'timeline'));

-- Add comment for the new column
COMMENT ON COLUMN release_tasks.task_category IS 'Category of task: checklist (Project Checklist) or timeline (Project Timeline)';

-- Create index for performance when filtering by category
CREATE INDEX IF NOT EXISTS idx_release_tasks_category 
ON release_tasks(release_id, task_category);

-- Update existing tasks to have 'checklist' category (they are all checklist tasks currently)
UPDATE release_tasks 
SET task_category = 'checklist' 
WHERE task_category IS NULL;

-- Make the column NOT NULL now that all existing records have values
ALTER TABLE release_tasks 
ALTER COLUMN task_category SET NOT NULL;

COMMIT;

-- Verify the column was added successfully
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'release_tasks' 
AND column_name = 'task_category';
