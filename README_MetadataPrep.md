# MetadataPrep.tsx - Comprehensive Database Schema Analysis

## Executive Summary

After thoroughly analyzing the 531-line MetadataPrep.tsx component, this document provides a complete breakdown of all data fields required to support the three core metadata management features: **Split Sheet**, **Lyric Sheet**, and **Label Copy**. The component implements sophisticated forms for music industry metadata management, requiring multiple database tables to store structured data effectively.

## Component Architecture Overview

The MetadataPrep component uses a state-driven template system with four views:
- **Main Dashboard** (`activeTemplate: "main"`) - Template selection interface
- **Label Copy Template** (`activeTemplate: "labelCopy"`) - Lines 24-142
- **Lyric Sheet Template** (`activeTemplate: "lyricSheet"`) - Lines 145-280  
- **Split Sheet Template** (`activeTemplate: "splitSheet"`) - Lines 283-454

Each template contains comprehensive form fields that require persistent database storage for user data management.

---

## 1. Split Sheet Database Schema

### Primary Table: `split_sheets`

**Purpose**: Document songwriter credits and publishing split percentages for legal and royalty distribution purposes.

| Column Name | Data Type | Constraints | Description | Source Line |
|-------------|-----------|-------------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier for split sheet | System |
| `artist_id` | UUID | FOREIGN KEY REFERENCES artist_profiles(id) | Owner of the split sheet | System |
| `song_title` | VARCHAR(255) | NOT NULL | Official song title | Line 312 |
| `artist_name` | VARCHAR(255) | NOT NULL | Primary artist name | Line 316 |
| `album_project` | VARCHAR(255) | NULL | Album or project name | Line 323 |
| `date_created` | DATE | NULL | Date when split sheet was created | Line 327 |
| `additional_notes` | TEXT | NULL | Additional terms, agreements, or notes | Line 430 |
| `total_percentage_check` | DECIMAL(5,2) | NULL | Validation field to ensure splits = 100% | Calculated |
| `status` | VARCHAR(50) | DEFAULT 'draft' | Status: draft, pending, signed, finalized | System |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Record creation timestamp | System |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Record update timestamp | System |

### Related Table: `split_sheet_writers`

**Purpose**: Store individual writer credits and percentage splits (one-to-many relationship with split_sheets).

| Column Name | Data Type | Constraints | Description | Source Line |
|-------------|-----------|-------------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier for writer entry | System |
| `split_sheet_id` | UUID | FOREIGN KEY REFERENCES split_sheets(id) ON DELETE CASCADE | Parent split sheet | System |
| `writer_legal_name` | VARCHAR(255) | NOT NULL | Full legal name of writer | Line 348 |
| `writer_role` | VARCHAR(100) | NOT NULL | Role: writer, co-writer, producer | Lines 356-358 |
| `split_percentage` | DECIMAL(5,2) | NOT NULL, CHECK (split_percentage >= 0 AND split_percentage <= 100) | Percentage of publishing rights | Line 363 |
| `publisher_pro_info` | VARCHAR(255) | NULL | Publisher or PRO (Performance Rights Organization) | Line 366 |
| `writer_order` | INTEGER | NOT NULL | Order of writers in the split sheet | System |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Record creation timestamp | System |

### Additional Tables for Split Sheet Enhancement:

#### `split_sheet_signatures` (Future Enhancement)
| Column Name | Data Type | Constraints | Description | Source Line |
|-------------|-----------|-------------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique signature identifier | System |
| `split_sheet_id` | UUID | FOREIGN KEY | Parent split sheet | System |
| `writer_id` | UUID | FOREIGN KEY | Writer who signed | System |
| `signature_date` | TIMESTAMP | NOT NULL | When signature was completed | Line 449 |
| `signature_method` | VARCHAR(50) | NOT NULL | Method: electronic, physical, docusign | Line 449 |
| `ip_address` | INET | NULL | IP address of signer | System |

---

## 2. Lyric Sheet Database Schema

### Primary Table: `lyric_sheets`

