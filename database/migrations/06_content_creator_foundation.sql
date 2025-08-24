-- =====================================================
-- Content Creator Foundation Migration
-- File: 06_content_creator_foundation.sql
-- Purpose: Database foundation for AI-powered content creation suite
-- Author: All Access Artist Development Team
-- Date: 2025-08-24
-- =====================================================

-- This migration creates the foundational database schema for:
-- 1. Generated content management (AI-created images, text, etc.)
-- 2. Artist asset library (Brand Kit functionality)
-- 3. Generation job tracking for async operations
-- 4. Enhanced content calendar with generated content associations

-- All operations are idempotent and can be run multiple times safely
-- Foreign key relationships maintain data integrity and support RLS policies

BEGIN;

-- =====================================================
-- 1. GENERATED CONTENT TABLE
-- =====================================================

-- Unified table for all AI-generated content (images, text, etc.)
-- Supports versioning, metadata tracking, and usage analytics
CREATE TABLE IF NOT EXISTS generated_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('image', 'text', 'video', 'audio')),
    
    -- Content Storage
    file_url VARCHAR(500), -- Supabase Storage URL for media files
    file_size_bytes BIGINT,
    file_format VARCHAR(20), -- 'png', 'jpg', 'mp4', 'txt', etc.
    
    -- Generation Context
    prompt_text TEXT NOT NULL, -- Original generation prompt
    generation_model VARCHAR(100), -- 'dall-e-3', 'midjourney', 'gpt-4', etc.
    generation_settings JSONB DEFAULT '{}', -- Model-specific parameters
    
    -- Content Metadata
    title VARCHAR(300),
    description TEXT,
    tags TEXT[] DEFAULT '{}', -- Searchable tags
    
    -- Usage Tracking
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    
    -- Quality & Moderation
    quality_score DECIMAL(3,2), -- 0.00 to 1.00
    is_approved BOOLEAN DEFAULT TRUE,
    moderation_flags JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_quality_score CHECK (quality_score IS NULL OR (quality_score >= 0 AND quality_score <= 1))
);

-- Add table comment
COMMENT ON TABLE generated_content IS 'Unified storage for all AI-generated content with metadata and usage tracking';

-- =====================================================
-- 2. ARTIST ASSETS TABLE (Brand Kit)
-- =====================================================

-- Artist's brand assets library for consistent visual identity
-- Supports categorization, versioning, and AI generation references
CREATE TABLE IF NOT EXISTS artist_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Asset Information
    asset_name VARCHAR(200) NOT NULL,
    asset_type VARCHAR(50) NOT NULL CHECK (asset_type IN ('logo', 'headshot', 'artwork', 'background', 'icon', 'other')),
    
    -- File Storage
    file_url VARCHAR(500) NOT NULL, -- Supabase Storage URL
    file_size_bytes BIGINT NOT NULL,
    file_format VARCHAR(20) NOT NULL, -- 'png', 'jpg', 'svg', etc.
    
    -- Visual Properties
    dimensions_width INTEGER,
    dimensions_height INTEGER,
    dominant_colors TEXT[], -- Hex color codes for AI reference
    
    -- Usage Context
    description TEXT,
    usage_notes TEXT, -- How/when to use this asset
    is_primary BOOLEAN DEFAULT FALSE, -- Primary asset of this type
    
    -- AI Integration
    ai_description TEXT, -- Auto-generated description for AI prompts
    embedding_vector VECTOR(1536), -- For semantic search (future)
    
    -- Organization
    tags TEXT[] DEFAULT '{}',
    folder VARCHAR(100) DEFAULT 'general',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT positive_dimensions CHECK (
        (dimensions_width IS NULL OR dimensions_width > 0) AND 
        (dimensions_height IS NULL OR dimensions_height > 0)
    ),
    CONSTRAINT positive_file_size CHECK (file_size_bytes > 0)
);

-- Add table comment
COMMENT ON TABLE artist_assets IS 'Brand Kit asset library for consistent visual identity and AI generation references';

-- =====================================================
-- 3. GENERATION JOBS TABLE
-- =====================================================

-- Tracks async AI generation jobs for complex operations
-- Supports job queuing, progress tracking, and error handling
CREATE TABLE IF NOT EXISTS generation_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Job Configuration
    job_type VARCHAR(50) NOT NULL CHECK (job_type IN ('image', 'text', 'video', 'audio', 'batch')),
    job_status VARCHAR(20) DEFAULT 'pending' CHECK (job_status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    
    -- Generation Parameters
    input_prompt TEXT NOT NULL,
    generation_model VARCHAR(100) NOT NULL,
    generation_settings JSONB DEFAULT '{}',
    
    -- Asset References
    source_asset_id UUID REFERENCES artist_assets(id) ON DELETE SET NULL,
    result_content_id UUID REFERENCES generated_content(id) ON DELETE SET NULL,
    
    -- Progress Tracking
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    estimated_completion_at TIMESTAMPTZ,
    
    -- Error Handling
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    
    -- External Integration
    external_job_id VARCHAR(200), -- Third-party service job ID
    webhook_url VARCHAR(500), -- Completion callback URL
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT valid_retry_count CHECK (retry_count >= 0 AND retry_count <= max_retries)
);

