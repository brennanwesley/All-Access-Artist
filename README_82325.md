# Split Sheet Implementation Build Strategy

*Created: August 23, 2025*  
*Status: Planning Phase*

## Overview

This document outlines the comprehensive build strategy for implementing Split Sheet functionality in the All Access Artist platform. The approach prioritizes zero risk to existing Label Copy functionality while building robust, independent Split Sheet capabilities.

## Core Requirements

### Business Logic
- **Song-level Split Sheets**: Each song can have its own split sheet
- **Dual Percentage Validation**: Writer shares = 100%, Publisher shares = 100% (separately)
- **Maximum 20 contributors** per split sheet
- **Read-only/Edit modes** similar to Label Copy pattern
- **Auto-save functionality** every 3 seconds during editing
- **Session storage** for unsaved changes protection

### Technical Constraints
- **Zero risk** to existing releases and Label Copy data
- **Independent database table** (no complex foreign keys)
- **Component separation** to reduce MetadataPrep.tsx complexity
- **Minimal API failure points**

---

## Database Implementation

### New Table Schema
```sql
CREATE TABLE split_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  release_id UUID,                     -- NULLABLE, no FK constraint
  song_title VARCHAR NOT NULL,
  song_aka VARCHAR,
  artist_name VARCHAR NOT NULL,
  album_project VARCHAR,
  date_created DATE,
  song_length VARCHAR,                 -- MM:SS format
  studio_location VARCHAR,
  additional_notes TEXT,
  contributors JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT max_contributors CHECK (jsonb_array_length(contributors) <= 20)
);
```

### JSONB Contributors Structure
```json
[
  {
    "legal_name": "John Doe",
    "stage_name": "JD",
    "role": "writer",
    "contribution": "lyrics, melody",
    "writer_share_percent": 50.00,
    "publisher_share_percent": 50.00,
    "contact": {
      "email": "john@example.com",
      "phone": "+1234567890",
      "address": "123 Main St, City, State"
    },
    "pro_affiliation": "ASCAP",
    "ipi_number": "123456789",
    "publisher": {
      "company_name": "John Doe Publishing",
      "pro_affiliation": "ASCAP",
      "ipi_number": "987654321",
      "contact": {...}
    }
  }
]
```

### RLS Policy
```sql
CREATE POLICY "Users can manage their own split sheets" 
ON split_sheets FOR ALL 
USING (auth.uid() = user_id);
```

---

## Component Architecture

### Directory Structure
```
frontend/src/components/
├── MetadataPrep.tsx (main orchestrator)
├── split-sheet/
│   ├── index.ts
│   ├── SongSelector.tsx
│   ├── SplitSheetForm.tsx
│   ├── ContributorRow.tsx
│   ├── PercentageValidator.tsx
│   └── hooks/
│       ├── useSplitSheet.ts
│       ├── useContributors.ts
│       └── usePercentageValidation.ts
```

### Key Components

#### SongSelector.tsx
- Header: "To create your split sheet begin by selecting which song or track."
- Dropdown populated from release songs
- Continue button (disabled until selection)

#### SplitSheetForm.tsx
- Song information section
- Dynamic contributors section (up to 20)
- Percentage validation display
- Auto-save functionality
- Read-only/edit mode toggle

#### ContributorRow.tsx
- Individual contributor form fields
- Role dropdown with expanded options
- Real-time percentage validation
- Add/remove contributor functionality

### Contributor Roles
```typescript
const CONTRIBUTOR_ROLES = [
  "writer", "co-writer", "lyricist", "composer", 
  "producer", "arranger", "beat-maker"
];
```

---

## API Implementation

### Endpoints
```typescript
GET    /api/splitsheets/song/:songId     // Get split sheet for song
PUT    /api/splitsheets/song/:songId     // Upsert split sheet
DELETE /api/splitsheets/song/:songId     // Delete split sheet
```