**Purpose**: Store structured lyric sheets with proper song sections and performance notes.

| Column Name | Data Type | Constraints | Description | Source Line |
|-------------|-----------|-------------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier for lyric sheet | System |
| `artist_id` | UUID | FOREIGN KEY REFERENCES artist_profiles(id) | Owner of the lyric sheet | System |
| `song_title` | VARCHAR(255) | NOT NULL | Official song title | Line 174 |
| `written_by` | VARCHAR(500) | NOT NULL | Writer names (comma-separated) | Line 178 |
| `additional_notes` | TEXT | NULL | Performance notes, vocal directions, etc. | Line 265 |
| `total_sections` | INTEGER | DEFAULT 0 | Count of song sections | Calculated |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Record creation timestamp | System |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Record update timestamp | System |

### Related Table: `lyric_sheet_sections`

**Purpose**: Store individual song sections with lyrics (one-to-many relationship with lyric_sheets).

| Column Name | Data Type | Constraints | Description | Source Line |
|-------------|-----------|-------------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier for section | System |
| `lyric_sheet_id` | UUID | FOREIGN KEY REFERENCES lyric_sheets(id) ON DELETE CASCADE | Parent lyric sheet | System |
| `section_type` | VARCHAR(50) | NOT NULL | Section type from predefined list | Lines 194-200 |
| `section_lyrics` | TEXT | NOT NULL | Actual lyrics for this section | Lines 204, 225, 247 |
| `section_order` | INTEGER | NOT NULL | Order of sections in the song | System |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Record creation timestamp | System |

### Enum/Check Constraint for `section_type`:
```sql
CHECK (section_type IN ('verse', 'chorus', 'pre-chorus', 'bridge', 'refrain', 'outro', 'intro'))
```
**Source**: Lines 194-200, 216-222, 238-244

### Additional Enhancement Table: `lyric_sheet_templates` (Future)
| Column Name | Data Type | Constraints | Description | Source Line |
|-------------|-----------|-------------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Template identifier | System |
| `artist_id` | UUID | FOREIGN KEY | Template owner | System |
| `template_name` | VARCHAR(255) | NOT NULL | User-defined template name | System |
| `default_sections` | JSONB | NOT NULL | Default section structure | Lines 186-258 |

---

## 3. Label Copy Database Schema

### Primary Table: `label_copy_sheets`

**Purpose**: Store comprehensive label copy with all required metadata fields for DSP distribution.

| Column Name | Data Type | Constraints | Description | Source Line |
|-------------|-----------|-------------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique identifier for label copy | System |
| `artist_id` | UUID | FOREIGN KEY REFERENCES artist_profiles(id) | Owner of the label copy | System |
| `track_title` | VARCHAR(255) | NOT NULL | Official track title | Line 50 |
| `artist_name` | VARCHAR(255) | NOT NULL | Primary artist name | Line 54 |
| `album_ep_title` | VARCHAR(255) | NULL | Album or EP title | Line 60 |
| `track_number` | INTEGER | NULL | Track number in album/EP | Line 64 |
| `track_duration` | VARCHAR(10) | NOT NULL | Track duration (MM:SS format) | Line 70 |
| `primary_genre` | VARCHAR(100) | NOT NULL | Primary genre classification | Lines 76-86 |
| `songwriters_composers` | TEXT | NOT NULL | Songwriter and composer credits | Line 98 |
| `producers` | TEXT | NULL | Producer credits | Line 104 |
| `record_label` | VARCHAR(255) | NULL | Record label name | Line 110 |
| `copyright_year` | INTEGER | NOT NULL | Copyright year | Line 114 |
| `isrc_code` | VARCHAR(15) | NULL | International Standard Recording Code | Line 120 |
| `track_description` | TEXT | NULL | Promotional track description | Line 127 |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Record creation timestamp | System |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Record update timestamp | System |

### Enum/Check Constraint for `primary_genre`:
```sql
CHECK (primary_genre IN ('pop', 'rock', 'hip-hop', 'electronic', 'indie', 'country', 'r&b', 'folk'))
```
**Source**: Lines 78-85