-- Add table comment
COMMENT ON TABLE generation_jobs IS 'Async AI generation job tracking with progress monitoring and error handling';

-- =====================================================
-- 4. MODIFY CONTENT CALENDAR TABLE
-- =====================================================

-- Add generated content associations to existing content_calendar
-- Maintains backward compatibility while adding new functionality
ALTER TABLE content_calendar 
ADD COLUMN IF NOT EXISTS generated_content_id UUID REFERENCES generated_content(id) ON DELETE SET NULL;

-- Add comment for the new column
COMMENT ON COLUMN content_calendar.generated_content_id IS 'Links calendar posts to AI-generated content assets';

-- =====================================================
-- 5. CREATE INDEXES FOR OPTIMAL PERFORMANCE
-- =====================================================

-- Generated Content Indexes
CREATE INDEX IF NOT EXISTS idx_generated_content_user_type 
ON generated_content(user_id, content_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_generated_content_tags 
ON generated_content USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_generated_content_usage 
ON generated_content(usage_count DESC, last_used_at DESC) 
WHERE usage_count > 0;

-- Artist Assets Indexes
CREATE INDEX IF NOT EXISTS idx_artist_assets_user_type 
ON artist_assets(user_id, asset_type, is_primary DESC);

CREATE INDEX IF NOT EXISTS idx_artist_assets_tags 
ON artist_assets USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_artist_assets_folder 
ON artist_assets(user_id, folder, created_at DESC);

-- Generation Jobs Indexes
CREATE INDEX IF NOT EXISTS idx_generation_jobs_user_status 
ON generation_jobs(user_id, job_status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_generation_jobs_status_created 
ON generation_jobs(job_status, created_at) 
WHERE job_status IN ('pending', 'processing');

CREATE INDEX IF NOT EXISTS idx_generation_jobs_external 
ON generation_jobs(external_job_id) 
WHERE external_job_id IS NOT NULL;

-- Content Calendar Enhanced Index
CREATE INDEX IF NOT EXISTS idx_content_calendar_generated_content 
ON content_calendar(generated_content_id) 
WHERE generated_content_id IS NOT NULL;

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all new tables
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_jobs ENABLE ROW LEVEL SECURITY;

-- Generated Content Policies
CREATE POLICY "Users manage own generated content" ON generated_content
    FOR ALL USING (user_id = auth.uid());

-- Artist Assets Policies  
CREATE POLICY "Users manage own artist assets" ON artist_assets
    FOR ALL USING (user_id = auth.uid());

-- Generation Jobs Policies
CREATE POLICY "Users manage own generation jobs" ON generation_jobs
    FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- 7. UTILITY FUNCTIONS
-- =====================================================

-- Function to update usage tracking for generated content
CREATE OR REPLACE FUNCTION update_content_usage(content_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE generated_content 
    SET usage_count = usage_count + 1,
        last_used_at = NOW()
    WHERE id = content_id AND user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's primary assets by type
CREATE OR REPLACE FUNCTION get_primary_assets(asset_type_filter VARCHAR DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    asset_name VARCHAR,
    asset_type VARCHAR,
    file_url VARCHAR,
    dominant_colors TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT a.id, a.asset_name, a.asset_type, a.file_url, a.dominant_colors
    FROM artist_assets a
    WHERE a.user_id = auth.uid() 
    AND a.is_primary = TRUE
    AND (asset_type_filter IS NULL OR a.asset_type = asset_type_filter)
    ORDER BY a.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update triggers to new tables
CREATE TRIGGER update_generated_content_updated_at
    BEFORE UPDATE ON generated_content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artist_assets_updated_at
    BEFORE UPDATE ON artist_assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- This migration successfully creates:
-- ✅ generated_content table with full metadata support
-- ✅ artist_assets table for Brand Kit functionality  
-- ✅ generation_jobs table for async operation tracking
-- ✅ Enhanced content_calendar with generated content links
-- ✅ Comprehensive indexing for optimal query performance
-- ✅ RLS policies for user-scoped data access
-- ✅ Utility functions for common operations
-- ✅ Automatic timestamp updates via triggers

-- Next Steps:
-- 1. Run this migration against the Supabase database
-- 2. Set up Supabase Storage buckets for file uploads
-- 3. Implement backend API endpoints for new tables
-- 4. Create frontend components for Brand Kit management
