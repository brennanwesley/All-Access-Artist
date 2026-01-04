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

### 2.1 Test Infrastructure
**Status**: ❌ Not Started

**Current**: `"test": "echo \"No tests specified\" && exit 0"`

**Stack**:
- Vitest (unit/integration)
- Playwright (E2E - future)

**Targets**:
- 70% backend services coverage
- 50% frontend hooks coverage
- CI blocks deploy on test failure

---

## Phase 3: Type Safety (Week 5-6)

### 3.1 Eliminate `any` Types
**Status**: ❌ Not Started | **Count**: 83+ instances

**Priority Files**:
- `frontend/src/lib/api.ts` - 42 instances
- `frontend/src/hooks/api/*.ts` - Multiple hooks

**Action**:
1. Generate types from Supabase: `supabase gen types typescript`
2. Replace all `any` with proper interfaces
3. Enable ESLint rule: `@typescript-eslint/no-explicit-any: error`

---

### 3.2 Database Types Out of Sync
**Status**: ❌ Not Started

`backend/src/types/database.ts` only defines 3 tables but database has 20+.

**Action**: Regenerate from Supabase schema.

---

## Phase 4: Observability (Week 7-8)

### 4.1 Structured Logging
**Status**: ❌ Not Started | **Count**: 339+ console.logs

**Action**:
1. Create `backend/src/utils/logger.ts` (Pino or Winston)
2. Add request correlation IDs
3. Replace all console.log with logger methods
4. Configure log levels per environment

---

### 4.2 Create Audit Log Table
**Status**: ❌ Not Started

`ReleasesService` references `audit_log` table that doesn't exist.

**Action**: Create `audit_log` table with proper schema.

---

## Phase 5: Infrastructure (Week 9-10)

### 5.1 Rate Limiting Storage
**Status**: ⚠️ In-Memory Only

Current implementation uses `Map<string, RateLimitEntry>` which:
- Resets on deployment
- Doesn't work with multiple instances
- Has memory leak potential

**Action**: Migrate to Redis or Supabase for rate limit storage.

---

### 5.2 Pre-commit Hooks
**Status**: ❌ Not Started

**Action**:
- Add Husky + lint-staged
- Pre-commit: lint, format, type-check
- CI pipeline enforcement

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
- [ ] 2.1 Set up Vitest
- [ ] 2.1 Add backend service tests
- [ ] 2.1 Configure CI test enforcement

### Phase 3: Type Safety
- [ ] 3.1 Regenerate Supabase types
- [ ] 3.1 Fix api.ts (42 instances)
- [ ] 3.1 Fix hooks (remaining instances)
- [ ] 3.2 Update database.ts

### Phase 4: Observability
- [ ] 4.1 Create logger utility
- [ ] 4.1 Replace console.logs (339+)
- [ ] 4.2 Create audit_log table

### Phase 5: Infrastructure
- [ ] 5.1 Redis rate limiting
- [ ] 5.2 Husky + lint-staged

---

**Last Updated**: January 4, 2026  
**Next Review**: After Phase 1 completion
