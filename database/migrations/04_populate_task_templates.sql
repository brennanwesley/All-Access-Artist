-- =====================================================
-- Populate Task Templates for Release Checklists
-- =====================================================
-- This script ensures task templates exist for release checklist generation

BEGIN;

-- Single Release Template
INSERT INTO task_templates (release_type, template_name, tasks, is_active) 
VALUES (
    'single',
    'Standard Single Release Checklist',
    '[
        "Complete song recording",
        "Finalize mixing and mastering",
        "Create album artwork",
        "Register song with PRO (ASCAP/BMI)",
        "Obtain ISRC code",
        "Submit to digital distributors",
        "Set up pre-save campaigns",
        "Plan social media promotion",
        "Schedule release date",
        "Prepare press kit and bio"
    ]'::jsonb,
    true
) ON CONFLICT (release_type, template_name) DO UPDATE SET
    tasks = EXCLUDED.tasks,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- EP Release Template
INSERT INTO task_templates (release_type, template_name, tasks, is_active) 
VALUES (
    'ep',
    'Standard EP Release Checklist',
    '[
        "Complete all track recordings",
        "Finalize mixing and mastering for all tracks",
        "Create album artwork and track art",
        "Register all songs with PRO (ASCAP/BMI)",
        "Obtain ISRC codes for all tracks",
        "Create track listing and metadata",
        "Submit to digital distributors",
        "Set up pre-save campaigns",
        "Plan social media promotion strategy",
        "Schedule release date and rollout",
        "Prepare press kit and bio",
        "Consider physical release options",
        "Plan music video for lead single"
    ]'::jsonb,
    true
) ON CONFLICT (release_type, template_name) DO UPDATE SET
    tasks = EXCLUDED.tasks,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Album Release Template
INSERT INTO task_templates (release_type, template_name, tasks, is_active) 
VALUES (
    'album',
    'Standard Album Release Checklist',
    '[
        "Complete all track recordings",
        "Finalize mixing and mastering for all tracks",
        "Create album artwork and track art",
        "Register all songs with PRO (ASCAP/BMI)",
        "Obtain ISRC codes for all tracks",
        "Create comprehensive track listing and metadata",
        "Submit to digital distributors",
        "Set up pre-save campaigns",
        "Develop comprehensive marketing strategy",
        "Schedule release date and rollout timeline",
        "Prepare press kit, bio, and one-sheet",
        "Plan physical release (vinyl, CD)",
        "Plan music videos for key tracks",
        "Book promotional interviews and performances",
        "Submit to playlist curators",
        "Plan album release show/tour",
        "Create merchandise strategy",
        "Develop sync licensing opportunities"
    ]'::jsonb,
    true
) ON CONFLICT (release_type, template_name) DO UPDATE SET
    tasks = EXCLUDED.tasks,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

COMMIT;

-- Verify templates were created
SELECT release_type, template_name, is_active, 
       jsonb_array_length(tasks) as task_count
FROM task_templates 
WHERE is_active = true
ORDER BY release_type;