### Additional Enhancement Tables for Label Copy:

#### `label_copy_additional_credits` (Future Enhancement)
| Column Name | Data Type | Constraints | Description | Source Line |
|-------------|-----------|-------------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique credit identifier | System |
| `label_copy_id` | UUID | FOREIGN KEY | Parent label copy | System |
| `credit_type` | VARCHAR(100) | NOT NULL | Type: mixer, engineer, featured_artist, etc. | System |
| `credit_name` | VARCHAR(255) | NOT NULL | Name of credited person | System |
| `credit_role` | VARCHAR(255) | NULL | Specific role description | System |

#### `label_copy_metadata_versions` (Version Control)
| Column Name | Data Type | Constraints | Description | Source Line |
|-------------|-----------|-------------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Version identifier | System |
| `label_copy_id` | UUID | FOREIGN KEY | Parent label copy | System |
| `version_number` | INTEGER | NOT NULL | Version number | System |
| `version_data` | JSONB | NOT NULL | Complete metadata snapshot | System |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Version creation timestamp | System |

---

## Cross-Component Integration Tables

### 1. `metadata_projects`

**Purpose**: Link all three metadata types to a single music project/release.

| Column Name | Data Type | Constraints | Description | Source |
|-------------|-----------|-------------|-------------|---------|
| `id` | UUID | PRIMARY KEY | Unique project identifier | System |
| `artist_id` | UUID | FOREIGN KEY | Project owner | System |
| `release_id` | UUID | FOREIGN KEY REFERENCES music_releases(id) | Associated release | System |
| `project_name` | VARCHAR(255) | NOT NULL | Project name | System |
| `label_copy_id` | UUID | FOREIGN KEY REFERENCES label_copy_sheets(id) | Associated label copy | System |
| `lyric_sheet_id` | UUID | FOREIGN KEY REFERENCES lyric_sheets(id) | Associated lyric sheet | System |
| `split_sheet_id` | UUID | FOREIGN KEY REFERENCES split_sheets(id) | Associated split sheet | System |
| `status` | VARCHAR(50) | DEFAULT 'draft' | Project status | System |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Record creation timestamp | System |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Record update timestamp | System |

### 2. `metadata_exports`

**Purpose**: Track PDF exports and sharing history for all metadata types.

| Column Name | Data Type | Constraints | Description | Source Line |
|-------------|-----------|-------------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Export identifier | System |
| `artist_id` | UUID | FOREIGN KEY | Export owner | System |
| `metadata_type` | VARCHAR(50) | NOT NULL | Type: label_copy, lyric_sheet, split_sheet | Lines 137, 275, 448 |
| `metadata_id` | UUID | NOT NULL | ID of exported metadata | System |
| `export_format` | VARCHAR(20) | DEFAULT 'pdf' | Export format | Lines 137, 275, 448 |
| `export_url` | TEXT | NULL | URL of exported file | System |
| `exported_at` | TIMESTAMP | DEFAULT NOW() | Export timestamp | System |

---

## Database Indexes for Performance

### Recommended Indexes:

```sql
-- Split Sheets
CREATE INDEX idx_split_sheets_artist_id ON split_sheets(artist_id);
CREATE INDEX idx_split_sheets_song_title ON split_sheets(song_title);
CREATE INDEX idx_split_sheet_writers_split_sheet_id ON split_sheet_writers(split_sheet_id);

-- Lyric Sheets  
CREATE INDEX idx_lyric_sheets_artist_id ON lyric_sheets(artist_id);
CREATE INDEX idx_lyric_sheets_song_title ON lyric_sheets(song_title);
CREATE INDEX idx_lyric_sheet_sections_lyric_sheet_id ON lyric_sheet_sections(lyric_sheet_id);
CREATE INDEX idx_lyric_sheet_sections_order ON lyric_sheet_sections(lyric_sheet_id, section_order);

-- Label Copy
CREATE INDEX idx_label_copy_sheets_artist_id ON label_copy_sheets(artist_id);
CREATE INDEX idx_label_copy_sheets_track_title ON label_copy_sheets(track_title);
CREATE INDEX idx_label_copy_sheets_genre ON label_copy_sheets(primary_genre);

-- Cross-Component
CREATE INDEX idx_metadata_projects_artist_id ON metadata_projects(artist_id);
CREATE INDEX idx_metadata_projects_release_id ON metadata_projects(release_id);
CREATE INDEX idx_metadata_exports_artist_id ON metadata_exports(artist_id);
CREATE INDEX idx_metadata_exports_type_id ON metadata_exports(metadata_type, metadata_id);
```

