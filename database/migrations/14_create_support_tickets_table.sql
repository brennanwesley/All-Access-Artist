-- =====================================================
-- Support Tickets Table Migration
-- File: 14_create_support_tickets_table.sql
-- Purpose: Store user support requests for admin tracking and resolution
-- Author: All Access Artist Development Team
-- Date: 2026-03-25
-- =====================================================

BEGIN;

CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('billing', 'onboarding', 'technical', 'feature_request', 'account', 'other')),
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(30) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_on_user', 'resolved', 'closed')),
    description TEXT NOT NULL,
    admin_notes TEXT,
    resolved_at TIMESTAMPTZ,
    last_response_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT support_ticket_subject_length CHECK (char_length(subject) BETWEEN 3 AND 150),
    CONSTRAINT support_ticket_description_length CHECK (char_length(description) BETWEEN 10 AND 4000)
);

COMMENT ON TABLE support_tickets IS 'Support requests submitted by users and tracked by admins';
COMMENT ON COLUMN support_tickets.user_id IS 'Owner of the support ticket';
COMMENT ON COLUMN support_tickets.subject IS 'Short support ticket subject';
COMMENT ON COLUMN support_tickets.category IS 'Support category for routing and tracking';
COMMENT ON COLUMN support_tickets.priority IS 'Support priority level';
COMMENT ON COLUMN support_tickets.status IS 'Current support ticket status';
COMMENT ON COLUMN support_tickets.description IS 'Detailed user description of the issue';
COMMENT ON COLUMN support_tickets.admin_notes IS 'Internal notes from support staff';

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id_created_at_desc
    ON support_tickets(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_support_tickets_status_created_at_desc
    ON support_tickets(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_support_tickets_priority_created_at_desc
    ON support_tickets(priority, created_at DESC);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own support tickets" ON support_tickets
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own support tickets" ON support_tickets
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
