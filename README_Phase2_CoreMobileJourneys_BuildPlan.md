# Phase 2 Core Mobile Journeys Build Plan (Execution Readme)

Last updated: 2026-02-17  
Owner: CTO + Engineering  
Phase window: 2-3 weeks (target)

---

## 1) Objective

Execute Phase 2 in focused, low-risk increments so the highest-frequency artist workflows become reliably mobile-usable while preserving existing release flow stability from Phase 0A + Phase 1.

Primary success outcomes:

- Auth and onboarding flows are mobile-optimized for input, spacing, and completion.
- Release Manager core workflows are thumb-friendly and parity-safe on mobile.
- Priority release dialogs/sheets are standardized for mobile behavior.
- Draft autosave/restore foundation is visible and reliable for long-form workflows.

Reference source: `README_MobileFirst_UI_UX_Plan.md` (Phase 2 goals + DoD).

---

## 2) Working Approach (Precision + Deploy Cadence)

- Ship narrow, reversible sub-steps with minimal blast radius.
- Keep release-critical behavior unchanged unless the chunk explicitly targets it.
- Validate each chunk with lint/build checks.
- Commit and push after each completed sub-step so deployments can be inspected:
  - Frontend: Vercel
  - Backend: Render

---

## 3) Phase 2 Chunk Breakdown

| Chunk | Name | Scope | Risk | Deploy Checkpoint |
|---|---|---|---|---|
| P2-01 | Auth Input Optimization Baseline | Add mobile input hints (`autoComplete`, `inputMode`, keyboard hints) and spacing polish to Login + Onboarding Complete | Low | Faster, cleaner mobile form entry with no flow logic changes |
| P2-02 | Plan Selection Mobile Hierarchy | Tighten plan card spacing/typography and CTA hierarchy at 320-390 widths | Low | Plan page readability + tap confidence improves |
| P2-03 | Onboarding Progressive Sections | Split onboarding completion form into staged sections/stepper while preserving API payload contract | Medium | Better completion rate on mobile |
| P2-04 | Release List Mobile Prioritization | Prioritize release cards for title/date/status/primary action and reduce dense desktop layout patterns | Medium | Release list scanning and actioning improve on mobile |
| P2-05 | New Release Mobile Drawer | Convert New Release flow to full-height mobile drawer (desktop dialog retained) | Medium | Creation flow becomes thumb-first |
| P2-06 | Edit Release Mobile Sheet Standard | Convert Edit Release to mobile full-height sheet and align confirmation dialog behavior | Medium | Editing flow consistent with mobile modal standard |
| P2-07 | Draft Restore UX Messaging | Add explicit restore status/messaging for long-form draft workflows (starting with Metadata/Label Copy) | Medium | Safe recovery confidence improves |
| P2-08 | Phase 2 Acceptance Hardening | Validate no critical mobile blockers in Auth/Onboarding/Releases; finalize sign-off checklist | Low | Phase 2 release gate readiness |

---

## 4) First Step to Start Now (P2-01)

### Why this first

P2-01 delivers immediate mobile usability gain with very low risk and establishes baseline input ergonomics before larger structural changes (stepper and drawer conversions).

### P2-01 Deliverables

1. Add mobile-friendly input attributes in Login and Onboarding Complete:
   - `autoComplete`
   - `inputMode`
   - keyboard hints where appropriate
2. Tighten top-level mobile spacing in these screens without changing core behavior.
3. Preserve all API payloads, validation logic, and navigation behavior.

### P2-01 Out of Scope

- No onboarding stepper conversion yet.
- No release modal/drawer conversion yet.
- No autosave/restore behavior changes yet.

### P2-01 Definition of Done

- Login and Onboarding input ergonomics are mobile-optimized.
- Existing auth/onboarding success/error flows are unchanged.
- Frontend lint/build pass for touched files.
- Changes are committed and pushed.

---

## 5) Sub-step Completion Protocol

For each chunk (P2-01 ... P2-08):

1. Implement the smallest complete unit.
2. Run validation checks.
3. Commit with focused message (`phase2: <chunk-id> <summary>`).
4. Push to GitHub.
5. Verify Vercel/Render deployments before next chunk.

---

## 6) Phase 2 Acceptance Targets

- Auth and onboarding are mobile-friendly at 320px without form friction blockers.
- Release creation/editing flows are mobile-usable with standardized modal/sheet behavior.
- Long-form workflows show clear autosave/restore behavior and messaging.
- Phase 2 sign-off is complete as gate for parallel native start.

---

## 7) Execution Note

Current execution starts with **P2-01** immediately after this file is created.