---

## Row Level Security (RLS) Policies

### Security Implementation:

```sql
-- Enable RLS on all metadata tables
ALTER TABLE split_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE split_sheet_writers ENABLE ROW LEVEL SECURITY;
ALTER TABLE lyric_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE lyric_sheet_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE label_copy_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE metadata_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE metadata_exports ENABLE ROW LEVEL SECURITY;

-- Create policies for user data access
CREATE POLICY "Users can only access their own split sheets" ON split_sheets
    FOR ALL USING (artist_id = auth.uid());

CREATE POLICY "Users can only access their own lyric sheets" ON lyric_sheets
    FOR ALL USING (artist_id = auth.uid());

CREATE POLICY "Users can only access their own label copy" ON label_copy_sheets
    FOR ALL USING (artist_id = auth.uid());

-- Similar policies for all related tables...
```

---

## API Endpoint Requirements

### Required Backend Endpoints:

#### Split Sheet Endpoints:
- `GET /api/split-sheets` - List user's split sheets
- `POST /api/split-sheets` - Create new split sheet
- `GET /api/split-sheets/:id` - Get specific split sheet with writers
- `PUT /api/split-sheets/:id` - Update split sheet
- `DELETE /api/split-sheets/:id` - Delete split sheet
- `POST /api/split-sheets/:id/writers` - Add writer to split sheet
- `PUT /api/split-sheets/:id/writers/:writerId` - Update writer info
- `DELETE /api/split-sheets/:id/writers/:writerId` - Remove writer
- `POST /api/split-sheets/:id/export` - Export to PDF

#### Lyric Sheet Endpoints:
- `GET /api/lyric-sheets` - List user's lyric sheets
- `POST /api/lyric-sheets` - Create new lyric sheet
- `GET /api/lyric-sheets/:id` - Get specific lyric sheet with sections
- `PUT /api/lyric-sheets/:id` - Update lyric sheet
- `DELETE /api/lyric-sheets/:id` - Delete lyric sheet
- `POST /api/lyric-sheets/:id/sections` - Add section to lyric sheet
- `PUT /api/lyric-sheets/:id/sections/:sectionId` - Update section
- `DELETE /api/lyric-sheets/:id/sections/:sectionId` - Remove section
- `POST /api/lyric-sheets/:id/export` - Export to PDF

#### Label Copy Endpoints:
- `GET /api/label-copy` - List user's label copy sheets
- `POST /api/label-copy` - Create new label copy
- `GET /api/label-copy/:id` - Get specific label copy
- `PUT /api/label-copy/:id` - Update label copy
- `DELETE /api/label-copy/:id` - Delete label copy
- `POST /api/label-copy/:id/export` - Export to PDF

---

## Frontend Integration Points

### Form State Management:

The component uses React state for form management, but should integrate with:

1. **React Hook Form** - For form validation and state management
2. **Zod Schemas** - For client-side and server-side validation
3. **TanStack Query** - For API state management and caching
4. **Toast Notifications** - For user feedback (already implemented in line 18-22)

### Key Integration Areas:

#### Save Functionality (Lines 16-22):
```typescript
const handleSave = () => {
  toast({
    title: "Saved Successfully",
    description: "Your metadata has been saved to your project.",
  });
};
```
**Database Impact**: Requires API calls to persist form data to respective tables.

