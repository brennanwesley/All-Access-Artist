-- =====================================================
-- Phase 4-08 Query Efficiency Indexes
-- File: 13_phase4_query_efficiency_indexes.sql
-- Purpose: Add high-impact indexes for user-scoped ordered API workflows
-- Author: All Access Artist Development Team
-- Date: 2026-02-19
-- =====================================================

BEGIN;

-- Supports: GET /api/releases (user-scoped list ordered by release_date desc)
CREATE INDEX IF NOT EXISTS idx_music_releases_user_id_release_date_desc
ON music_releases(user_id, release_date DESC);

-- Supports: GET /api/admin/users (ordered admin dashboard user list)
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at_desc
ON user_profiles(created_at DESC);

COMMIT;
