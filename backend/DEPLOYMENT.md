# Backend Deployment Configuration

## Overview
This backend uses **isolated dependency management** to prevent workspace lockfile conflicts and ensure stable deployments on Render.

## Architecture
- **Isolated Dependencies**: Backend has its own `package-lock.json` with only essential dependencies
- **Workspace Isolation**: `.npmrc` prevents npm from resolving to root workspace lockfile
- **Security Compliant**: Minimal attack surface with only required packages
- **Render Deployment**: Node.js server with Hono framework

## Dependencies
### Production
- `hono: ^4.0.0` - Web framework for Node.js
- `@hono/node-server: ^1.8.0` - Node.js server adapter
- `@supabase/supabase-js: ^2.39.0` - Supabase client
- `zod: ^3.22.0` - Schema validation
- `@hono/zod-validator: ^0.4.0` - Hono Zod integration

### Development
- `@types/node: ^20.11.0` - Node.js types
- `typescript: ^5.3.0` - TypeScript compiler
- `tsx: ^4.7.0` - TypeScript execution for development

## Deployment Process
1. **Render** clones repository to `/backend` directory
2. **npm ci** uses isolated `package-lock.json`
3. **Build** compiles TypeScript to JavaScript with `npm run build`
4. **Deploy** starts Node.js server with `npm start`

## Maintenance
- **Dependency Updates**: Run `npm update` in `/backend` directory only
- **Security Audits**: Run `npm audit` in `/backend` directory
- **Lockfile Sync**: Regenerate with `npm install --package-lock-only`

## Benefits
- ✅ **Fast Deployments**: Minimal dependencies, optimized for Render
- ✅ **Security**: No frontend dependencies in backend deployment
- ✅ **Stability**: Frontend changes don't affect backend builds
- ✅ **Compliance**: Aligns with All Access Artist security standards
- ✅ **Render Integration**: Seamless Node.js deployment

## Troubleshooting
If Render deployment fails:
1. Verify `package-lock.json` exists in `/backend`
2. Check `.npmrc` configuration is present
3. Run `npm ci` locally to test dependency resolution
4. Ensure no workspace resolution conflicts
5. Check Render build logs for TypeScript compilation errors

---
**Last Updated**: August 31, 2025
**Version**: 2.1.0 - Render Deployment with Node.js
