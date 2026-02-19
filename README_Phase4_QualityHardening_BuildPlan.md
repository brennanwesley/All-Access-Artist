# Phase 4 Quality Hardening Build Plan (Execution Readme)

Last updated: 2026-02-19  
Owner: CTO + Engineering + Security  
Phase window: 2-3 weeks (target)

---

## 1) Objective

Execute Phase 4 in a production-hardening sequence that improves reliability, accessibility, and performance **while explicitly strengthening security and scalability controls** before broader mobile rollout.

Primary success outcomes:

- UX consistency issues are resolved (toast strategy, error UX, logging hygiene).
- Security controls are enforced at API boundaries (JWT + Zod + standardized error contracts).
- Authorization boundaries (RLS + user-scoped clients) are verified and locked.
- Performance budgets are defined and enforced for heavy modules.
- Phase 4 exits with an audit-ready acceptance runbook and no critical P0/P1 blockers.

Reference source: `README_MobileFirst_UI_UX_Plan.md` (Phase 4 goals + DoD).

---

## 2) Working Approach (CTO Operating Cadence)

- Ship narrow, reversible chunks with measurable exit criteria.
- Prioritize controls that reduce systemic risk first (security + observability).
- Keep API and database contract changes explicit and version-safe.
- Require validation evidence per chunk (build/typecheck/lint + targeted checks).
- Commit and push after each completed chunk so deployment quality gates can be inspected:
  - Frontend: Vercel
  - Backend: Render

---

## 3) Phase 4 Execution Checklist (Tracking Board)

### P4-01 - Toast + Error UX Standardization (Risk: Medium)
Status: Complete

- [x] Audit all frontend toast paths and confirm mixed implementations.
- [x] Select one runtime (`sonner`) and mount a single app-level toaster.
- [x] Migrate priority toast call sites to a shared import path (`@/components/ui/sonner`).
- [x] Normalize user-facing error copy in touched flows (non-technical, actionable).
- [x] Run and capture validation evidence (frontend build + TS + targeted lint).

Deploy checkpoint: Consistent UX feedback patterns with no duplicate toast stacks.

### P4-02 - Production Logging + Error Boundary Hardening (Risk: Medium)
Status: Complete

- [x] Remove stray debug logs from customer-facing critical flows.
- [x] Define production logging rules (what logs at info/warn/error).
- [x] Validate error boundary coverage on priority routes.
- [x] Verify fallback UI quality for runtime failures.

Deploy checkpoint: No noisy console/debug leakage; fallback UX verified.

### P4-03 - Mobile Readability + Accessibility Pass (Risk: Medium)
Status: Complete

- [x] Audit color contrast, spacing, and touch target size for priority flows.
- [x] Validate semantic labels/ARIA and keyboard focus behavior.
- [x] Ensure inline field error messaging is clear and consistent.
- [x] Re-test mobile-critical screens for WCAG-aligned baseline quality.

Deploy checkpoint: WCAG-oriented mobile usability baseline satisfied in priority flows.

### P4-04 - Frontend Performance Budgeting (Risk: Medium)
Status: Complete

- [x] Define route-level JS bundle and render-time budgets for priority screens.
- [x] Apply route-level lazy loading/code splitting where highest impact.
- [x] Measure before/after route performance.
- [x] Record budgets + results in engineering notes.

Evidence: `qa-evidence/phase4/p4-04/2026-02-19/frontend-performance-budgeting.md`

Deploy checkpoint: Measurable route performance improvement and budget tracking established.

### P4-05 - API Boundary Security Enforcement (Risk: High)
Status: Complete

- [x] Ensure non-public routes require Supabase JWT middleware.
- [x] Validate request body/params/query with Zod at route boundary.
- [x] Enforce standardized backend error response shape.
- [x] Add negative tests for unauthorized and malformed requests.

Evidence: `backend/src/__tests__/apiBoundarySecurity.test.ts`, `backend/src/middleware/validation.ts`, `backend/src/utils/apiResponse.ts`

Deploy checkpoint: Auth + validation contract is explicit and consistently enforced.

### P4-06 - Authorization/RLS Integrity Audit (Risk: High)
Status: Complete

- [x] Verify user-scoped Supabase clients in audited priority user operations (`calendar`, `profile`).
- [x] Confirm no service-role bypass in audited user-scoped paths.
- [x] Test cross-user access attempts against priority endpoints.
- [x] Record route-class authorization outcomes and remediations.

Evidence: `backend/src/__tests__/authorizationRlsIntegrity.test.ts`, `backend/src/routes/calendar.ts`, `backend/src/services/calendarService.ts`, `backend/src/routes/profile.ts`, `backend/src/services/profileService.ts`

Current remediations:

- Migrated calendar user operations from service-role client construction to request-scoped user client usage.
- Removed service-role dependency from profile read path by using request auth context contact fields.

Route-class authorization outcomes:

- User route classes (`/api/calendar`, `/api/profile`) now execute via request-scoped user Supabase clients.
- Privileged service-role paths retained only where operationally required (`/api/admin`, `/api/onboarding`, `/api/webhooks`, rate limiting middleware).
- Cross-user read/write/delete attempt patterns are covered in authorization integrity tests for calendar operations.

Deploy checkpoint: Cross-user access controls verified with no policy bypass regressions.

