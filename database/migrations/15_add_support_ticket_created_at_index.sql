-- =====================================================
-- Support Tickets Performance Index Migration
-- File: 15_add_support_ticket_created_at_index.sql
-- Purpose: Optimize admin recent-ticket lookups for support tickets
-- Author: All Access Artist Development Team
-- Date: 2026-03-25
-- =====================================================

BEGIN;

-- Supports: GET /api/support/admin/overview recent ticket ordering
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at_desc
    ON support_tickets(created_at DESC);

COMMIT;
