# All Access Artist - Technical Improvement Plan
**CTO Review | January 4, 2026**

---

## Status Overview

| Category | Status | Notes |
|----------|--------|-------|
| Architecture | ✅ Solid | Modern stack, good patterns |
| Authentication | ✅ Secure | JWT + RLS + user-scoped clients |
| Database | ✅ Secure | RLS policies applied to all tables |
| Type Safety | ❌ Poor | 83+ `any` types |
| Testing | ❌ None | Zero test coverage |
| Observability | ❌ Poor | 339+ console.logs, no structured logging |

---

## Phase 1: Security Hardening (Week 1-2)

### ~~1.1 Missing RLS Policies~~
**Status**: ✅ Completed (Jan 4, 2026)

~~7 tables have RLS enabled but **no policies defined**:~~
- ~~`accounts`~~
- ~~`instagram_metrics` / `tiktok_metrics` / `twitter_metrics` / `youtube_metrics`~~
- ~~`n8n_error_logger`~~
- ~~`wrong_social_handle`~~

~~**Action**: Create user-scoped RLS policies for each table.~~

**Resolution**: Migration `add_missing_rls_policies` applied. Metrics tables have read-only access for authenticated users. System tables (`n8n_error_logger`, `wrong_social_handle`) restricted to service_role only.

---

### ~~1.2 Function Search Path Vulnerabilities~~
**Status**: ✅ Completed (Jan 4, 2026)

~~6 PostgreSQL functions have mutable search paths:~~
- ~~`audit_delete_trigger`~~
- ~~`generate_referral_code`~~
- ~~`update_content_usage`~~
- ~~`is_admin_user`~~
- ~~`get_primary_assets`~~
- ~~`update_updated_at_column`~~

~~**Action**: Add `SET search_path = public` to each function.~~

**Resolution**: Migration `fix_function_search_paths` applied. All 6 functions now have `SET search_path TO 'public'`. Verified triggers still attached and no application code dependencies broken.

---

### ~~1.3 Auth Configuration~~
**Status**: ✅ Completed (Jan 4, 2026)

| Issue | Status |
|-------|--------|
| ~~Leaked Password Protection~~ | ✅ Enabled |
| ~~OTP Expiry~~ | ✅ Reduced to <1 hour |
| ~~Postgres Version~~ | ✅ Upgraded to latest |

**Resolution**: Manual dashboard configuration completed. All three security settings updated via Supabase Dashboard.

---

### ~~1.4 Hardcoded Admin Bypass~~
**Status**: ✅ Completed (Jan 4, 2026)

~~**Location**: `backend/src/middleware/subscriptionAuth.ts:22-29`~~

~~```typescript
if (jwtPayload.email === 'brennan.tharaldson@gmail.com') { return next() }
if (jwtPayload.email === 'feedbacklooploop@gmail.com') { return next() }
```~~

~~**Action**: Move admin check to database (`account_type` column in `user_profiles`). Remove test user bypass.~~

**Resolution**: 
- Removed all hardcoded email bypasses from `subscriptionAuth.ts` (6 occurrences)
- Removed hardcoded email checks from `subscription.ts` (2 occurrences)
- Updated `is_admin_user()` PostgreSQL function to check `user_profiles.account_type` instead of JWT metadata
- Admin access now controlled by database `account_type = 'admin'` column
- Test user bypass removed - users must have real subscriptions

---

### ~~1.5 Subscription Middleware Not Applied~~
**Status**: ✅ Completed (Jan 4, 2026)

~~The `subscriptionAuth` middleware exists but is **not applied to any routes** in `worker.ts`.~~

~~**Action**: Apply to all mutation endpoints requiring active subscription.~~

**Resolution**:
- Applied `subscriptionAuth` middleware to 12 core product route groups in `worker.ts`
- Routes with subscription enforcement: artists, releases, calendar, analytics, lyrics, tasks, songs, labelcopy, splitsheets, assets, content, jobs
- Routes without subscription (auth-only): profile, admin, subscription, onboarding, webhooks, social
- Behavior: Expired users can read data (GET), but mutations (POST/PUT/PATCH/DELETE) require active subscription
- Admin users bypass subscription check via `account_type = 'admin'`

---

## Phase 2: Testing Foundation (Week 3-4)

### ~~2.1 Test Infrastructure~~
**Status**: ✅ Completed (Jan 5, 2026)

