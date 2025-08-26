-- =====================================================
-- Add Timeline Task Templates for Project Timeline
-- =====================================================
-- This migration adds timeline-specific task templates that will be used
-- to generate interactive timeline tasks for the Project Timeline section
-- Since there's a unique constraint on release_type, we need to drop it first

BEGIN;

-- Drop the unique constraint on release_type to allow multiple templates per release type
ALTER TABLE task_templates DROP CONSTRAINT IF EXISTS task_templates_release_type_unique;

-- Add a composite unique constraint on (release_type, template_name) instead
ALTER TABLE task_templates ADD CONSTRAINT task_templates_release_type_template_unique 
    UNIQUE (release_type, template_name);

-- Timeline Template for Single Release
INSERT INTO task_templates (release_type, template_name, tasks, is_active) 
VALUES (
    'single',
    'Project Timeline Tasks',
    '[
        "Recording Complete",
        "Artwork & Design", 
        "Launch Presave Campaign",
        "Music Video Production",
        "Mixing & Mastering",
        "Upload to Distribution",
        "Music Video Complete",
        "Metadata Submission",
        "DSP Distribution"
    ]'::jsonb,
    true
);

-- Timeline Template for EP Release
INSERT INTO task_templates (release_type, template_name, tasks, is_active) 
VALUES (
    'ep',
    'Project Timeline Tasks',
    '[
        "Recording Complete",
        "Artwork & Design",
        "Launch Presave Campaign", 
        "Music Video Production",
        "Mixing & Mastering",
        "Upload to Distribution",
        "Music Video Complete",
        "Metadata Submission",
        "DSP Distribution"
    ]'::jsonb,
    true
);

-- Timeline Template for Album Release  
INSERT INTO task_templates (release_type, template_name, tasks, is_active) 
VALUES (
    'album',
    'Project Timeline Tasks',
    '[
        "Recording Complete",
        "Artwork & Design",
        "Launch Presave Campaign",
        "Music Video Production", 
        "Mixing & Mastering",
        "Upload to Distribution",
        "Music Video Complete",
        "Metadata Submission",
        "DSP Distribution"
    ]'::jsonb,
    true
);

-- Timeline Template for Mixtape Release
INSERT INTO task_templates (release_type, template_name, tasks, is_active) 
VALUES (
    'mixtape',
    'Project Timeline Tasks',
    '[
        "Recording Complete",
        "Artwork & Design",
        "Launch Presave Campaign",
        "Music Video Production",
        "Mixing & Mastering", 
        "Upload to Distribution",
        "Music Video Complete",
        "Metadata Submission",
        "DSP Distribution"
    ]'::jsonb,
    true
);

COMMIT;

-- Verify timeline templates were created
SELECT 
    release_type, 
    template_name, 
    is_active,
    jsonb_array_length(tasks) as task_count,
    tasks
FROM task_templates 
WHERE template_name = 'Project Timeline Tasks'
ORDER BY release_type;
