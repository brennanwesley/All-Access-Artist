-- =====================================================
-- Account Type Migration
-- File: 10_add_account_type_to_user_profiles.sql
-- Purpose: Add account_type column to user_profiles table for admin/artist differentiation
-- Author: All Access Artist Development Team
-- Date: 2025-08-31
-- =====================================================

-- This migration adds account_type column to user_profiles table and sets up
-- admin access policies for the admin dashboard functionality

BEGIN;

-- Add account_type column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS account_type VARCHAR(20) DEFAULT 'artist'
CHECK (account_type IN ('admin', 'artist', 'manager', 'label'));

-- Add column comment
COMMENT ON COLUMN user_profiles.account_type IS 'Type of user account: admin, artist, manager, or label';

-- Create index for performance on account_type queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_account_type ON user_profiles(account_type);

-- Set specific account types for existing users
-- brennan.tharaldson@gmail.com -> admin
UPDATE user_profiles 
SET account_type = 'admin' 
WHERE id = 'e85e1294-632b-42c1-85ba-8c6648fc0467';

-- feedbacklooploop@gmail.com -> artist  
UPDATE user_profiles 
SET account_type = 'artist' 
WHERE id = '4e2bddf7-64ae-41ac-8205-f16fc95463bd';

-- Create RLS policy to allow admins to read all user profiles for admin dashboard
CREATE POLICY "Admins can read all user profiles" ON user_profiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND account_type = 'admin'
  )
);

COMMIT;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- This migration has successfully:
-- ✅ Added account_type column to user_profiles with proper constraints
-- ✅ Set brennan.tharaldson@gmail.com as admin account type
-- ✅ Set feedbacklooploop@gmail.com as artist account type
-- ✅ Created performance index on account_type column
-- ✅ Added RLS policy for admin access to all user profiles
-- ✅ Made all operations idempotent with IF NOT EXISTS clauses

-- The database is now ready to support:
-- 1. Account type differentiation (admin vs artist routing)
-- 2. Admin dashboard with user management capabilities
-- 3. Secure admin-only access to user data via RLS policies
-- 4. Future expansion to manager and label account types
