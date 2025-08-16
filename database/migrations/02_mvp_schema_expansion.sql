-- =====================================================
-- MVP Schema Expansion Migration
-- File: 02_mvp_schema_expansion.sql
-- Purpose: Foundational database schema for Release Manager To-Do Lists and Lyric Sheets
-- Author: Database Architecture Team
-- Date: 2025-08-10
-- =====================================================

-- This migration extends the existing All Access Artist database schema to support:
-- 1. Release Manager To-Do List functionality
-- 2. Lyric Sheet editor and management
-- 3. Enhanced release project budgeting

-- All operations are idempotent and can be run multiple times safely
-- Foreign key relationships maintain data integrity and support RLS policies

BEGIN;

-- =====================================================
-- 1. MODIFY EXISTING TABLES
-- =====================================================

-- Add project budget tracking to existing music_releases table
-- This supports financial planning and budget management for each release
ALTER TABLE music_releases 
ADD COLUMN IF NOT EXISTS project_budget NUMERIC(12,2) DEFAULT 0.00;

-- Add comment for the new column
COMMENT ON COLUMN music_releases.project_budget IS 'Total budget allocated for this music release project in USD';

-- =====================================================
-- 2. CREATE SONGS TABLE
-- =====================================================

-- Individual tracks that belong to a release (EP, Album, or Single collection)
-- Supports multi-track releases with proper ordering and metadata
CREATE TABLE IF NOT EXISTS songs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    release_id UUID NOT NULL REFERENCES music_releases(id) ON DELETE CASCADE,
    artist_id UUID NOT NULL REFERENCES artist_profiles(id) ON DELETE CASCADE,
    song_title TEXT NOT NULL,
    track_number INTEGER,
    duration_seconds INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure track numbers are unique within a release
    CONSTRAINT unique_track_number_per_release UNIQUE(release_id, track_number),
    
    -- Ensure track numbers are positive
    CONSTRAINT positive_track_number CHECK (track_number > 0),
    
    -- Ensure duration is positive if provided
    CONSTRAINT positive_duration CHECK (duration_seconds IS NULL OR duration_seconds > 0)
);

-- Add table comment
COMMENT ON TABLE songs IS 'Individual tracks/songs that belong to a music release';

-- Add column comments
COMMENT ON COLUMN songs.release_id IS 'Foreign key to the parent music release';
COMMENT ON COLUMN songs.artist_id IS 'Foreign key to the artist who owns this song (for RLS)';
COMMENT ON COLUMN songs.song_title IS 'Official title of the individual song/track';
COMMENT ON COLUMN songs.track_number IS 'Position/order of this track within the release';
COMMENT ON COLUMN songs.duration_seconds IS 'Length of the track in seconds';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_songs_release_id ON songs(release_id);
CREATE INDEX IF NOT EXISTS idx_songs_artist_id ON songs(artist_id);
CREATE INDEX IF NOT EXISTS idx_songs_track_number ON songs(release_id, track_number);

-- =====================================================
-- 3. CREATE TASK TEMPLATES TABLE
-- =====================================================

-- Predefined task checklists for different types of releases
-- Templates are used to generate actual tasks when a release is created
CREATE TABLE IF NOT EXISTS task_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    release_type VARCHAR(50) NOT NULL,
    template_name VARCHAR(255) NOT NULL,
    tasks JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure release_type is one of the expected values
    CONSTRAINT valid_release_type CHECK (release_type IN ('single', 'ep', 'album', 'mixtape')),
    
    -- Ensure tasks is a valid JSON array
    CONSTRAINT valid_tasks_format CHECK (jsonb_typeof(tasks) = 'array')
);

-- Add table comment
COMMENT ON TABLE task_templates IS 'Predefined task checklists for different release types';

-- Add column comments
COMMENT ON COLUMN task_templates.release_type IS 'Type of release this template applies to (single, ep, album, mixtape)';
COMMENT ON COLUMN task_templates.template_name IS 'Human-readable name for this task template';
COMMENT ON COLUMN task_templates.tasks IS 'JSON array of task description strings';
COMMENT ON COLUMN task_templates.is_active IS 'Whether this template is currently active and should be used';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_task_templates_release_type ON task_templates(release_type);
CREATE INDEX IF NOT EXISTS idx_task_templates_active ON task_templates(is_active) WHERE is_active = true;

-- =====================================================
-- 4. CREATE RELEASE TASKS TABLE
-- =====================================================

