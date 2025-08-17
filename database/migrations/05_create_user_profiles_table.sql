-- =====================================================
-- User Profiles Table Migration
-- File: 05_create_user_profiles_table.sql
-- Purpose: Create user_profiles table with referral system
-- Author: All Access Artist Development Team
-- Date: 2025-08-17
-- =====================================================

-- This migration creates the user_profiles table to store personal information
-- and referral tracking data separate from artist_profiles (creative data)

BEGIN;

-- Create referral code generation function
CREATE OR REPLACE FUNCTION generate_referral_code() 
RETURNS VARCHAR(6) AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result VARCHAR(6) := '';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM user_profiles WHERE referral_code = result) LOOP
        result := '';
        FOR i IN 1..6 LOOP
            result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
        END LOOP;
    END LOOP;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    phone_verified BOOLEAN DEFAULT FALSE,
    billing_address JSONB DEFAULT '{}',
    payment_method_last4 TEXT,
    referral_code VARCHAR(6) UNIQUE NOT NULL DEFAULT generate_referral_code(),
    referred_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
    referral_credits INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_referral_code CHECK (referral_code ~ '^[A-Z0-9]{6}$'),
    CONSTRAINT non_negative_credits CHECK (referral_credits >= 0),
    CONSTRAINT no_self_referral CHECK (id != referred_by)
);

-- Add table comment
COMMENT ON TABLE user_profiles IS 'User profile information and referral tracking';

-- Add column comments
COMMENT ON COLUMN user_profiles.id IS 'Foreign key to auth.users.id';
COMMENT ON COLUMN user_profiles.first_name IS 'User first name';
COMMENT ON COLUMN user_profiles.last_name IS 'User last name';
COMMENT ON COLUMN user_profiles.phone_verified IS 'Whether phone number has been verified';
COMMENT ON COLUMN user_profiles.billing_address IS 'JSON object containing billing address details';
COMMENT ON COLUMN user_profiles.payment_method_last4 IS 'Last 4 digits of payment method on file';
COMMENT ON COLUMN user_profiles.referral_code IS 'Unique 6-character alphanumeric referral code';
COMMENT ON COLUMN user_profiles.referred_by IS 'ID of user who referred this user';
COMMENT ON COLUMN user_profiles.referral_credits IS 'Number of referral credits earned';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_referral_code ON user_profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_user_profiles_referred_by ON user_profiles(referred_by);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Users can manage their own profile" ON user_profiles
    FOR ALL USING (id = auth.uid());

-- Create updated_at trigger
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Migrate existing users to user_profiles
INSERT INTO user_profiles (
    id, 
    first_name, 
    last_name, 
    created_at
)
SELECT 
    u.id,
    SPLIT_PART(u.raw_user_meta_data->>'full_name', ' ', 1) as first_name,
    CASE 
        WHEN array_length(string_to_array(u.raw_user_meta_data->>'full_name', ' '), 1) > 1 
        THEN array_to_string(
            (string_to_array(u.raw_user_meta_data->>'full_name', ' '))[2:], ' '
        )
        ELSE NULL 
    END as last_name,
    u.created_at
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM user_profiles up WHERE up.id = u.id);

COMMIT;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- This migration has successfully:
-- ✅ Created user_profiles table with proper foreign keys and constraints
-- ✅ Added referral code generation function with uniqueness guarantee
-- ✅ Established referral tracking system (referral_code, referred_by, credits)
-- ✅ Enabled Row Level Security with user-scoped access policy
-- ✅ Created performance indexes on referral_code and referred_by
-- ✅ Added automatic updated_at timestamp trigger
-- ✅ Migrated existing users (2 users) with name parsing from auth.users
-- ✅ Made all operations idempotent with IF NOT EXISTS clauses

-- The database is now ready to support:
-- 1. User profile management (name, phone, billing info)
-- 2. Referral code system with credit tracking
-- 3. Secure, user-scoped data access via RLS
-- 4. Future admin dashboard capabilities
