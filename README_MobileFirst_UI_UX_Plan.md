# Mobile-First UI/UX Plan (Web App -> Native App Readiness)

## Executive Summary

The frontend is functionally strong, but the current UI architecture is still desktop-first.
The main blocker for mobile UX is the app shell/navigation architecture, more than individual component styling.

Recommended implementation order:

1. Rebuild app shell/navigation for mobile-first behavior
2. Refactor core user journeys (auth -> onboarding -> releases)
3. Refactor dense production workflows (Metadata, Split Sheets, Content Creator)
4. Performance + accessibility hardening
5. Prepare shared architecture for native mobile app

## Confirmed Product Decisions (Locked)

1. Mobile web will ship with full feature parity for the currently available desktop feature set.
2. Primary mobile user for the next 90 days is Artist.
3. iOS and Android are equal priority.
4. Move from context-based section navigation to route-based navigation now.
5. Refresh UI for mobile readability/contrast while preserving selective glassmorphism for continuity.
6. Start native MVP in parallel after Phase 2 is complete.
7. Use milestone-based execution (no fixed dates committed yet).

## Phase 0 Status Snapshot

- Phase 0 has started.
- Baseline artifact created: `README_Phase0_Mobile_Baseline.md`
- Scope covered in baseline artifact:
  - feature parity matrix
  - artist-priority JTBD ranking
  - KPI target definitions
  - iOS/Android QA matrix
  - cross-layer critical findings and Phase 0A stability gate recommendation
- Phase 0A execution progress:
  - completed: API client consolidation for MetadataPrep/social connect and release-critical debug-log cleanup
  - completed: migration applied in Supabase to align release type constraint with app contract (`single|ep|album|mixtape`)
  - completed: post-migration schema validation confirms no invalid release types remain
  - next: run in-app sanity checks for release create/update flows and close stakeholder sign-off

### CTO Recommendation: Offline Strategy

Use a "resilience-first now, offline-first later" model:

- Early (Phase 2): Implement draft resilience via autosave and restore (local/session storage) for long forms.
- Mid (Phase 5): Add PWA shell caching and offline fallback for read/navigation continuity.
- Later (post-MVP native hardening): Add queued writes and conflict handling where business critical.

---

## Reviewed Areas (High Signal)

- App routing and shell: `frontend/src/App.tsx`, `frontend/src/pages/Index.tsx`
- Current nav system: `frontend/src/components/Navigation.tsx`, `frontend/src/contexts/NavigationContext.tsx`
- Mobile utility and available primitives: `frontend/src/hooks/use-mobile.tsx`, `frontend/src/components/ui/sidebar.tsx`, `frontend/src/components/ui/drawer.tsx`, `frontend/src/components/ui/sheet.tsx`
- Core UX surfaces: `frontend/src/components/ReleaseCalendar.tsx`, `frontend/src/components/ReleaseDetail.tsx`, `frontend/src/components/NewReleaseModal.tsx`, `frontend/src/components/EditReleaseModal.tsx`
- Heavy forms/workflows: `frontend/src/components/MetadataPrep.tsx`, `frontend/src/components/split-sheet/SplitSheetForm.tsx`, `frontend/src/components/ContentCreator.tsx`, `frontend/src/components/RoyaltyDashboard.tsx`
- Auth/onboarding funnel pages: `frontend/src/pages/LoginPage.tsx`, `frontend/src/pages/PlanSelection.tsx`, `frontend/src/pages/OnboardingComplete.tsx`
- UI consistency and infra: `frontend/src/components/ui/dialog.tsx`, `frontend/src/App.tsx`, `frontend/src/pages/PlanSelection.tsx`, `frontend/src/components/NewReleaseModal.tsx`, `frontend/src/App.css`, `frontend/index.html`

---

## Current-State Diagnosis (Mobile Readiness)

### 1) App shell is desktop-locked

- Sidebar is fixed desktop width and layout offsets are hard-coded (`w-64`, `ml-64`, large paddings).
- This reduces one-hand usability and creates fragile behavior on smaller viewports.

Priority: Critical

### 2) Mobile primitives exist but are not integrated into app navigation

- `useIsMobile` exists.
- Sidebar supports mobile sheet behavior.
- `Drawer` and `Sheet` primitives are available.

Insight: Mobile-first shell can be built with existing dependencies.

### 3) Information architecture is state-based instead of URL-based

- Section switching relies on context + route state patterns.
- This weakens mobile back-stack behavior, deep linking, and native app parity.

Priority: Critical

### 4) Complex screens are dense for mobile interaction

- Release detail tabs and multi-pane layouts
- Split sheet table-like contributor layout
- Royalty dense trend/data sections
- Content creator dense metrics tiles
- MetadataPrep long-form, high cognitive load flow

Priority: High

### 5) Modal strategy is not consistently mobile-optimized

- Base dialog defaults center-modal behavior.
- Some flows use large desktop-width modals.
- Some components already use better full-screen/mobile patterns.

Priority: High

### 6) UX consistency debt

- Mixed toast systems (`react-hot-toast` and `sonner`).
- Remaining debug logging in core UX flows.
- Legacy global style risk (`#root { text-align: center; }`).

