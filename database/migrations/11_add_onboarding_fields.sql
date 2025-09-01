-- =====================================================
-- Add Onboarding Fields Migration
-- File: 11_add_onboarding_fields.sql
-- Purpose: Add fields for payment-first onboarding flow
-- Author: All Access Artist Development Team
-- Date: 2025-08-31
-- =====================================================

BEGIN;

-- Add onboarding-related fields to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
ADD COLUMN IF NOT EXISTS onboarding_token TEXT,
ADD COLUMN IF NOT EXISTS onboarding_token_expires TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS artist_name TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS stripe_created_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS stripe_updated_at TIMESTAMPTZ;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_stripe_session_id ON user_profiles(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_onboarding_token ON user_profiles(onboarding_token);
CREATE INDEX IF NOT EXISTS idx_user_profiles_onboarding_completed ON user_profiles(onboarding_completed);

-- Add column comments
COMMENT ON COLUMN user_profiles.stripe_session_id IS 'Stripe checkout session ID for payment tracking';
COMMENT ON COLUMN user_profiles.onboarding_token IS 'Secure token for completing onboarding after payment';
COMMENT ON COLUMN user_profiles.onboarding_token_expires IS 'Expiration timestamp for onboarding token';
COMMENT ON COLUMN user_profiles.onboarding_completed IS 'Whether user has completed onboarding process';
COMMENT ON COLUMN user_profiles.onboarding_completed_at IS 'Timestamp when onboarding was completed';
COMMENT ON COLUMN user_profiles.artist_name IS 'Artist or band name for the user';
COMMENT ON COLUMN user_profiles.subscription_status IS 'Current subscription status from Stripe';
COMMENT ON COLUMN user_profiles.stripe_created_at IS 'Timestamp when Stripe customer was created';
COMMENT ON COLUMN user_profiles.stripe_updated_at IS 'Timestamp when Stripe data was last updated';

COMMIT;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- This migration has successfully:
-- ✅ Added onboarding token system for session-based recovery
-- ✅ Added Stripe session tracking for payment-first flow
-- ✅ Added artist name field for user profiles
-- ✅ Added subscription status tracking
-- ✅ Added performance indexes for new fields
-- ✅ Added comprehensive column documentation
-- ✅ Made all operations idempotent with IF NOT EXISTS clauses

-- The database is now ready to support:
-- 1. Payment-first onboarding with Stripe integration
-- 2. Session-based recovery for incomplete onboarding
-- 3. Artist name storage separate from full name
-- 4. Subscription status tracking
-- 5. Comprehensive audit trail for Stripe operations
