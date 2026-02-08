#+#+#+#+
# All Access Artist — Critical Issues & Prioritized Roadmap (02/07/26)

This document converts the full‑stack review findings into an **incremental, prioritized action plan**. Each item includes **why it matters** and **success criteria** so you can work through improvements methodically.

## Priority Legend
- **P0 (Immediate)**: Security or data‑integrity risk, must fix before growth.
- **P1 (Near‑Term)**: Performance or scale risk that will bite at 10k+ users.
- **P2 (Mid‑Term)**: Reliability, consistency, and developer velocity.
- **P3 (Later)**: Operational polish and long‑term resilience.

---

## P0 — Security & Access Control (Do First)

1) **Fix mutable `search_path` in DB functions**
   - **Why**: Functions with a mutable `search_path` can be hijacked by malicious objects and are a documented security risk.
   - **Where**: Supabase lints flagged `increment_rate_limit` and `cleanup_expired_rate_limits`.
   - **Action**: `ALTER FUNCTION ... SET search_path = public, pg_temp;` for each function.
   - **Done when**: Supabase security linter no longer reports `function_search_path_mutable`.

2) **Lock down `rate_limits` RLS policy**
   - **Why**: Current policy is effectively `USING (true)` + `WITH CHECK (true)` which bypasses RLS.
   - **Action**: Replace permissive policy with service‑role‑only access. Remove public access entirely.
   - **Done when**: Supabase linter no longer reports permissive RLS on `rate_limits`.

3) **Remove service‑role usage in non‑admin services**
   - **Why**: `AnalyticsService` uses `SUPABASE_SERVICE_KEY`, bypassing RLS. This violates Zero‑Trust requirements and can leak cross‑tenant data.
   - **Action**: Use the user‑scoped Supabase client from middleware for all user operations.
   - **Done when**: All user‑facing services operate under RLS and never require the service key.

4) **Harden environment configuration in production**
   - **Why**: Frontend falls back to placeholder Supabase credentials, which can create silent failures in production and security ambiguity.
   - **Action**: Fail fast in production builds if required env vars are missing.
   - **Done when**: Build/deploy fails if `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` are not set.

---

## P1 — Database Performance at Scale

1) **Add indexes for all unindexed foreign keys**
   - **Why**: Missing FK indexes will cause slow joins and deletes at scale.
   - **Where**: Supabase lints flagged `generation_jobs`, `lyric_sheets`, `lyric_sheet_sections`, `music_releases`, `release_tasks`.
   - **Action**: Create covering indexes on each FK column.
   - **Done when**: Supabase performance lints for `unindexed_foreign_keys` are cleared.

2) **Consolidate duplicate permissive RLS policies**
   - **Why**: Multiple permissive policies add overhead to every query and complicate security reasoning.
   - **Action**: Merge policies per table/action where possible.
   - **Done when**: Supabase lints for `multiple_permissive_policies` are cleared.

3) **Fix RLS init‑plan warnings**
   - **Why**: `auth.uid()` evaluated per‑row is slow at scale.
   - **Action**: Replace `auth.uid()` with `(select auth.uid())` in policies flagged by lint.
   - **Done when**: Supabase `auth_rls_initplan` lints are cleared.

4) **Remove duplicate indexes**
   - **Why**: Duplicate indexes waste storage and slow writes.
   - **Where**: `royalty_data` has duplicate indexes.
   - **Done when**: Supabase `duplicate_index` lint is cleared.

---

## P2 — Backend Reliability & Consistency

1) **Standardize error responses across all routes**
   - **Why**: Inconsistent error shapes lead to brittle UI error handling.
   - **Action**: Ensure all endpoints return `{ success: false, error: { message, code? } }` consistently.
   - **Done when**: Every route uses shared error handler utilities or uniform shape.

2) **Reduce verbose debug logging in production**
   - **Why**: Logs in `releases.ts` and `profile.ts` include sensitive data and create compliance risk.
   - **Action**: Gate debug logs behind `NODE_ENV === 'development'` and sanitize PII.
   - **Done when**: Production logs contain no raw user payloads or tokens.

3) **Enforce strict TypeScript (no `any`) in services**
   - **Why**: `AnalyticsService` uses `any`, which violates code standards and undermines type safety.
   - **Action**: Add explicit types for analytics payloads and service fields.
   - **Done when**: All services pass strict TS without `any`.

4) **Unify validation strategy**
   - **Why**: Some routes use `zValidator`, others parse manually; this creates inconsistent errors.
   - **Action**: Use `zValidator` consistently or wrap manual parsing with shared handlers.
   - **Done when**: Validation errors are uniform and typed everywhere.

---

## P3 — Frontend Robustness & Data Consistency

1) **Graceful handling for missing auth sessions**
   - **Why**: `apiClient` throws if the session is missing; this can cascade into broken UI.
   - **Action**: Return 401 response objects and let UI handle redirection or login prompts.
   - **Done when**: Auth expiration doesn’t crash API calls.

2) **Align frontend types with backend contracts**
   - **Why**: Manual types drift from backend schemas over time.
   - **Action**: Generate Supabase types and/or share Zod schemas with the frontend.
   - **Done when**: API types are generated or shared, not hand‑maintained.

3) **Centralize error mapping for UI**
   - **Why**: Different components display different error formats.
   - **Action**: Use a single error extraction utility (e.g., `extractErrorMessage`) across hooks.
   - **Done when**: UI error presentation is consistent across pages.

---

## P4 — Observability & Operational Discipline

1) **Add error monitoring (Sentry or similar)**
   - **Why**: You need real‑world visibility into crashes at scale.
   - **Action**: Capture API + UI errors, include request IDs and user IDs.
   - **Done when**: Production errors appear with traceable context.

2) **Add performance monitoring for slow queries**
   - **Why**: Query bottlenecks will emerge as data grows.
   - **Action**: Enable `pg_stat_statements` and monitor top queries.
   - **Done when**: Slow query dashboards exist and are reviewed weekly.

---

## P5 — Long‑Term Scalability & Maintenance

1) **Introduce formal API contract tests**
   - **Why**: Prevent accidental backend changes from breaking the frontend.
   - **Action**: Add contract tests for critical endpoints (releases, profile, subscription).
   - **Done when**: CI fails on breaking contract changes.

2) **Data lifecycle policies for analytics/metrics**
   - **Why**: Metrics tables grow fast; uncontrolled growth will degrade performance.
   - **Action**: Retention policies, partitioning, or archival strategy.
   - **Done when**: Storage growth is bounded and documented.

3) **Formal incident playbook**
   - **Why**: With scale, you need a known response path for outages.
   - **Action**: Define escalation, rollback procedures, and on‑call alerts.
   - **Done when**: Incident process documented and tested.

---

## Suggested Execution Order (Incremental)
1) P0‑1 → P0‑2 → P0‑3 → P0‑4 → P0‑5
2) P1 DB items (indexes + RLS consolidation + init‑plan)
3) P1 backend consistency (errors + logging + strict TS)
4) P2 frontend robustness
5) P2 observability
6) P3 long‑term scale work

---

If you want, I can now turn each priority into a tracked task list with estimates and owners.