~~**Current**: `"test": "echo \"No tests specified\" && exit 0"`~~

**Stack**:
- Vitest (unit/integration) ✅ Installed and configured
- Playwright (E2E - future)

**Resolution**:
- Installed Vitest v2.1.9 with proper ES module configuration
- Created `vitest.config.ts` with globals, Node environment, coverage settings
- **91 tests passing** across 4 test files:
  - `setup.test.ts` - 5 tests (Vitest verification)
  - `schemas.test.ts` - 30 tests (Zod validation)
  - `subscriptionAuth.test.ts` - 34 tests (Phase 1 security logic)
  - `apiResponse.test.ts` - 22 tests (Response format standards)

**Test Scripts**:
- `npm test` - Run all tests once
- `npm run test:watch` - Watch mode
- `npm run test:coverage` - Coverage report

**Targets** (remaining):
- ~~70% backend services coverage~~ Started
- 50% frontend hooks coverage (future)
- ~~CI blocks deploy on test failure~~ ✅ GitHub Actions configured

---

## Phase 3: Type Safety (Week 5-6)

### ~~3.1 Eliminate `any` Types~~
**Status**: ✅ Significant Progress (Jan 5, 2026) | **Remaining**: 11 instances (from 31)

**Resolution**:
- Created `frontend/src/types/api.ts` - 582 lines of centralized type definitions
- Updated `frontend/src/lib/api.ts` - Replaced 17 `any` types with proper interfaces
- Updated hooks: `useReleases.ts`, `useProfile.ts`, `useAdmin.ts`, `useSocialMedia.ts`
- All API methods now have proper input/output types
- **65% reduction** in frontend `any` types

**Remaining `any` types** (11 instances in 6 files):
- `AuthContext.tsx` - 3 instances (Supabase auth types)
- `MetadataPrep.tsx` - 2 instances (form handling)
- `ContributorRow.tsx` - 2 instances (split sheet)
- `useUpdateTask.ts` - 2 instances (cache update)
- `useContributors.ts` - 1 instance
- `useReleaseDetails.ts` - 1 instance

**Future Action**:
- Enable ESLint rule: `@typescript-eslint/no-explicit-any: error`

---

### ~~3.2 Database Types Out of Sync~~
**Status**: ✅ Complete (Jan 7, 2026)

**Resolution**:
- Auto-generated types from Supabase schema using MCP tool
- Updated `backend/src/types/database.ts` from 132 lines to 1,540 lines
- Now covers **24 tables** (was 3 tables)
- Added convenience type aliases for common tables (MusicRelease, ReleaseTask, etc.)
- Removed `any` types (lyric_sheets.structure now uses `Json` type)
- Fixed table name: `releases` → `music_releases`

**Tables Now Typed**:
- Core: `music_releases`, `release_tasks`, `songs`, `lyric_sheets`, `artist_profiles`, `user_profiles`
- Subscriptions: `subscriptions`, `referrals`
- Split Sheets: `split_sheets`, `split_sheet_contributors`
- Content: `content_calendar`, `label_copy`, `generated_content`, `generation_jobs`
- Analytics: `fan_analytics`, `royalty_data`, `instagram_metrics`, `tiktok_metrics`, `twitter_metrics`, `youtube_metrics`
- Assets: `artist_assets`
- System: `audit_log`, `accounts`, `n8n_error_logger`, `wrong_social_handle`

**To Regenerate**: Use Supabase MCP `generate_typescript_types` tool

---

## Phase 4: Observability (Week 7-8)

### ~~4.1 Structured Logging~~
**Status**: ✅ Foundation Complete (Jan 7, 2026) | **Remaining**: 398 console.logs (from 485)

**Resolution**:
- Created `backend/src/utils/logger.ts` - Custom structured logger utility
- Features: Log levels (debug/info/warn/error), child loggers, request context, error extraction
- Environment-aware: debug in development, info in production
- Updated core files:
  - `auth.ts` - 26 console.logs replaced
  - `adminAuth.ts` - 12 console.logs replaced
  - `subscriptionAuth.ts` - 5 console.logs replaced
  - `server.ts` - 4 console.logs replaced
  - `worker.ts` - 1 console.log replaced
  - `profileService.ts` - 11 console.logs replaced
  - `releasesService.ts` - 30 console.logs replaced
  - `errorHandler.ts` - 3 console.logs replaced

