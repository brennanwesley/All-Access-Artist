# Phase 0 Baseline — Mobile-First Execution Prep

## Scope

This document starts **Phase 0** from `README_MobileFirst_UI_UX_Plan.md` and captures:

1. Desktop-to-mobile feature parity matrix
2. Artist-priority mobile jobs-to-be-done
3. Performance and UX KPI targets
4. iOS/Android QA matrix
5. Critical cross-layer findings (frontend/backend/database) discovered during baseline review

This is a **non-implementation artifact**. It prepares execution and identifies blockers before Phase 1 development.

---

## 1) Feature Parity Matrix (Current Implemented Surface)

| Feature Area | Frontend Surface | Frontend Data Layer | Backend Routes/Services | Database Tables | Current Status | Mobile Risk |
|---|---|---|---|---|---|---|
| Auth + Protected App | `src/pages/LoginPage.tsx`, `src/components/ProtectedRoute.tsx`, `src/contexts/AuthContext.tsx` | Supabase auth + protected fetches in `src/lib/api.ts` | `src/middleware/auth.ts` | `auth.users`, `user_profiles` | Implemented | Medium (form ergonomics + route transitions)
| Dashboard (Artist) | `src/components/Dashboard.tsx` | Local mock query in component | None (mock) | None (mock) | Preliminary/mock | Low (functional depth limited)
| Dashboard (Admin) | `src/components/AdminDashboard.tsx` | `src/hooks/api/useAdmin.ts` | `routes/admin.ts`, `services/adminService.ts` | `user_profiles`, release/task aggregates | Implemented | Medium (dense desktop layout)
| Releases List | `src/components/ReleaseCalendar.tsx` | `src/hooks/api/useReleases.ts` | `routes/releases.ts`, `services/releasesService.ts` | `music_releases` | Implemented, primary workflow | High (desktop spacing + modal pattern)
| Release Detail / Checklist | `src/components/ReleaseDetail.tsx`, `src/components/ReleaseChecklist.tsx` | `src/hooks/api/useReleaseDetails.ts` | `routes/releases.ts`, `routes/tasks.ts`, `services/releasesService.ts` | `music_releases`, `release_tasks` | Implemented, primary workflow | High (tabs, split layout, action density)
| Songs Management | `src/components/SongManager.tsx` | `useAddSong/useUpdateSong/useDeleteSong` in `useReleaseDetails.ts` | `routes/releases.ts` (create), `routes/songs.ts` (patch/delete) | `songs` | Implemented, primary workflow | Medium-High (form density + list controls)
| Lyrics Workflow | `src/components/LyricEditor.tsx` | lyric hooks in `useReleaseDetails.ts` | `routes/lyrics.ts`, `services/LyricSheetService.ts` | `lyric_sheets`, `lyric_sheet_sections` | Implemented, primary workflow | High (multi-step editing + section management)
| Label Copy / Metadata | `src/components/MetadataPrep.tsx` | Mixed (custom fetch + auth token, not centralized) | `routes/labelcopy.ts`, `routes/releases.ts` | `label_copy`, `music_releases` | Implemented, high complexity | Critical (very dense form + technical debt)
| Split Sheets | `src/components/split-sheet/*` | `src/components/split-sheet/hooks/useSplitSheet.ts` + API client | `routes/splitsheets.ts` | `split_sheets` | Implemented, primary workflow | High (table-like UX + contributor complexity)
| Content Creator (Current) | `src/components/ContentCreator.tsx` | `src/hooks/api/useSocialMedia.ts` + direct fetch hotfix | `routes/social.ts`, artists/social update routes | `artist_profiles`, `instagram_metrics`, `tiktok_metrics`, `youtube_metrics`, `twitter_metrics` | Partially implemented | Medium-High (grid density + hardcoded API path)
| Fans / Community / Royalties | `src/components/Fans.tsx`, `Community.tsx`, `RoyaltyDashboard.tsx` | Mostly local/mock | Limited/none for these views | Mixed or none | Mostly placeholder/coming soon | Medium (future parity work)
| Settings | `src/components/Settings.tsx` | Local static config | None | None | Placeholder/static | Low-Medium |

---

## 2) Artist-Priority Mobile Jobs-to-be-Done (Ranked)

### P0 (must be excellent first)

1. Create a release quickly on mobile.
2. Open a release and manage checklist tasks.
3. Add/edit songs in a release.
4. Create/edit lyric sheets and sections.
5. Save label copy metadata without data loss.
6. Complete and save split sheets.

### P1 (next after P0 stabilization)

1. Connect social profiles and view latest social metrics.
2. Review release status and upcoming deadlines from dashboard surfaces.

### P2 (defer while still maintaining parity intent)

1. Fans/community/royalties advanced workflows (currently mostly placeholder).
2. Deeper settings and admin-mobile refinement.

---

## 3) Performance + UX KPI Targets (Phase 0 Baseline)

## Performance Targets

- **LCP**: < 2.5s on mid-tier Android over 4G
- **INP/interaction latency**: < 200ms for primary taps (nav, save, add song)
- **CLS**: < 0.1 on key pages (`/dashboard`, `/releases/:id`)
- **Initial JS budget (soft)**: keep growth constrained during Phase 1+ refactors

