# Backend Deployment Configuration

## Overview
This backend uses **isolated dependency management** to prevent workspace lockfile conflicts and ensure stable deployments.

## Architecture
- **Isolated Dependencies**: Backend has its own `package-lock.json` with only essential dependencies
- **Workspace Isolation**: `.npmrc` prevents npm from resolving to root workspace lockfile
- **Security Compliant**: Minimal attack surface with only required packages

## Dependencies
### Production
- `hono: ^3.12.0` - Web framework for Cloudflare Workers
- `@supabase/supabase-js: ^2.39.0` - Supabase client
- `zod: ^3.22.0` - Schema validation
- `@hono/zod-validator: ^0.2.0` - Hono Zod integration

### Development
- `@cloudflare/workers-types: ^4.20240208.0` - TypeScript types
- `@types/node: ^20.11.0` - Node.js types
- `typescript: ^5.3.0` - TypeScript compiler
- `wrangler: ^3.28.0` - Cloudflare Workers CLI

## Deployment Process
1. **Cloudflare Workers** clones repository to `/backend` directory
2. **npm ci** uses isolated `package-lock.json` (493 packages vs 328KB root lockfile)
3. **Build** compiles TypeScript to JavaScript
4. **Deploy** to Cloudflare edge network

## Maintenance
- **Dependency Updates**: Run `npm update` in `/backend` directory only
- **Security Audits**: Run `npm audit` in `/backend` directory
- **Lockfile Sync**: Regenerate with `npm install --package-lock-only`

## Benefits
- ✅ **Fast Deployments**: Minimal dependencies (493 vs 607+ packages)
- ✅ **Security**: No frontend dependencies in backend deployment
- ✅ **Stability**: Frontend changes don't affect backend builds
- ✅ **Compliance**: Aligns with All Access Artist security standards

## Troubleshooting
If deployment fails:
1. Verify `package-lock.json` exists in `/backend`
2. Check `.npmrc` configuration is present
3. Run `npm ci` locally to test dependency resolution
4. Ensure no workspace resolution conflicts

---
**Last Updated**: August 6, 2025
**Version**: 2.0.0 - Backend Dependency Isolation