#### Export Functionality (Lines 137, 275, 448):
- "Export to PDF" buttons require backend PDF generation
- Should create records in `metadata_exports` table
- May require file storage integration (AWS S3, Cloudflare R2, etc.)

#### Dynamic Section Management:
- **Add Section** (Line 256) - Requires dynamic form field management
- **Add Writer** (Line 421) - Requires dynamic writer field management
- Both need proper database persistence for added items

---

## Data Validation Requirements

### Client-Side Validation (Zod Schemas):

```typescript
// Split Sheet Schema
const splitSheetSchema = z.object({
  songTitle: z.string().min(1, "Song title is required"),
  artistName: z.string().min(1, "Artist name is required"),
  albumProject: z.string().optional(),
  dateCreated: z.string().optional(),
  writers: z.array(z.object({
    legalName: z.string().min(1, "Writer name is required"),
    role: z.enum(["writer", "co-writer", "producer"]),
    splitPercentage: z.number().min(0).max(100),
    publisherPro: z.string().optional()
  })).min(1, "At least one writer is required"),
  additionalNotes: z.string().optional()
});

// Lyric Sheet Schema  
const lyricSheetSchema = z.object({
  songTitle: z.string().min(1, "Song title is required"),
  writtenBy: z.string().min(1, "Writer information is required"),
  sections: z.array(z.object({
    sectionType: z.enum(["verse", "chorus", "pre-chorus", "bridge", "refrain", "outro", "intro"]),
    lyrics: z.string().min(1, "Lyrics are required for each section")
  })).min(1, "At least one section is required"),
  additionalNotes: z.string().optional()
});

// Label Copy Schema
const labelCopySchema = z.object({
  trackTitle: z.string().min(1, "Track title is required"),
  artistName: z.string().min(1, "Artist name is required"),
  albumEpTitle: z.string().optional(),
  trackNumber: z.number().optional(),
  trackDuration: z.string().min(1, "Track duration is required"),
  primaryGenre: z.enum(["pop", "rock", "hip-hop", "electronic", "indie", "country", "r&b", "folk"]),
  songwritersComposers: z.string().min(1, "Songwriter information is required"),
  producers: z.string().optional(),
  recordLabel: z.string().optional(),
  copyrightYear: z.number().min(1900).max(new Date().getFullYear() + 1),
  isrcCode: z.string().optional(),
  trackDescription: z.string().optional()
});
```

### Server-Side Validation:
- All Zod schemas should be shared between frontend and backend
- Database constraints should enforce data integrity
- Split percentage validation should ensure totals equal 100%

---

## Implementation Priority & Phases

### Phase 1: Core Database Schema (Week 1)
1. Create all primary tables with basic columns
2. Implement RLS policies
3. Add essential indexes
4. Test basic CRUD operations

### Phase 2: API Development (Week 2)
1. Implement all CRUD endpoints
2. Add validation middleware with Zod
3. Test API functionality
4. Implement error handling

### Phase 3: Frontend Integration (Week 3)
1. Replace mock save functionality with API calls
2. Implement form validation with React Hook Form + Zod
3. Add loading states and error handling
4. Test end-to-end functionality

### Phase 4: Advanced Features (Week 4)
1. PDF export functionality
2. Email sharing capabilities
3. Version control for metadata
4. Advanced search and filtering

---

## Conclusion

The MetadataPrep.tsx component requires a comprehensive database schema with **7 primary tables** and **multiple supporting tables** to fully support the three metadata management features. The analysis reveals:

- **Split Sheets**: 2 core tables + 1 enhancement table
- **Lyric Sheets**: 2 core tables + 1 enhancement table  
- **Label Copy**: 1 core table + 2 enhancement tables
- **Cross-Component**: 2 integration tables

**Total Database Objects Required:**
- **11 Tables** (7 primary + 4 enhancement)
- **15+ Indexes** for performance optimization
- **7+ RLS Policies** for data security
- **25+ API Endpoints** for full functionality

The implementation should follow a phased approach, starting with core functionality and gradually adding advanced features like PDF export, version control, and collaborative editing capabilities.