## UX/Product Targets

- Release creation completion rate (mobile)
- Release detail task-completion interaction success rate
- Metadata/label copy save success and abandon rate
- Split sheet completion success rate
- Error recovery success rate (retry flows)

## Baseline Measurement Plan

- Use Chrome DevTools + Lighthouse traces for LCP/CLS/interaction profiling.
- Establish manual benchmark runs on representative iOS + Android devices before Phase 1.
- Track API error rates by endpoint group (`releases`, `lyrics`, `labelcopy`, `splitsheets`, `social`).

---

## 4) Cross-Platform QA Matrix (Equal iOS/Android Priority)

| Platform | Device Class | Browser | Required Coverage |
|---|---|---|---|
| iOS | iPhone SE/mini class (small viewport) | Safari | P0 flows full pass |
| iOS | iPhone standard/pro class | Safari | P0 + P1 smoke |
| Android | Mid-tier device (Pixel A / Galaxy A class) | Chrome | P0 flows full pass |
| Android | Larger Android viewport | Chrome | P0 + P1 smoke |
| Cross-platform | Desktop fallback | Chrome/Safari/Edge | Regression parity checks |

## QA Flow Checklist (minimum per regression cycle)

- Login -> Dashboard -> Releases list -> Release detail
- Add/edit/delete song
- Create/edit lyric sheet sections
- Save label copy updates and reload verification
- Save split sheet updates and reload verification
- Social connect + metrics retrieval smoke

---

## 5) Critical Findings from Baseline Review (Honest CTO Report)

## ✅ Confirmed Strengths

1. Core release workflow exists end-to-end (frontend -> backend -> DB).
2. JWT auth middleware + user-scoped Supabase client is active in backend.
3. Zod validation is present on many API boundaries.
4. Live DB includes `user_id` columns on core workflow tables used by current backend.

## ❌ Critical / High Risks Found

1. **Schema drift risk (repo migrations vs live DB)**
   - Live DB includes columns and behavior not fully represented in local migration history.
   - Risk: new environments or branch databases may break despite production working.

2. **Release type contract mismatch risk**
   - Frontend/backend schemas use `mixtape`; live `music_releases.release_type` DB check currently allows `compilation` (not `mixtape`).
   - Risk: create/update release failures for certain values.

3. **Data-layer inconsistency in frontend**
   - `MetadataPrep.tsx` bypasses centralized API client and performs direct fetch logic.
   - `ContentCreator.tsx` includes hardcoded backend absolute URL for social connect hotfix.
   - Risk: duplicated auth/network logic, environment drift, and inconsistent error handling.

4. **Excessive debug logging in production paths**
   - Present in key release flows (`Index`, `ReleaseCalendar`, `MetadataPrep`, `LyricEditor`, split-sheet hooks, and other areas).
   - Risk: noisy logs, performance overhead, difficult production debugging.

5. **Navigation architecture still desktop-first/state-driven**
   - Main section routing relies on context/state switching rather than route-first app shell.
   - Risk: weak mobile back-stack behavior and deep-link parity.

---

## 6) Recommended Phase 0 Deviation (Approved by Goal)

To improve overall success probability, add a **Phase 0A Stability Gate** before Phase 1 implementation:

1. Align contract truth source for core workflow tables and enums.
2. Resolve release type mismatch (`mixtape` vs DB constraint).
3. Standardize frontend API access through `apiClient` for release-critical flows.
4. Remove high-volume debug logging from release-critical user paths.

This deviation is minimal and directly supports robust, secure, scalable execution of the mobile-first roadmap.

---

## 7) Phase 0 Exit Criteria Status (Started)

- [x] Desktop-to-mobile feature parity matrix drafted
- [x] Artist-priority JTBD ranked
- [x] KPI targets and baseline measurement plan defined
- [x] iOS/Android QA matrix defined
- [x] Cross-layer critical findings documented
- [x] Phase 0A stability gate tasks completed (recommended before Phase 1)

## Phase 0A Progress (Current)

- [x] Added migration file to align `music_releases.release_type` constraint with app contract (`mixtape` supported)
- [x] Consolidated `MetadataPrep` network calls through centralized `apiClient` (removed direct `fetch` + hardcoded API URL pattern)
- [x] Replaced hardcoded social connect endpoint usage in `ContentCreator` with centralized `apiClient` method
- [x] Removed high-volume debug logs from release-critical frontend paths (`Index`, `ReleaseCalendar`, `LyricEditor`, split-sheet hook, `MetadataPrep` save flow)
- [x] Applied and verified release-type migration in Supabase and confirmed no invalid `music_releases.release_type` values remain

### Phase 0A DB Verification Notes

- Applied migration in Supabase: `align_music_releases_release_type_constraint`
- Recorded migration version in DB history: `20260215015645`
- Post-migration `music_releases_release_type_check` now enforces: `single | ep | album | mixtape`
- Validation query result: `invalid_release_type_rows = 0`

---

## 8) Immediate Next Step (still Phase 0)

Phase 0A core stabilization is complete. Before Phase 1 starts:

1. Run post-migration release create/update sanity checks in app flows.
2. Re-check schema parity between repo migrations and active database branch strategy.
3. Secure stakeholder sign-off on Phase 0 deliverables.
