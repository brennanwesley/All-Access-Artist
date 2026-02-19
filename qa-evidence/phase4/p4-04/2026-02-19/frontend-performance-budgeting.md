# P4-04 Frontend Performance Budgeting

- Date (UTC): 2026-02-19
- Scope: Route-level and high-impact module code splitting for startup payload reduction
- Tester: Cascade (assisted)
- Environment: local production build (`vite build`)

## Budget definitions

| Budget target | Threshold | Result | Status |
| --- | ---: | ---: | --- |
| Entry JS chunk (initial app payload) | <= 450 kB raw / <= 130 kB gzip | 376.35 kB raw / 114.32 kB gzip | PASS |
| Largest lazy route chunk | <= 120 kB raw / <= 30 kB gzip | 102.11 kB raw / 23.72 kB gzip (`ReleaseDetail`) | PASS |
| Largest dashboard section chunk | <= 30 kB raw / <= 8 kB gzip | 27.97 kB raw / 7.84 kB gzip (`ContentCreator`) | PASS |
| Oversized chunk warning | No chunk > 500 kB | none emitted after split | PASS |

## Implementation summary

### 1) Route-level code splitting
- Converted top-level route pages to `React.lazy` imports.
- Wrapped router tree in `Suspense` with a lightweight loading fallback.
- File: `frontend/src/App.tsx`

### 2) Dashboard section-level code splitting
- Converted heavy dashboard sections to lazy imports:
  - `AdminDashboard`, `ReleaseCalendar`, `ContentCreator`, `RoyaltyDashboard`, `Fans`, `Community`, `Settings`, `Onboarding`, `Dashboard`
- Wrapped section rendering and onboarding view with `Suspense` boundaries.
- File: `frontend/src/pages/Index.tsx`

## Before / after measurements

### Baseline (before split)
Source: `qa-evidence/phase4/p4-04/2026-02-19/build-before.txt`

- `assets/index-BRiJ2iXW.js`: 874.32 kB raw / 242.21 kB gzip
- Build warning emitted: chunk > 500 kB
- Build time: 9.16s

### After split
Source: `qa-evidence/phase4/p4-04/2026-02-19/build-after.txt`

- `assets/index--ZAkcxI_.js`: 376.35 kB raw / 114.32 kB gzip
- `assets/ReleaseDetail-CQuzPXsf.js`: 102.11 kB raw / 23.72 kB gzip
- `assets/ContentCreator-vkK6XChq.js`: 27.97 kB raw / 7.84 kB gzip
- No chunk-size warning emitted
- Build time: 8.24s

### Net improvement
- Entry chunk raw size reduced by **497.97 kB** (**56.96%**)
- Entry chunk gzip size reduced by **127.89 kB** (**52.80%**)
- Removed oversized-chunk warning from production build output

## Validation gates
- `npm run build --workspace frontend` -> PASS
- `npx tsc --noEmit --project frontend/tsconfig.json` -> PASS
- `npm run typecheck:backend` -> PASS
- `npx eslint frontend/src/App.tsx frontend/src/pages/Index.tsx --config frontend/eslint.config.js` -> PASS

## Conclusion
P4-04 objectives are satisfied for this chunk:
- explicit bundle budgets are defined
- highest-impact route/module code splitting is implemented
- before/after measurements show material startup payload reduction and elimination of the prior 500 kB warning