Priority: High

### 7) Mobile web -> app bridge not started

- No PWA/service worker/manifest setup found.
- No Capacitor/Expo/React Native infrastructure currently in frontend.

Priority: Medium now, High before native app

---

## Detailed Implementation Plan (Phased)

## Phase 0 - Product Alignment + Mobile UX Baseline (1 week)

Goal: Define mobile success criteria before implementation.

1. Build desktop-to-mobile feature parity matrix for all currently implemented features.
2. Define top mobile jobs-to-be-done for Artist users (create release, add songs, manage lyrics, complete release documentation).
3. Set mobile performance targets:
   - LCP < 2.5s on 4G mid-tier Android
   - Interaction response < 200ms for common actions
4. Define UX metrics:
   - Task completion rate
   - Form abandonment (onboarding + metadata)
   - Time-to-complete release setup
5. Define cross-platform QA matrix with equal coverage for iOS and Android.

Deliverable: Mobile UX requirements doc + KPI baseline.

## Phase 1 - Rebuild App Shell/Navigation for Mobile-First (2 weeks)

Goal: Remove architecture-level mobile blockers first.

1. Create `AppShell` with responsive behavior:
   - Desktop: sidebar
   - Mobile: bottom nav + "More" sheet
2. Remove hard-coded offsets (`ml-64`, static `p-8`) and centralize layout in shell.
3. Convert sections to route-based URLs (`/dashboard`, `/dashboard/releases`, etc.) as the primary navigation model.
4. Keep navigation context only for UI state, not primary routing.
5. Add safe-area support for iOS (`env(safe-area-inset-*)`).

Acceptance Criteria:

- No horizontal scrolling at 320px width.
- Primary nav reachable by thumb.
- Back button and deep links behave predictably.

## Phase 2 - Core Mobile Journeys (2-3 weeks)

Goal: Make highest-frequency paths excellent.

### A) Auth + onboarding funnel

- Tighten spacing and hierarchy for Login, Plan Selection, and Onboarding Complete.
- Convert long forms to progressive sections/stepper.
- Add mobile input optimization (`inputMode`, `autoComplete`, keyboard hints).

### B) Release manager flow

- Prioritize parity-critical release capabilities first (create release, songs, lyrics, and associated documentation workflows).
- Prioritize card content: title, date, status, primary action.
- Use full-height drawer for New Release on mobile.
- Convert release detail tabs to compact segmented controls with sticky actions.

### C) Draft resilience foundation (offline recommendation - early layer)

- Add autosave and restore for long-form workflows (Metadata, Split Sheet, lyrics/documentation inputs).
- Add explicit "draft restored" UX messaging and safe recovery on refresh/reopen.

## Phase 3 - Complex Feature Refactors for Mobile Usability (3-4 weeks)

Goal: Reduce cognitive load in production workflows.

1. MetadataPrep:
   - Step flow: Release Info -> Rights/IDs -> Track Metadata -> Review/Save
   - Sticky action bar (`Save Draft`, `Continue`, `Publish`)
   - Advanced sections collapsed by default
2. Split Sheet:
   - Replace table-like rows with stacked contributor cards on mobile
   - Keep percentage validator visible/sticky
3. Content Creator + Royalty:
   - Replace dense grids with swipeable cards/accordion groups
   - Provide reduced-detail chart views on mobile

## Phase 4 - Quality Hardening (2 weeks)

Goal: Production-grade mobile polish.

1. Unify to one toast system and one placement strategy.
2. Remove remaining debug logs from critical screens.
3. Mobile readability refresh pass while preserving selective glassmorphism:
   - Increase contrast and text legibility in glass surfaces
   - Tighten spacing/typographic scale for smaller viewports
   - Keep visual continuity with desktop branding where it does not hurt clarity
4. Accessibility pass:
   - 44px minimum tap targets
   - clear focus states
   - semantic labels + error messaging
5. Performance pass:
   - Route-level code splitting
   - Lazy load heavy modules
   - Reduce initial JS load where practical

## Phase 5 - PWA Layer (Optional but Recommended Before Native) (1-2 weeks)

Goal: Improve mobile web ergonomics and app-like behavior.

1. Add web app manifest + installability.
2. Add service worker for shell caching + offline fallback.
3. Extend resume-draft behavior from Phase 2 and validate restore reliability.

## Phase 6 - Native App Preparation (2-4 weeks, parallelizable)

Goal: De-risk native app development.

1. Extract shared domain package:
   - API types
   - Validation schemas
   - API client abstractions
2. Move browser-only side effects behind adapters.
3. Align routing model to be reusable with native navigation.

## Phase 7 - Native App MVP (8-12 weeks)

Recommended stack: Expo + React Native

1. MVP scope:
   - Auth
   - Dashboard summary
   - Releases list/detail
   - Task/checklist updates
   - Song add/edit
2. Keep advanced modules in mobile web initially, then port selectively.
3. Introduce push notifications for release deadlines after core stability.

## Parallelization Model (After Phase 2)

