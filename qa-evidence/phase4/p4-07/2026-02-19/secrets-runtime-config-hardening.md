# P4-07 Secrets + Runtime Config Hardening

- Date (UTC): 2026-02-19
- Scope: Runtime config boundaries, hardcoded-secret scan, least-privilege key mapping, and key rotation/rollback documentation
- Tester: Cascade (assisted)
- Environment: local workspace validation (frontend build/tsc + backend typecheck/tests)

## 1) Hardcoded secret and magic-config audit

### Secret-pattern scan
Searched the codebase for common leaked secret signatures and private-key material (`sk_live`, `pk_live`, `AKIA...`, private key blocks, GitHub token prefixes).

Result: **No hardcoded secret values found in source files.**

### High-risk magic-config findings
1. Frontend API client used a hardcoded production fallback URL (`https://all-access-artist.onrender.com`) when `VITE_API_URL` was missing.
2. Frontend error fallback used `process.env.NODE_ENV` in browser code, crossing Node/Vite env boundaries.

## 2) Remediations implemented

### A. Enforced explicit frontend API runtime binding in production
- File: `frontend/src/lib/api.ts`
- Change:
  - Added `resolveApiBaseUrl()`.
  - Requires `VITE_API_URL` in production (throws early if missing).
  - Uses a local-only development fallback (`http://localhost:3000`) with warning logging.
- Security impact:
  - Prevents silent routing of authenticated traffic to an unintended hardcoded production endpoint.

### B. Corrected frontend env boundary usage
- File: `frontend/src/components/auth/ErrorFallback.tsx`
- Change:
  - Replaced `process.env['NODE_ENV'] === 'development'` with `import.meta.env.DEV`.
- Security/runtime impact:
  - Keeps frontend runtime config on the Vite boundary (`import.meta.env`) and avoids Node-global leakage assumptions in browser code.

## 3) Least-privilege key usage review (route-class map)

| Runtime / Route Class | Allowed key class | Current posture |
| --- | --- | --- |
| Frontend (`frontend/src/**`) | `VITE_*` public keys only | Conformant after env-boundary fix |
| Backend user-scoped routes (`/api/calendar`, `/api/profile`, etc.) | Supabase anon key + user JWT (RLS) | Conformant (P4-06 remediated) |
| Backend privileged operations (`/api/admin`, `/api/onboarding`, `/api/webhooks`, rate limiting middleware) | Service-role key only where operationally required | Conformant; service-role retained only for privileged paths |

## 4) Sensitive key rotation and rollback procedure

### Supabase keys
1. Generate replacement key in Supabase project settings.
2. Update Render environment bindings:
   - `SUPABASE_SERVICE_KEY` (backend only)
   - `SUPABASE_ANON_KEY` (backend auth middleware usage, frontend publishable equivalent via `VITE_SUPABASE_ANON_KEY`)
3. Redeploy backend/frontend.
4. Validate auth-protected endpoints and webhook/admin flows.
5. Rollback path: restore previous key in Render/Vercel env bindings and redeploy if auth failures are detected.

### Stripe keys
1. Rotate in Stripe Dashboard:
   - `STRIPE_SECRET_KEY` (backend only)
   - `STRIPE_WEBHOOK_SECRET` (backend webhook verification)
2. Update Render env bindings and redeploy backend.
3. Validate checkout creation + webhook signature verification.
4. Rollback path: re-activate previous restricted key (if still available) and redeploy while incident triage completes.

### n8n webhook credentials
1. Rotate platform webhook tokens/URLs in n8n.
2. Update backend env bindings (`N8N_*`) and redeploy.
3. Validate `/api/social/connect` for all configured platforms.
4. Rollback path: restore previous `N8N_*` bindings and redeploy.

## 5) Validation gates

- `npm run build --workspace frontend` -> PASS
- `npx tsc --noEmit --project frontend/tsconfig.json` -> PASS
- `npm run typecheck:backend` -> PASS
- `npm run test --workspace backend` -> PASS

## Conclusion

P4-07 controls are satisfied for this chunk:
- hardcoded secret scan completed with no leaked credential literals,
- frontend/backend runtime config boundary issues were remediated,
- least-privilege key usage is explicitly mapped by route/runtime,
- key rotation + rollback operations are documented with deployment-safe steps.
