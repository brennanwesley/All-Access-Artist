# Phase 1 Mobile-First Build Plan (Execution Readme)

Last updated: 2026-02-17  
Owner: CTO + Engineering  
Phase window: 2 weeks (target)

---

## 1) Objective

Execute Phase 1 in precise, low-risk increments that remove architecture-level mobile blockers without destabilizing existing release-critical workflows.

Primary success outcomes:

- Route-based navigation becomes the primary section model.
- App shell layout is centralized and responsive.
- Desktop-coupled layout offsets are removed from page components.
- Mobile baseline UX criteria are satisfied at 320px width.

Reference plan source: `README_MobileFirst_UI_UX_Plan.md` (Phase 1 + DoD).

---

## 2) Working Approach (Precision + Deploy Cadence)

- Ship in manageable sub-steps with narrow blast radius.
- Validate each sub-step before proceeding.
- Commit and push after each completed sub-step so deployments can be inspected:
  - Frontend preview/production: Vercel
  - Backend preview/production: Render
- Do not bundle multiple architectural risks in the same PR.

---

## 3) Phase 1 Chunk Breakdown

| Chunk | Name | Scope | Risk | Deploy Checkpoint |
|---|---|---|---|---|
| P1-01 | Route Contract Freeze | Add typed section/route contract + helpers, adopt in current navigation code without UI behavior change | Low | Contract in code, no UX regressions |
| P1-02 | AppShell Extraction | Create shared `AppShell` wrapper and move shell layout ownership out of pages | Low | Same UX, shared shell foundation |
| P1-03 | Route-First Sections | Make URL the source of truth for sections (`/dashboard/...`) with compatibility bridge | Medium | Deep links/back behavior improve |
| P1-04 | Navigation Route Binding | Bind nav active state to router path, not context state | Medium | Predictable browser/back-stack behavior |
| P1-05 | Mobile Nav + Safe Area | Add bottom nav + More sheet; apply safe-area insets | Medium | Thumb-reachable primary nav on mobile |
| P1-06 | Remove Desktop-Coupled Offsets | Eliminate `ml-64`/fixed shell paddings from pages | Low-Med | 320px layout stability improves |
| P1-07 | Acceptance Hardening | Validate no horizontal scroll, deep-link/back consistency, shell behavior | Low | Phase 1 sign-off readiness |

---

## 4) First Step to Start Now (P1-01)

### Why this first

P1-01 gives the highest chance of success because it creates a stable contract before UI/layout refactors begin. It reduces naming drift and prevents rework in later chunks.

### P1-01 Deliverables

1. Introduce a typed section contract (section ids + canonical paths).
2. Add helpers for:
   - section normalization/validation
   - section inference from path
   - path generation from section
3. Wire current navigation/context usage to consume contract helpers.
4. Keep current UX behavior unchanged (no route migration yet).

### P1-01 Out of Scope

- No AppShell extraction yet.
- No mobile bottom nav yet.
- No route restructuring of `App.tsx` yet.

### P1-01 Definition of Done

- Contract utilities exist and are used by current navigation flow.
- Existing section switching still works as-is.
- Frontend typecheck/lint pass for touched code.
- Changes are committed and pushed.

---

## 5) Sub-step Completion Protocol

For each chunk (P1-01 ... P1-07):

1. Implement the smallest complete unit.
2. Run validation checks.
3. Commit with a focused message (`phase1: <chunk-id> <summary>`).
4. Push to GitHub.
5. Review Vercel + Render deployments before next chunk.

---

## 6) Phase 1 Acceptance Targets

- No horizontal scrolling at 320px width on primary app shell pages.
- Primary navigation is thumb-reachable on mobile.
- Back button and deep links behave predictably across sections.

---

## 7) Execution Note

Current execution starts with **P1-01** immediately after this file is created.