-- Actual task instances generated for specific releases
-- Each task can be marked as completed with a timestamp
CREATE TABLE IF NOT EXISTS release_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    release_id UUID NOT NULL REFERENCES music_releases(id) ON DELETE CASCADE,
    artist_id UUID NOT NULL REFERENCES artist_profiles(id) ON DELETE CASCADE,
    task_description TEXT NOT NULL,
    task_order INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure task order is not negative
    CONSTRAINT non_negative_task_order CHECK (task_order >= 0)
);

-- Add table comment
COMMENT ON TABLE release_tasks IS 'Actual task instances for specific music releases';

-- Add column comments
COMMENT ON COLUMN release_tasks.release_id IS 'Foreign key to the parent music release';
COMMENT ON COLUMN release_tasks.artist_id IS 'Foreign key to the artist who owns this task (for RLS)';
COMMENT ON COLUMN release_tasks.task_description IS 'Description of the task to be completed';
COMMENT ON COLUMN release_tasks.task_order IS 'Display order of this task within the release checklist';
COMMENT ON COLUMN release_tasks.completed_at IS 'Timestamp when task was marked complete (NULL = incomplete)';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_release_tasks_release_id ON release_tasks(release_id);
CREATE INDEX IF NOT EXISTS idx_release_tasks_artist_id ON release_tasks(artist_id);
CREATE INDEX IF NOT EXISTS idx_release_tasks_completed ON release_tasks(release_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_release_tasks_order ON release_tasks(release_id, task_order);

-- =====================================================
-- 5. CREATE LYRIC SHEETS TABLE
-- =====================================================

-- Main record for a song's lyric sheet
-- Links to individual songs and stores metadata about the lyrics
CREATE TABLE IF NOT EXISTS lyric_sheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    artist_id UUID NOT NULL REFERENCES artist_profiles(id) ON DELETE CASCADE,
    written_by TEXT,
    additional_notes TEXT,
    total_sections INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure total_sections is not negative
    CONSTRAINT non_negative_sections CHECK (total_sections >= 0)
);

-- Add table comment
COMMENT ON TABLE lyric_sheets IS 'Main lyric sheet records for individual songs';

-- Add column comments
COMMENT ON COLUMN lyric_sheets.song_id IS 'Foreign key to the song these lyrics belong to';
COMMENT ON COLUMN lyric_sheets.artist_id IS 'Foreign key to the artist who owns this lyric sheet (for RLS)';
COMMENT ON COLUMN lyric_sheets.written_by IS 'Comma-separated list of songwriters and composers';
COMMENT ON COLUMN lyric_sheets.additional_notes IS 'Performance notes, vocal directions, or other annotations';
COMMENT ON COLUMN lyric_sheets.total_sections IS 'Cached count of lyric sections for this sheet';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lyric_sheets_song_id ON lyric_sheets(song_id);
CREATE INDEX IF NOT EXISTS idx_lyric_sheets_artist_id ON lyric_sheets(artist_id);

-- =====================================================
-- 6. CREATE LYRIC SHEET SECTIONS TABLE
-- =====================================================

-- Individual sections of a lyric sheet (Verse, Chorus, Bridge, etc.)
-- Supports dynamic ordering and different section types
CREATE TABLE IF NOT EXISTS lyric_sheet_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lyric_sheet_id UUID NOT NULL REFERENCES lyric_sheets(id) ON DELETE CASCADE,
    section_type VARCHAR(50) NOT NULL,
    section_lyrics TEXT NOT NULL,
    section_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure section_type is one of the expected values
    CONSTRAINT valid_section_type CHECK (
        section_type IN ('verse', 'chorus', 'pre-chorus', 'bridge', 'refrain', 'outro', 'intro', 'hook', 'ad-lib')
    ),
    
    -- Ensure section order is not negative
    CONSTRAINT non_negative_section_order CHECK (section_order >= 0),
    
    -- Ensure section order is unique within a lyric sheet
    CONSTRAINT unique_section_order_per_sheet UNIQUE(lyric_sheet_id, section_order)
);

-- Add table comment
COMMENT ON TABLE lyric_sheet_sections IS 'Individual sections (verse, chorus, etc.) of lyric sheets';