### Zod Validation Schema
```typescript
const SplitSheetSchema = z.object({
  song_title: z.string().min(1),
  release_id: z.string().uuid().optional(),
  contributors: z.array(ContributorSchema).max(20),
  // Application-level percentage validation only
});

const ContributorSchema = z.object({
  legal_name: z.string().min(1),
  stage_name: z.string().optional(),
  role: z.enum(CONTRIBUTOR_ROLES),
  writer_share_percent: z.number().min(0).max(100),
  publisher_share_percent: z.number().min(0).max(100),
  // ... additional fields
});
```

---

## User Experience Flow

### Split Sheet Creation
1. User clicks "Split Sheet" from MetadataPrep
2. SongSelector renders with song dropdown
3. User selects song → SplitSheetForm renders
4. Form loads in read-only mode if existing data
5. User clicks "Edit Split Sheet" → editing mode
6. Auto-save begins (3-second intervals)
7. Real-time percentage validation
8. Save → return to read-only mode

### Percentage Validation
- **Real-time display**: Writer Total: 85% ⚠️, Publisher Total: 100% ✓
- **Save prevention**: Button disabled until both totals = 100%
- **Visual indicators**: Red/green status for each percentage type

### Auto-Save Pattern
```typescript
// Session storage key: splitSheet_${songId}
// 3-second interval during editing mode
// Browser warning on navigation with unsaved changes
// Same pattern as Label Copy implementation
```

---

## Implementation Phases

### Phase 1: Database & Backend (Zero Risk)
1. Create `split_sheets` table
2. Add backend API routes
3. Implement Zod validation schemas
4. Test API endpoints independently

### Phase 2: Component Development (Zero Risk)
1. Create `components/split-sheet/` directory
2. Build SongSelector component
3. Build SplitSheetForm component
4. Build ContributorRow component
5. Implement percentage validation logic
6. Add auto-save functionality

### Phase 3: Integration (Controlled Risk)
1. Create SplitSheetTemplate wrapper
2. Test new components independently
3. Import into MetadataPrep.tsx
4. **Extensive Label Copy testing**
5. Remove old Split Sheet code only after confirmation

### Phase 4: Refinement
1. User experience improvements
2. Performance optimizations
3. Additional validation enhancements

---

## Risk Mitigation

### Data Safety
- **No modifications** to existing tables
- **No foreign key constraints** that could cause failures
- **Nullable release_id** to prevent blocking issues
- **Fresh start** with Split Sheet data (no migration)

### Code Safety
- **Component separation** before MetadataPrep modifications
- **Incremental integration** with rollback points
- **Extensive testing** of Label Copy after each change
- **Small, focused commits** for easy rollbacks

### API Safety
- **Simple validation** (no complex database constraints)
- **Application-level** percentage validation
- **Independent endpoints** (no shared logic with existing APIs)

---

## Success Criteria

### Functional Requirements
- ✅ Users can create split sheets for individual songs
- ✅ Dual percentage validation (Writer + Publisher = 100% each)
- ✅ Support for up to 20 contributors per split sheet
- ✅ Read-only/edit mode functionality
- ✅ Auto-save with session storage protection
- ✅ Song selection workflow

### Technical Requirements
- ✅ Zero impact on existing Label Copy functionality
- ✅ Clean component architecture
- ✅ Robust API with proper validation
- ✅ Secure user-scoped data access
- ✅ Maintainable codebase structure

### Performance Requirements
- ✅ Fast loading of existing split sheet data
- ✅ Responsive percentage validation
- ✅ Efficient auto-save operations
- ✅ Minimal impact on MetadataPrep.tsx performance

---

## Future Enhancements

### Export Functionality
- PDF generation (to be implemented later)
- Email distribution system
- Digital signature collection

### Advanced Features
- Split sheet templates
- Bulk contributor import
- Integration with PRO databases
- Collaboration workflows

---

## Notes

This strategy prioritizes stability and maintainability over feature completeness. Each phase can be tested independently, and the modular approach allows for easy pivoting if requirements change during implementation.

The key principle: **Never risk existing functionality for new features.**