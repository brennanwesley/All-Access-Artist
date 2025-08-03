# All Access Artist - Project Structure v2.0.0

**PROPRIETARY SOFTWARE** - Copyright (c) 2025 Brennan Wesley Tharaldson. All Rights Reserved.

## Project Overview

This is a monorepo containing the All Access Artist music industry management platform. As of version 2.0.0, this software is proprietary and protected under copyright law.

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
├── backend/                 # Cloudflare Workers backend
│   ├── src/                # Source code
│   │   └── index.ts        # Main worker entry point
│   ├── package.json        # Backend dependencies
│   ├── wrangler.toml       # Cloudflare Workers configuration
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
- **Runtime**: Cloudflare Workers
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
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

# Deploy backend to Cloudflare
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
npm run dev          # Start Wrangler development server
npm run deploy       # Deploy to production
npm run deploy:staging    # Deploy to staging
npm run deploy:production # Deploy to production
```

## Version History

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