**Remaining Work** (can be done incrementally):
- `assetService.ts` (60), `generationJobService.ts` (49), `contentService.ts` (48)
- Route files: `releases.ts` (32), `lyrics.ts` (23), `splitsheets.ts` (18)

---

### ~~4.2 Audit Log Table~~
**Status**: ✅ Already Exists (Jan 7, 2026)

**Resolution**:
- Verified `audit_log` table exists in Supabase with proper schema
- Columns: `id`, `table_name`, `operation`, `record_id`, `old_data`, `user_id`, `user_email`, `timestamp`, `ip_address`, `user_agent`
- Already typed in `database.ts` (auto-generated)
- `ReleasesService.logDeletionAsync()` correctly uses this table

---

## Phase 5: Infrastructure (Week 9-10)

### ~~5.1 Rate Limiting Storage~~
**Status**: ✅ Complete (Jan 7, 2026)

**Resolution**:
- Created `rate_limits` table in Supabase with atomic increment function
- Implemented `increment_rate_limit()` PostgreSQL RPC for thread-safe operations
- Added `cleanup_expired_rate_limits()` function for maintenance
- Updated `rateLimit.ts` middleware to use Supabase with in-memory fallback
- Added structured logging for rate limit operations

**Features**:
- Persists across deployments
- Works with multiple instances (shared database)
- Automatic cleanup of expired entries
- Graceful fallback to in-memory if DB unavailable
- Per-user (100 req/min) and global (1000 req/min) limits

---

### ~~5.2 Pre-commit Hooks~~
**Status**: ✅ Complete (Jan 7, 2026)

**Resolution**:
- Installed Husky v9.1.7 for Git hooks management
- Installed lint-staged v16.2.7 for staged file processing
- Configured `.husky/pre-commit` to run lint-staged

**Pre-commit Checks**:
- Frontend (`*.ts`, `*.tsx`): ESLint with `--fix --max-warnings=0`
- Backend (`*.ts`): TypeScript compilation check (`tsc --noEmit`)

**New Scripts Added**:
- `npm run typecheck` - Full project type checking
- `npm run typecheck:frontend` - Frontend only
- `npm run typecheck:backend` - Backend only
- `npm run lint:backend` - Backend linting

---

## Backlog (Prioritize Based on Demand)

| Item | Effort | Notes |
|------|--------|-------|
| File upload (Supabase Storage) | 1 week | Cover art, press photos |
| Database indexes optimization | 2-3 days | Analyze slow queries first |
| Redis caching layer | 1 week | For read-heavy operations |
| Bundle size optimization | 1 week | Target <500KB gzipped |
| Documentation consolidation | 3-4 days | 13 README files → single docs/ |

---

## Unused/Empty Tables

| Table | Status | Action |
|-------|--------|--------|
| `royalty_data` | Empty | Future feature |
| `fan_analytics` | Empty | Future feature |
| `content_calendar` | Empty | Limited implementation |
| `generated_content` | Empty | AI feature not implemented |
| `generation_jobs` | Empty | AI job queue not implemented |

---

## Progress Tracking

### Phase 1: Security
- [x] 1.1 RLS policies for 7 tables ✅
- [x] 1.2 Fix 6 function search paths ✅
- [x] 1.3 Update auth settings + Postgres ✅
- [x] 1.4 Remove hardcoded admin bypass ✅
- [x] 1.5 Apply subscription middleware ✅

### Phase 2: Testing
- [x] 2.1 Set up Vitest ✅
- [x] 2.1 Add backend service tests (91 tests) ✅
- [x] 2.1 Configure CI test enforcement ✅

### Phase 3: Type Safety
- [x] 3.1 Create centralized types file ✅
- [x] 3.1 Fix api.ts (17 'any' removed) ✅
- [x] 3.1 Fix hooks (65% reduction) ✅
- [x] 3.2 Update database.ts (24 tables, 1540 lines) ✅

### Phase 4: Observability
- [x] 4.1 Create logger utility ✅
- [x] 4.1 Update core files (87 console.logs replaced) ✅
- [x] 4.2 Verify audit_log table exists ✅
- [ ] 4.1 Replace remaining console.logs (398 remaining)

### Phase 5: Infrastructure
- [x] 5.1 Supabase rate limiting (persistent) ✅
- [x] 5.2 Husky + lint-staged ✅

---

**Last Updated**: January 5, 2026  
**Next Review**: After Phase 2 CI integration