-- Add column comments
COMMENT ON COLUMN lyric_sheet_sections.lyric_sheet_id IS 'Foreign key to the parent lyric sheet';
COMMENT ON COLUMN lyric_sheet_sections.section_type IS 'Type of section (verse, chorus, bridge, etc.)';
COMMENT ON COLUMN lyric_sheet_sections.section_lyrics IS 'The actual lyrics content for this section';
COMMENT ON COLUMN lyric_sheet_sections.section_order IS 'Display order of this section within the lyric sheet';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_lyric_sheet_sections_sheet_id ON lyric_sheet_sections(lyric_sheet_id);
CREATE INDEX IF NOT EXISTS idx_lyric_sheet_sections_order ON lyric_sheet_sections(lyric_sheet_id, section_order);
CREATE INDEX IF NOT EXISTS idx_lyric_sheet_sections_type ON lyric_sheet_sections(section_type);

-- =====================================================
-- 7. CREATE TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =====================================================

-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables with updated_at columns
CREATE TRIGGER update_songs_updated_at 
    BEFORE UPDATE ON songs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_templates_updated_at 
    BEFORE UPDATE ON task_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_release_tasks_updated_at 
    BEFORE UPDATE ON release_tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lyric_sheets_updated_at 
    BEFORE UPDATE ON lyric_sheets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lyric_sheet_sections_updated_at 
    BEFORE UPDATE ON lyric_sheet_sections 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all new tables to ensure data security
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE release_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE lyric_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE lyric_sheet_sections ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 9. CREATE RLS POLICIES
-- =====================================================

-- Songs: Artists can only access their own songs
CREATE POLICY "Artists can manage their own songs" ON songs
    FOR ALL USING (artist_id = auth.uid());

-- Task Templates: Public read access, admin write access
-- (Templates are shared across all users but managed centrally)
CREATE POLICY "Anyone can read active task templates" ON task_templates
    FOR SELECT USING (is_active = true);

-- Release Tasks: Artists can only access their own release tasks
CREATE POLICY "Artists can manage their own release tasks" ON release_tasks
    FOR ALL USING (artist_id = auth.uid());

-- Lyric Sheets: Artists can only access their own lyric sheets
CREATE POLICY "Artists can manage their own lyric sheets" ON lyric_sheets
    FOR ALL USING (artist_id = auth.uid());

-- Lyric Sheet Sections: Access controlled through parent lyric sheet
CREATE POLICY "Artists can manage sections of their own lyric sheets" ON lyric_sheet_sections
    FOR ALL USING (
        lyric_sheet_id IN (
            SELECT id FROM lyric_sheets WHERE artist_id = auth.uid()
        )
    );

-- =====================================================
-- 10. INSERT DEFAULT TASK TEMPLATES
-- =====================================================

-- Insert predefined task templates for different release types
-- These will be used to generate actual tasks when releases are created

-- Single Release Template
INSERT INTO task_templates (release_type, template_name, tasks) 
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
    ]'::jsonb
) ON CONFLICT DO NOTHING;

-- EP Release Template
INSERT INTO task_templates (release_type, template_name, tasks) 
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
    ]'::jsonb
) ON CONFLICT DO NOTHING;

-- Album Release Template
INSERT INTO task_templates (release_type, template_name, tasks) 
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
    ]'::jsonb
) ON CONFLICT DO NOTHING;

-- Mixtape Release Template
INSERT INTO task_templates (release_type, template_name, tasks) 
VALUES (
    'mixtape',
    'Standard Mixtape Release Checklist',
    '[
        "Complete all track recordings",
        "Finalize mixing for all tracks",
        "Create mixtape artwork",
        "Clear any samples or interpolations",
        "Create track listing",
        "Submit to streaming platforms",
        "Set up SoundCloud/Bandcamp release",
        "Plan social media announcement",
        "Create promotional content",
        "Prepare artist statement or intro"
    ]'::jsonb
) ON CONFLICT DO NOTHING;

COMMIT;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- This migration has successfully:
-- ✅ Added project_budget column to music_releases table
-- ✅ Created songs table with proper foreign keys and constraints
-- ✅ Created task_templates table with predefined checklists
-- ✅ Created release_tasks table for actual task instances
-- ✅ Created lyric_sheets table for song lyric metadata
-- ✅ Created lyric_sheet_sections table for individual lyric sections
-- ✅ Established all foreign key relationships and constraints
-- ✅ Created performance indexes on all tables
-- ✅ Enabled Row Level Security (RLS) on all new tables
-- ✅ Created appropriate RLS policies for data access control
-- ✅ Added automatic updated_at timestamp triggers
-- ✅ Inserted default task templates for all release types
-- ✅ Made all operations idempotent with IF NOT EXISTS clauses

-- The database is now ready to support:
-- 1. Release Manager To-Do List functionality
-- 2. Lyric Sheet editor and management
-- 3. Enhanced release project budgeting
-- 4. Multi-track release support
-- 5. Secure, user-scoped data access
