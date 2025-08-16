# All Access Artist - Project Structure v2.1.0

**PROPRIETARY SOFTWARE** - Copyright (c) 2025 Brennan Wesley Tharaldson. All Rights Reserved.

## Project Overview

This is a monorepo containing the All Access Artist music industry management platform. As of version 2.0.0, this software is proprietary and protected under copyright law. Current version 2.1.0 as of 8/16/25.

## Directory Structure

```
all-access-artist/
├── frontend/                 # React frontend application
│   ├── src/                 # Source code
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility libraries
│   ├── public/             # Static assets
│   ├── package.json        # Frontend dependencies
│   ├── vite.config.ts      # Vite configuration
│   ├── tailwind.config.ts  # Tailwind CSS configuration
│   └── tsconfig*.json      # TypeScript configuration
│
├── backend/                 # Hono backend on Render
│   ├── src/                # Source code
│   │   ├── routes/         # API route handlers
│   │   ├── services/       # Business logic services
│   │   ├── middleware/     # Authentication & CORS middleware
│   │   ├── types/          # TypeScript type definitions
│   │   └── worker.ts       # Main application entry point
│   ├── package.json        # Backend dependencies
│   └── tsconfig.json       # TypeScript configuration
│
├── package.json            # Root monorepo configuration
├── License.md              # Proprietary license
├── README.md               # Original project README
├── README_FullStackDev.md  # Technical architecture documentation
└── README_ProjectStructure.md # This file
```

## Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: TailwindCSS + shadcn/ui
- **State Management**: React Query
- **Routing**: React Router
- **Hosting**: Vercel

### Backend
- **Runtime**: Render (Node.js)
- **Framework**: Hono
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT with Supabase Auth
- **Storage**: Supabase Storage

## Development Commands

### Root Level Commands
```bash
# Install all dependencies
npm install

# Start frontend development server
npm run dev
npm run dev:frontend

# Start backend development server
npm run dev:backend

# Build frontend for production
npm run build
npm run build:frontend

# Deploy backend to Render
npm run deploy:backend

# Lint frontend code
npm run lint
```

### Frontend Workspace Commands
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend Workspace Commands
```bash
cd backend
npm run dev          # Start local development server
npm run build        # Build for production
npm run start        # Start production server
# Deployment handled via GitHub → Render integration
```

## Version History

- **v2.1.0** (8/16/25) - Enhanced release management and backend migration
  - Migrated backend from Cloudflare Workers to Render (Node.js + Hono)
  - Fixed release details page data structure and task completion
  - Added mixtape release type support with 12-item checklist
  - Implemented comprehensive CORS policy with PATCH method support
  - Enhanced diagnostic logging and error handling
  - Resolved all TypeScript compilation and deployment issues

- **v2.0.0** - Proprietary release with monorepo structure
  - Reorganized codebase into frontend/backend workspaces
  - Implemented proprietary licensing
  - Added Cloudflare Workers backend foundation
  - Updated to enterprise-grade architecture

## License

This software is proprietary and confidential. See `License.md` for full terms.

**NOTICE**: As of version 2.0.0, this software is no longer open source. All rights reserved.

## Contact

For licensing inquiries: Brennan Wesley Tharaldson at brennan.tharaldson@gmail.com