### P4-07 - Secrets + Runtime Config Hardening (Risk: Medium)
Status: Complete

- [x] Audit code for hardcoded secrets/magic config strings.
- [x] Validate frontend/backend env binding boundaries and exposure rules.
- [x] Ensure least-privilege key usage by environment.
- [x] Document operational rotation/rollback steps for sensitive keys.

Evidence: `qa-evidence/phase4/p4-07/2026-02-19/secrets-runtime-config-hardening.md`, `frontend/src/lib/api.ts`, `frontend/src/components/auth/ErrorFallback.tsx`

Deploy checkpoint: Config posture explicit, least-privilege aligned, deployment-safe.

### P4-08 - Data Scalability + Query Efficiency (Risk: Medium-High)
Status: Complete

- [x] Identify top query hotspots in priority API workflows.
- [x] Push heavy filtering/aggregation to SQL or RPC where appropriate.
- [x] Validate index coverage and query plans for hot paths.
- [x] Compare before/after timing and worker memory pressure.

Evidence: `qa-evidence/phase4/p4-08/2026-02-19/data-scalability-query-efficiency.md`, `backend/src/services/adminService.ts`, `backend/src/__tests__/dataScalabilityQueryEfficiency.test.ts`, `database/migrations/13_phase4_query_efficiency_indexes.sql`

Deploy checkpoint: Stable response times under realistic load and reduced worker memory pressure.

### P4-09 - Phase 4 Acceptance Hardening (Risk: Low)
Status: Not started

- [ ] Execute full Phase 4 validation matrix and capture evidence.
- [ ] Verify no unresolved P0/P1 security, scalability, or reliability defects.
- [ ] Finalize Phase 4 sign-off runbook with checkpoint references.
- [ ] Complete stakeholder sign-off and release gate close.

Deploy checkpoint: Phase 4 ready for production progression.

---

## 4) Security Recommendation Placement Map (Explicit)

To ensure security recommendations are not hand-wavy, each control is bound to a chunk:

1. **JWT middleware on non-public routes** -> `P4-05`
2. **Zod validation for body/params/query at API boundary** -> `P4-05`
3. **Standardized backend error shape** (`{ success: false, error: { message, code? } }`) -> `P4-05`
4. **User-scoped Supabase clients + no service-role bypass for user operations** -> `P4-06`
5. **RLS integrity verification via route/use-case audit** -> `P4-06`
6. **Secrets/config hygiene and rotation readiness** -> `P4-07`
7. **Scalability controls (query efficiency + database-first filtering)** -> `P4-08`

---

## 5) Active Step and Scope

### Active step: P4-08 (Complete)

### Why now

P4-08 follows security/config hardening by reducing API query fan-out, moving aggregation to SQL boundaries, and validating growth-oriented query/index posture.

### P4-08 Deliverables

1. Identify top query hotspots in priority API workflows.
2. Move filtering/aggregation to SQL boundaries where appropriate.
3. Validate index coverage and `EXPLAIN` plans for key query paths.
4. Record before/after query efficiency deltas and worker memory impact.

### P4-08 Out of Scope

- No additional API auth boundary changes (covered in completed P4-05/P4-06).
- No secrets/runtime configuration hardening expansion beyond completed P4-07.

### P4-08 Definition of Done

- Query hotspots and bottleneck patterns are identified with evidence.
- Aggregation/filtering paths are moved to SQL where impactful.
- Index coverage and plan posture for hot paths are documented.
- Build/typecheck/test gates pass for touched files.

---

## 6) Engineering Guardrails for Phase 4

- Security is Priority 0: never trust client input.
- Keep route handlers thin; validate first, then orchestrate service logic.
- Maintain strict TypeScript (no `any` without constrained, justified exception).
- Keep frontend/backend contracts explicit and testable.
- Do not leak stack traces/internal DB details in API responses.
- Preserve principle of minimal intrusion: smallest safe change per chunk.

---

## 7) Validation Gates (Per Chunk)

Required baseline gates:

1. `npm run build --workspace frontend`
2. `npx tsc --noEmit --project frontend/tsconfig.json`
3. `npm run typecheck:backend`
4. Targeted eslint on touched files

Additional gates by chunk:

- `P4-05/P4-06`: authn/authz negative tests (unauthorized, cross-user access, malformed payloads)
- `P4-07`: config/secrets scan checklist and deployment binding review
- `P4-08`: query performance verification (before/after timings, plan checks)

---

## 8) Phase 4 Acceptance Targets

- Single toast strategy and clean production logging posture in priority flows.
- Accessibility/readability baseline met for mobile-critical screens.
- Route and module performance improvements are measurable and documented.
- API boundary security controls (JWT + Zod + error contracts) are enforced consistently.
- Authorization boundaries (RLS + scoped clients) validated with no critical regressions.
- Secrets/config posture documented and aligned with least privilege.
- Phase 4 acceptance hardening record completed and signed.

---

## 9) Completion Protocol (Per Chunk)

For each chunk (`P4-01` ... `P4-09`):

1. Implement the smallest complete unit.
2. Run required validation gates.
3. Capture evidence notes for security/performance-sensitive chunks.
4. Commit with focused message (`phase4: <chunk-id> <summary>`).
5. Push to GitHub and verify deployment checks.

---

## 10) Execution Note

This is a planning artifact only. **No Phase 4 implementation starts until explicit go-ahead is provided.**
