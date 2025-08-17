-- =====================================================
-- All Access Artist - Performance Index Migration
-- =====================================================
-- Purpose: Add essential indexes for foreign keys and frequently queried columns
-- Author: Database Performance Specialist
-- Date: August 8, 2025
-- Version: 1.0
-- 
-- This migration is idempotent and can be run multiple times safely.
-- All indexes use the naming convention: idx_{table_name}_{column_name}
-- =====================================================

-- Begin transaction for atomic execution
BEGIN;

-- =====================================================
-- ARTIST_PROFILES TABLE INDEXES
-- =====================================================

-- Index on user_id (foreign key to auth.users)
-- Critical for user authentication and profile lookups
CREATE INDEX IF NOT EXISTS idx_artist_profiles_user_id 
ON artist_profiles(user_id);

-- Index on is_public for filtering public profiles
CREATE INDEX IF NOT EXISTS idx_artist_profiles_is_public 
ON artist_profiles(is_public);

-- Index on genre for filtering artists by genre
CREATE INDEX IF NOT EXISTS idx_artist_profiles_genre 
ON artist_profiles(genre);

-- =====================================================
-- MUSIC_RELEASES TABLE INDEXES
-- =====================================================

-- Index on artist_id (foreign key to artist_profiles)
-- Essential for fetching all releases for a specific artist
CREATE INDEX IF NOT EXISTS idx_music_releases_artist_id 
ON music_releases(artist_id);

-- Index on status for filtering by release status (draft/scheduled/released)
-- Critical for dashboard views and public release listings
CREATE INDEX IF NOT EXISTS idx_music_releases_status 
ON music_releases(status);

-- Index on release_type for filtering by single/album/EP
-- Important for categorizing and filtering releases
CREATE INDEX IF NOT EXISTS idx_music_releases_release_type 
ON music_releases(release_type);

-- Index on release_date for chronological sorting and date-based queries
CREATE INDEX IF NOT EXISTS idx_music_releases_release_date 
ON music_releases(release_date);

-- Composite index on (artist_id, status) for artist-specific status filtering
-- Optimizes queries like "get all released tracks for this artist"
CREATE INDEX IF NOT EXISTS idx_music_releases_artist_id_status 
ON music_releases(artist_id, status);

-- =====================================================
-- ROYALTY_DATA TABLE INDEXES
-- =====================================================

-- Index on artist_id (foreign key to artist_profiles)
-- Essential for fetching royalty data for a specific artist
CREATE INDEX IF NOT EXISTS idx_royalty_data_artist_id 
ON royalty_data(artist_id);

-- Index on release_id (foreign key to music_releases)
-- Important for release-specific royalty analysis
CREATE INDEX IF NOT EXISTS idx_royalty_data_release_id 
ON royalty_data(release_id);

-- Index on platform for filtering by streaming service
-- Critical for platform-specific royalty reports
CREATE INDEX IF NOT EXISTS idx_royalty_data_platform 
ON royalty_data(platform);

-- Index on country_code for geographic royalty analysis
CREATE INDEX IF NOT EXISTS idx_royalty_data_country_code 
ON royalty_data(country_code);

-- Composite index on (artist_id, period_start, period_end) for date range queries
-- Optimizes time-based royalty reporting
CREATE INDEX IF NOT EXISTS idx_royalty_data_artist_id_period 
ON royalty_data(artist_id, period_start, period_end);

-- =====================================================
-- CONTENT_CALENDAR TABLE INDEXES
-- =====================================================

-- Index on artist_id (foreign key to artist_profiles)
-- Essential for fetching content calendar for a specific artist
CREATE INDEX IF NOT EXISTS idx_content_calendar_artist_id 
ON content_calendar(artist_id);

-- Index on status for filtering by content status (draft/scheduled/published)
-- Critical for content management workflows
CREATE INDEX IF NOT EXISTS idx_content_calendar_status 
ON content_calendar(status);

-- Index on platform for filtering by social media platform
-- Important for platform-specific content management
CREATE INDEX IF NOT EXISTS idx_content_calendar_platform 
ON content_calendar(platform);

-- Index on scheduled_date for chronological sorting and date-based queries
CREATE INDEX IF NOT EXISTS idx_content_calendar_scheduled_date 
ON content_calendar(scheduled_date);

-- Composite index on (artist_id, scheduled_date) for artist-specific calendar views
-- Optimizes queries like "get all content scheduled for this artist this week"
CREATE INDEX IF NOT EXISTS idx_content_calendar_artist_id_scheduled_date 
ON content_calendar(artist_id, scheduled_date);

-- Composite index on (artist_id, status) for artist-specific status filtering
CREATE INDEX IF NOT EXISTS idx_content_calendar_artist_id_status 
ON content_calendar(artist_id, status);

-- =====================================================
-- FAN_ANALYTICS TABLE INDEXES
-- =====================================================

-- Index on artist_id (foreign key to artist_profiles)
-- Essential for fetching analytics for a specific artist
CREATE INDEX IF NOT EXISTS idx_fan_analytics_artist_id 
ON fan_analytics(artist_id);

-- Index on platform for filtering by analytics platform
-- Critical for platform-specific analytics reports
CREATE INDEX IF NOT EXISTS idx_fan_analytics_platform 
ON fan_analytics(platform);

-- Composite index on (artist_id, period_start, period_end) for date range queries
-- Optimizes time-based analytics reporting
CREATE INDEX IF NOT EXISTS idx_fan_analytics_artist_id_period 
ON fan_analytics(artist_id, period_start, period_end);

-- Composite index on (artist_id, platform) for artist-platform specific queries
-- Optimizes queries like "get Spotify analytics for this artist"
CREATE INDEX IF NOT EXISTS idx_fan_analytics_artist_id_platform 
ON fan_analytics(artist_id, platform);

-- =====================================================
-- COMMIT TRANSACTION
-- =====================================================

-- Commit all index creations atomically
COMMIT;

-- =====================================================
-- VERIFICATION QUERIES (Optional - for testing)
-- =====================================================
-- Uncomment the following queries to verify index creation:

-- SELECT schemaname, tablename, indexname, indexdef 
-- FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- AND indexname LIKE 'idx_%'
-- ORDER BY tablename, indexname;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Total indexes created: 20
-- - artist_profiles: 3 indexes
-- - music_releases: 5 indexes  
-- - royalty_data: 5 indexes
-- - content_calendar: 6 indexes
-- - fan_analytics: 4 indexes
-- 
-- Performance improvements expected:
-- - Faster JOIN operations on foreign keys
-- - Accelerated filtering by status, platform, type
-- - Optimized date range queries
-- - Enhanced artist-specific data retrieval
-- =====================================================
