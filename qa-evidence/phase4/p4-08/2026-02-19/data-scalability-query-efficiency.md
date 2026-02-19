# P4-08 Data Scalability + Query Efficiency

- Date (UTC): 2026-02-19
- Scope: Query hotspot review, SQL-first aggregation refactor, index coverage validation, and before/after efficiency comparison
- Tester: Cascade (assisted)
- Environment: local build/test validation + Supabase SQL `EXPLAIN`/catalog inspection

## 1) Hotspot identification (priority API workflows)

### Hotspot A: `/api/admin/users` (AdminService.getAllUsers)
- Previous behavior: fetched all `user_profiles`, then executed `auth.admin.getUserById` once per profile (N+1 external auth calls).
- Scalability risk: request latency grows linearly with user count and creates high external request fan-out.

### Hotspot B: `/api/admin/stats` (AdminService.getSystemStats)
- Previous behavior: fetched all `user_profiles.account_type` rows, then performed account-type counts in worker memory.
- Scalability risk: avoidable row materialization in worker memory and unnecessary payload transfer.

## 2) Implemented remediations

### A. Removed auth N+1 for admin user listing
- File: `backend/src/services/adminService.ts`
- Change:
  - Replaced per-user `getUserById` loop with paginated `auth.admin.listUsers({ page, perPage })`.
  - Added `getAuthEmailMap()` to build an ID→email map from batched pages.
- Effect:
  - Remote auth calls reduced from `O(N)` to `O(ceil(N / 200))`.

### B. Pushed admin stats aggregation to SQL count queries
- File: `backend/src/services/adminService.ts`
- Change:
  - Replaced in-memory account-type filtering with SQL count queries (`head: true`) for:
    - total users
    - admin/artist/manager/label counts
  - Switched release/task totals to SQL count queries against actual tables:
    - `music_releases`
    - `release_tasks`
- Effect:
  - Aggregation now executed at database boundary.
  - Worker no longer needs full `user_profiles` row payload for this endpoint.

### C. Added growth-focused index migration
- File: `database/migrations/13_phase4_query_efficiency_indexes.sql`
- Added indexes:
  - `idx_music_releases_user_id_release_date_desc`
  - `idx_user_profiles_created_at_desc`
- Purpose:
  - Support user-scoped ordered release listing and admin ordered user list as row counts scale.

## 3) Query plan and index coverage validation

### Existing index inventory check
Inspected `pg_indexes` for `user_profiles`, `music_releases`, and `release_tasks`.

Key confirmed indexes already present:
- `idx_music_releases_user_id`
- `idx_release_tasks_user_id`
- `idx_user_profiles_account_type`

### `EXPLAIN` findings
1. `release_tasks` user-filtered ordered query used **Index Scan** on `idx_release_tasks_user_id` (with in-memory sort for ordering by `task_order`).
2. `music_releases` user-filtered ordered query used **Seq Scan + Sort** at current low cardinality (97 rows), which is expected for small tables.
3. `user_profiles` count/filter queries currently use **Seq Scan** due tiny table size (5 rows); account-type index coverage remains in place for growth.

## 4) Before/after timing + memory pressure comparison

### Admin user listing call fan-out
Using current production row count (`user_profiles = 5`):
- Before: `1 profile query + 5 auth getUserById` = **6 network calls**
- After: `1 profile query + 1 paginated listUsers` = **2 network calls**
- Reduction: **66.7% fewer external calls**

Projected at 2,000 users:
- Before: 2,001 calls
- After: 11 calls (`1 + ceil(2000/200)`)
- Reduction: **99.45% fewer external calls**

### Admin stats memory profile
- Before: loaded full `user_profiles.account_type` rowset into worker memory, then filtered in JS.
- After: SQL `count` queries with `head: true` return counts without row payload.
- Worker-memory implication: **row payload from `O(N)` to `O(1)` for account-type aggregation path**.

## 5) Automated regression coverage

Added: `backend/src/__tests__/dataScalabilityQueryEfficiency.test.ts`

Covers:
1. N+1 removal (`listUsers` used, `getUserById` not called).
2. Pagination behavior for auth user lookup.
3. SQL-count aggregation output for admin stats with `music_releases` and `release_tasks` totals.

## 6) Validation gates

- `npm run build --workspace frontend` -> PASS
- `npx tsc --noEmit --project frontend/tsconfig.json` -> PASS
- `npm run typecheck:backend` -> PASS
- `npm run test --workspace backend` -> PASS (103 tests)

## Conclusion

P4-08 goals are satisfied for this implementation chunk:
- query hotspots were identified in active admin API workflows,
- heavy filtering/aggregation was moved to SQL count operations,
- index coverage/query plans were reviewed and documented,
- before/after latency pressure and worker memory behavior were compared with concrete call-count and payload-shape deltas,
- regression tests and validation gates passed.