1. Complete Phase 2 web milestone (auth/onboarding/releases parity flows stable on mobile web).
2. Start native MVP in parallel using shared contracts from Phase 6.
3. Continue Phases 3-5 web hardening while native MVP is developed.
4. Keep parity tracking active to prevent desktop-mobile drift.

## Phase Dependency Map

### Sequential Web Track

- Phase 0 -> Phase 1 -> Phase 2 -> Phase 3 -> Phase 4 -> Phase 5

### Native Parallel Track

- Phase 6 depends on completion of Phase 2 baseline and confirmed shared contracts.
- Phase 7 (Native MVP) starts after Phase 2 and the minimum Phase 6 contract extraction baseline.
- Phase 7 runs in parallel with web hardening phases (Phases 3-5), with parity tracking to avoid drift.

### Dependency Notes

- Phase 0 outputs (parity matrix, KPI targets, QA matrix) are entry criteria for Phase 1.
- Phase 1 route-based navigation architecture is an entry criterion for Phase 2 flow work.
- Phase 2 delivery is the release gate for parallel web/native execution.
- Phase 4 quality hardening should be complete before broad mobile production rollout.

## Definition of Done (Per Phase)

### Phase 0 - Product Alignment + Mobile UX Baseline

- [x] Desktop-to-mobile feature parity matrix is complete for all currently implemented features.
- [x] Artist-priority mobile jobs-to-be-done are documented and ranked.
- [x] Mobile performance targets and UX KPIs are documented.
- [x] Equal-priority iOS/Android QA matrix is defined.
- [ ] Stakeholder sign-off on Phase 0 baseline artifact is complete.

### Phase 1 - App Shell/Navigation

- [ ] Responsive AppShell behavior is defined for desktop and mobile patterns.
- [ ] Route-based navigation is the primary section model.
- [ ] Navigation context scope is reduced to UI state only.
- [ ] No horizontal scrolling at 320px in primary app shell pages.
- [ ] Back navigation and deep links are predictable across sections.

### Phase 2 - Core Mobile Journeys

- [ ] Auth/onboarding mobile flow updates are complete and validated.
- [ ] Parity-critical release workflows are mobile-usable (release, songs, lyrics, documentation).
- [ ] Mobile modal/drawer behavior is standardized in priority release flows.
- [ ] Draft autosave/restore is working for long-form workflows with clear restore messaging.
- [ ] Phase 2 milestone sign-off is complete (parallel native start gate).

### Phase 3 - Complex Feature Mobile Refactors

- [ ] MetadataPrep is restructured into a mobile-friendly step flow with sticky actions.
- [ ] Split Sheet uses stacked contributor cards and keeps validation visible.
- [ ] Content Creator and Royalty views support mobile-friendly card/accordion presentation.
- [ ] No critical mobile usability blockers remain in these flows.

### Phase 4 - Quality Hardening

- [ ] Single toast system and placement strategy are consistently used.
- [ ] Debug logs are removed from production-critical frontend flows.
- [ ] Mobile readability/contrast refresh is complete while preserving selective glassmorphism continuity.
- [ ] Accessibility checks pass for touch targets, focus states, and form semantics.
- [ ] Mobile route performance optimizations are applied to priority heavy modules.

### Phase 5 - PWA Layer

- [ ] Web app manifest and installability behavior are validated.
- [ ] Service worker shell caching and offline fallback are verified.
- [ ] Draft restore reliability is validated under refresh/reopen and transient network loss.

### Phase 6 - Native App Preparation

- [ ] Shared API/types/schema contracts required for native are defined and consumable.
- [ ] Browser-only side effects are isolated behind adapter boundaries.
- [ ] Navigation and domain contracts are aligned for native implementation.
- [ ] Native implementation handoff notes are complete.

### Phase 7 - Native App MVP

- [ ] MVP scope flows are implemented (auth, dashboard summary, releases, tasks, songs).
- [ ] Artist-priority parity-critical mobile workflows are functional on both iOS and Android.
- [ ] Push notification integration for release deadlines is implemented after stability criteria are met.
- [ ] MVP readiness review is completed with parity drift checks against mobile web.

---

## Suggested First 10 Tickets

1. Build `AppShell` with responsive nav container
2. Route migration from section context to nested dashboard routes
3. Remove `ml-64` and static paddings in Index/ReleaseDetail
4. Add mobile bottom tab bar + "More" sheet
5. Convert NewReleaseModal to mobile drawer pattern
6. Convert EditReleaseModal to full-height mobile sheet
7. Split OnboardingComplete into 2-3 steps
8. Build MetadataPrep stepper skeleton + sticky action bar
9. Unify toast implementation
10. Remove remaining debug logs from top screens

---

## Decisions Captured from Stakeholder Inputs

1. Feature parity target: full parity with currently implemented desktop features.
2. Primary persona: Artist (next 90 days).
3. Platform priority: equal iOS and Android priority.
4. Offline strategy: implement draft resilience early; full offline-first behavior later.
5. Design direction: readability refresh + selective glassmorphism continuity.
6. Navigation architecture: approved move to route-based navigation.
7. Delivery model: start native MVP in parallel after Phase 2.
8. Timeline model: milestone-driven, dates intentionally deferred for now.
