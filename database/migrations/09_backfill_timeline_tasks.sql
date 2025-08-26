-- Migration: Backfill timeline tasks for existing releases
-- This ensures existing releases get interactive timeline functionality

-- Generate timeline tasks for existing releases that don't have them
INSERT INTO release_tasks (
    release_id,
    artist_id,
    task_description,
    task_category,
    task_order,
    created_at,
    updated_at
)
SELECT 
    mr.id as release_id,
    mr.artist_id,
    task_data.task_description,
    'timeline' as task_category,
    task_data.task_order,
    NOW() as created_at,
    NOW() as updated_at
FROM music_releases mr
CROSS JOIN (
    SELECT 
        unnest(tt.tasks::json->>'tasks')::json->>'description' as task_description,
        ROW_NUMBER() OVER () as task_order
    FROM task_templates tt 
    WHERE tt.template_name = 'Project Timeline Tasks'
    AND tt.release_type = mr.release_type
) task_data
WHERE NOT EXISTS (
    -- Only add timeline tasks if the release doesn't already have them
    SELECT 1 FROM release_tasks rt 
    WHERE rt.release_id = mr.id 
    AND rt.task_category = 'timeline'
);

-- Verify the backfill worked
SELECT 
    mr.title,
    mr.release_type,
    COUNT(CASE WHEN rt.task_category = 'checklist' THEN 1 END) as checklist_tasks,
    COUNT(CASE WHEN rt.task_category = 'timeline' THEN 1 END) as timeline_tasks
FROM music_releases mr
LEFT JOIN release_tasks rt ON mr.id = rt.release_id
GROUP BY mr.id, mr.title, mr.release_type
ORDER BY mr.title;
