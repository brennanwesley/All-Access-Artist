# All Access Artist - Database Documentation

*Last Updated: August 21, 2025 - v3.0.0*

## Overview

The All Access Artist platform uses **Supabase** (PostgreSQL 16.x) as its primary database with comprehensive Row Level Security (RLS) policies. Following the August 19, 2025 migration, the database now uses a simplified `user_id`-based authentication system with enhanced security and data isolation.

**Database Status**: ✅ **Fully Configured & Operational**  
**Authentication**: ✅ **Migrated to user_id-only system**  
**Security**: ✅ **Updated RLS policies for direct user authentication**  
**Data Isolation**: ✅ **Strict user-scoped access enforced**

---

## Database Architecture

### Core Tables (13)
**Primary Tables:**
1. **`music_releases`** - Track and album management with enhanced Label Copy metadata
2. **`release_tasks`** - Project checklist and task management
3. **`songs`** - Individual track information with comprehensive Label Copy fields
4. **`label_copy`** - Dedicated Label Copy metadata storage (release-level)
5. **`lyric_sheets`** - Lyric management and organization
6. **`lyric_sheet_sections`** - Structured lyric content by section
7. **`split_sheets`** - Professional split sheet management (song-level)
8. **`split_sheet_writers`** - Comprehensive contributor and writer information
9. **`split_sheet_publishers`** - Publisher entity management and contact details
10. **`task_templates`** - Predefined task templates for release types
11. **`user_profiles`** - User profile information and settings

**Legacy Tables (Optional):**
12. **`artist_profiles`** - Optional artist metadata (not required for core functionality)
13. **`audit_log`** - Database change tracking and forensics

### Authentication Architecture
- **Direct user authentication**: Core tables use `user_id` columns that reference `auth.uid()` directly
- **No foreign key dependencies**: Tables don't have formal FK constraints to `user_profiles`
- **RLS enforcement**: Security handled via RLS policies using `user_id = auth.uid()`
- **Simplified security**: No intermediate lookups through artist profiles
- **User isolation**: Strict RLS policies ensure complete data separation

---

## Table Schemas

### 1. artist_profiles
**Purpose**: Central artist profile management with social media integration  
**Records**: 0 | **RLS**: ✅ Enabled | **Size**: 48 kB

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | ❌ | `gen_random_uuid()` | Primary key |
| `user_id` | uuid | ✅ | null | Links to auth.users (unique) |
| `artist_name` | varchar | ❌ | null | Public artist name |
| `real_name` | varchar | ✅ | null | Real/legal name |
| `bio` | text | ✅ | null | Artist biography |
| `genre` | varchar | ✅ | null | Primary music genre |
| `location` | varchar | ✅ | null | Geographic location |
| `website_url` | varchar | ✅ | null | Official website |
| `spotify_url` | varchar | ✅ | null | Spotify artist profile |
| `apple_music_url` | varchar | ✅ | null | Apple Music profile |
| `youtube_url` | varchar | ✅ | null | YouTube channel |
| `instagram_url` | varchar | ✅ | null | Instagram profile |
| `tiktok_url` | varchar | ✅ | null | TikTok profile |
| `twitter_url` | varchar | ✅ | null | Twitter/X profile |
| `profile_image_url` | varchar | ✅ | null | Profile picture URL |
| `banner_image_url` | varchar | ✅ | null | Banner/header image URL |
| `is_public` | boolean | ✅ | `true` | Public profile visibility |
| `email_notifications` | boolean | ✅ | `true` | Email notification preference |
| `created_at` | timestamptz | ✅ | `now()` | Record creation timestamp |
| `updated_at` | timestamptz | ✅ | `now()` | Last update timestamp |

**RLS Policies**:
- ✅ Users can manage their own artist profile (`auth.uid() = user_id`)
- ✅ Users can view public artist profiles (`is_public = true`)

---

### 1. music_releases
**Purpose**: Track and album management with comprehensive Label Copy metadata  
**Records**: Active | **RLS**: ✅ Updated for user_id | **Authentication**: Direct user_id

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | ❌ | `gen_random_uuid()` | Primary key |
| `user_id` | uuid | ❌ | null | Direct user authentication |
| `title` | varchar | ❌ | null | Release title |
| `release_type` | varchar | ❌ | null | single/ep/album/mixtape |
| `status` | varchar | ❌ | `'draft'` | draft/scheduled/released |
| `release_date` | date | ✅ | null | Official release date |
| `genre` | varchar | ✅ | null | Primary music genre |
| `description` | text | ✅ | null | Release description |
| **Label Copy Fields** | | | | **Professional metadata** |
| `version_subtitle` | text | ✅ | null | Version info (Deluxe, Remixes, etc.) |
| `phonogram_copyright` | text | ✅ | null | ℗ Line copyright holder |
| `composition_copyright` | text | ✅ | null | © Line copyright holder |
| `sub_genre` | text | ✅ | null | Specific genre classification |
| `territories` | text[] | ✅ | null | Distribution regions array |
| `explicit_content` | boolean | ✅ | `false` | Content rating flag |
| `language_lyrics` | text | ✅ | `'en'` | Primary language code |
| `songwriters` | text | ✅ | null | Songwriter credits |
| `producers` | text | ✅ | null | Producer credits |
| `copyright_year` | integer | ✅ | null | Copyright year |
| `track_description` | text | ✅ | null | Release description |
| `created_at` | timestamptz | ✅ | `now()` | Record creation timestamp |
| `updated_at` | timestamptz | ✅ | `now()` | Last update timestamp |

**RLS Policies**:
- ✅ Users can manage their own releases (`user_id = auth.uid()`)
- ✅ Simplified security with direct user authentication

---

### 3. royalty_data
**Purpose**: Financial tracking and royalty management  
**Records**: 0 | **RLS**: ✅ Enabled | **Size**: 48 kB

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | ❌ | `gen_random_uuid()` | Primary key |
| `artist_id` | uuid | ✅ | null | Foreign key to artist_profiles |
| `platform` | varchar | ❌ | null | Streaming platform name |
| `release_id` | uuid | ✅ | null | Optional link to music_releases |
| `period_start` | date | ❌ | null | Royalty period start |
| `period_end` | date | ❌ | null | Royalty period end |
| `total_streams` | bigint | ✅ | `0` | Total stream count |
| `total_revenue` | numeric(10,2) | ✅ | `0.00` | Total revenue earned |
| `revenue_per_stream` | numeric(8,6) | ✅ | `0.000000` | Average per-stream rate |
| `currency` | varchar(3) | ✅ | `'USD'` | Currency code (ISO 4217) |
| `payout_status` | varchar | ✅ | `'pending'` | pending/processing/paid |
| `payout_date` | date | ✅ | null | Date of payout |
| `created_at` | timestamptz | ✅ | `now()` | Record creation timestamp |
| `updated_at` | timestamptz | ✅ | `now()` | Last update timestamp |

**RLS Policies**:
- ✅ Artists can manage their own royalty data (via artist_id lookup)
- ✅ Artists can view their own royalty data (via artist_id lookup)

---

### 4. content_calendar
**Purpose**: Social media content planning and performance tracking  
**Records**: 0 | **RLS**: ✅ Enabled | **Size**: 48 kB

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | ❌ | `gen_random_uuid()` | Primary key |
| `artist_id` | uuid | ✅ | null | Foreign key to artist_profiles |
| `title` | varchar | ❌ | null | Content title |
| `content_type` | varchar | ❌ | null | post/story/video/live |
| `platform` | varchar | ❌ | null | Social media platform |
| `scheduled_date` | timestamptz | ❌ | null | Scheduled publish time |
| `status` | varchar | ✅ | `'draft'` | draft/scheduled/published |
| `content_text` | text | ✅ | null | Post content/caption |
| `media_urls` | jsonb | ✅ | null | Array of media file URLs |
| `hashtags` | jsonb | ✅ | null | Array of hashtags |
| `target_audience` | varchar | ✅ | null | Target demographic |
| `call_to_action` | varchar | ✅ | null | CTA type |
| `published_at` | timestamptz | ✅ | null | Actual publish timestamp |
| `likes` | integer | ✅ | `0` | Like count |
| `comments` | integer | ✅ | `0` | Comment count |
| `shares` | integer | ✅ | `0` | Share count |
| `engagement_rate` | numeric(5,4) | ✅ | `0.0000` | Engagement percentage |
| `brand_pillar` | varchar | ✅ | null | Brand pillar category |
| `created_at` | timestamptz | ✅ | `now()` | Record creation timestamp |
| `updated_at` | timestamptz | ✅ | `now()` | Last update timestamp |

**RLS Policies**:
- ✅ Artists can manage their own content calendar (via artist_id lookup)

---

### 5. fan_analytics
**Purpose**: Comprehensive audience insights and engagement metrics  
**Records**: 0 | **RLS**: ✅ Enabled | **Size**: 48 kB

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | ❌ | `gen_random_uuid()` | Primary key |
| `artist_id` | uuid | ✅ | null | Foreign key to artist_profiles |
| `platform` | varchar | ❌ | null | Analytics platform |
| `total_followers` | integer | ✅ | `0` | Total follower count |
| `total_monthly_listeners` | integer | ✅ | `0` | Monthly listener count |
| `top_countries` | jsonb | ✅ | null | Top countries by audience |
| `top_cities` | jsonb | ✅ | null | Top cities by audience |
| `age_demographics` | jsonb | ✅ | null | Age distribution data |
| `gender_demographics` | jsonb | ✅ | null | Gender distribution data |
| `avg_engagement_rate` | numeric(5,4) | ✅ | `0.0000` | Average engagement rate |
| `total_plays` | bigint | ✅ | `0` | Total play count |
| `total_saves` | bigint | ✅ | `0` | Total save count |
| `total_shares` | bigint | ✅ | `0` | Total share count |
| `follower_growth_rate` | numeric(5,4) | ✅ | `0.0000` | Follower growth percentage |
| `monthly_listener_growth` | numeric(5,4) | ✅ | `0.0000` | Listener growth percentage |
| `period_start` | date | ❌ | null | Analytics period start |
| `period_end` | date | ❌ | null | Analytics period end |
| `created_at` | timestamptz | ✅ | `now()` | Record creation timestamp |
| `updated_at` | timestamptz | ✅ | `now()` | Last update timestamp |

**RLS Policies**:
- ✅ Artists can view their own fan analytics (via artist_id lookup)

---

## Database Relationships (Updated Architecture)

```
auth.users (Supabase Auth)
    ↓ (user_id - direct authentication)
    ├── music_releases
    ├── label_copy
    ├── release_tasks
    ├── songs
    ├── lyric_sheets
    └── lyric_sheet_sections
```

### Foreign Key Constraints (Current)
- `music_releases.user_id` → `auth.users.id`
- `label_copy.user_id` → `auth.users.id`
- `label_copy.release_id` → `music_releases.id`
- `release_tasks.user_id` → `auth.users.id`
- `songs.user_id` → `auth.users.id`
- `lyric_sheets.user_id` → `auth.users.id`
- `lyric_sheet_sections.user_id` → `auth.users.id`
- `release_tasks.release_id` → `music_releases.id`
- `songs.release_id` → `music_releases.id`

### Legacy Constraints (Optional)
- `artist_profiles.user_id` → `auth.users.id` (ON DELETE RESTRICT)
- `user_profiles.id` → `auth.users.id` (ON DELETE RESTRICT)

---

## Security Implementation (Updated v2.8.0)

### Row Level Security (RLS) - Direct User Authentication
All core tables use simplified RLS policies with direct user authentication:

**Current RLS Policies:**
- `music_releases`: `user_id = auth.uid()`
- `label_copy`: `user_id = auth.uid()`
- `release_tasks`: `user_id = auth.uid()`
- `songs`: `user_id = auth.uid()`
- `lyric_sheets`: `user_id = auth.uid()`
- `lyric_sheet_sections`: `user_id = auth.uid()`

**Security Enhancements:**
- **Direct Authentication**: No intermediate lookups through artist profiles
- **Complete Data Isolation**: Users can only access their own data
- **Simplified Policies**: Reduced complexity and improved performance
- **Vulnerability Elimination**: Removed fragile artist_id dependencies

### Authentication Integration
- Uses Supabase Auth JWT tokens with `auth.uid()` function
- Backend validates JWT on all `/api/*` endpoints via Hono middleware
- User-scoped Supabase client enforces RLS automatically
- Nullable `artist_id` columns maintain backward compatibility

---

## Database Extensions

### Installed Extensions
- ✅ **uuid-ossp**: UUID generation for primary keys
- ✅ **pgcrypto**: Cryptographic functions
- ✅ **pg_stat_statements**: Query performance tracking
- ✅ **pg_graphql**: GraphQL API support
- ✅ **supabase_vault**: Secure secrets management

### Available Extensions (Not Installed)
- **postgis**: Geospatial data support
- **pg_cron**: Scheduled job execution
- **vector**: Vector embeddings for AI features
- **pgjwt**: JWT token handling

---

## Migration History

### ✅ v3.0.0 - August 21, 2025 (Label Copy & Split Sheet Implementation)
1. **`extend_music_releases_for_label_copy`** - Added 7 Label Copy fields to music_releases
2. **`extend_songs_table_for_label_copy`** - Added 7 Label Copy fields to songs table
3. **`modify_split_sheets_to_song_level`** - Migrated split_sheets from release-level to song-level
4. **`enhance_split_sheet_writers_comprehensive`** - Added 12 comprehensive contributor fields
5. **`create_split_sheet_publishers_table`** - Created publisher entity management table
6. **`update_split_sheet_rls_policies`** - Updated RLS for song-level access control
7. **`fix_split_sheets_song_id_not_null`** - Made song_id NOT NULL in split_sheets
8. **`add_percentage_validation_constraints`** - Added CHECK constraints for percentage fields
9. **`add_track_level_isrc_language_fields`** - Added ISRC and language fields to songs
10. **`rename_date_created_to_sheet_created_at`** - Renamed for clarity
11. **`add_performance_indexes_foreign_keys`** - Added 8 performance indexes

### ✅ v2.8.0 - August 19, 2025 (Authentication Migration)
1. **`make_artist_id_nullable_in_release_tasks`** - Made artist_id nullable in release_tasks
2. **`add_unique_constraint_to_task_templates`** - Added unique constraint on release_type
3. **`update_release_tasks_rls_policy_for_user_id`** - Updated RLS to use user_id directly
4. **`make_artist_id_nullable_in_songs_table`** - Made artist_id nullable in songs
5. **`update_songs_rls_policy_for_user_id`** - Updated songs RLS policy
6. **`fix_lyric_sheets_schema_and_rls`** - Fixed lyric sheets schema and RLS policies

### ✅ Current Status (v3.0.0)
- **Authentication System**: Fully migrated to user_id-only system
- **RLS Policies**: All updated for direct user authentication + song-level split sheet access
- **Data Isolation**: Complete user data separation enforced
- **Platform Functionality**: All features operational (releases, tasks, songs, lyrics, split sheets)
- **Security**: Enhanced with simplified, vulnerability-free authentication
- **Professional Features**: Label Copy and Split Sheet systems fully implemented
- **Data Integrity**: Percentage validation constraints and foreign key integrity enforced
- **Performance**: Optimized with comprehensive indexing on foreign keys

### 🎯 Database Architecture Benefits
1. **Professional Music Industry Support**: Complete Label Copy and Split Sheet workflows
2. **Song-Level Granularity**: Split sheets linked to individual tracks for precise management
3. **Comprehensive Contributor Tracking**: Full contact info, PRO affiliations, and signature tracking
4. **Data Integrity**: CHECK constraints prevent invalid percentage values
5. **Enhanced Performance**: Strategic indexing on all foreign key relationships
6. **Simplified Security**: Direct user authentication eliminates complex lookups
7. **Vulnerability Elimination**: Removed potential security issues from intermediate lookups
8. **Backward Compatibility**: Nullable artist_id columns preserve legacy data

---

## Connection Information

**Database Type**: PostgreSQL 16.x (Supabase)  
**Environment**: Production  
**Access Method**: Supabase Client with RLS  
**API Integration**: Via Hono backend on Render with JWT authentication  

**Backend API Endpoints** (Render hosting):
- `GET/POST /api/artists` - Artist profile management
- `GET/POST /api/releases` - Music release management
- `PUT/GET/DELETE /api/labelcopy` - Label Copy metadata management
- `GET/POST /api/analytics` - Fan analytics data
- `GET/POST /api/calendar` - Content calendar management
- `GET/POST /api/royalty` - Royalty data management

---

### Additional Tables

#### release_tasks
**Purpose**: Project checklist and task management  
**Authentication**: `user_id = auth.uid()`

| Key Columns | Type | Description |
|-------------|------|-------------|
| `id` | uuid | Primary key |
| `release_id` | uuid | Links to music_releases |
| `user_id` | uuid | Direct user authentication |
| `artist_id` | uuid (nullable) | Legacy compatibility |
| `task_description` | text | Task content |
| `task_order` | integer | Display order |
| `completed_at` | timestamptz | Completion timestamp |

#### songs
**Purpose**: Individual track management (minimal schema)  
**Authentication**: `user_id = auth.uid()`

| Key Columns | Type | Description |
|-------------|------|-------------|
| `id` | uuid | Primary key |
| `release_id` | uuid | Links to music_releases |
| `user_id` | uuid | Direct user authentication |
| `artist_id` | uuid (nullable) | Legacy compatibility |
| `song_title` | text | Track title |
| `track_number` | integer | Track position |
| `duration_seconds` | integer | Track duration |

#### label_copy
**Purpose**: Dedicated Label Copy metadata storage (release-level)  
**Authentication**: `user_id = auth.uid()`

| Key Columns | Type | Description |
|-------------|------|-------------|
| `id` | uuid | Primary key |
| `release_id` | uuid | Links to music_releases |
| `user_id` | uuid | Direct user authentication |
| `version_subtitle` | text | Release version info |
| `phonogram_copyright` | text | ℗ Line copyright holder |
| `composition_copyright` | text | © Line copyright holder |
| `sub_genre` | text | Specific genre classification |
| `territories` | text[] | Distribution regions array |
| `explicit_content` | boolean | Content rating flag |
| `language_lyrics` | text | Primary language code |
| `tracks_metadata` | jsonb | Track-level Label Copy data array |

#### split_sheets
**Purpose**: Professional split sheet management (song-level)  
**Authentication**: `user_id = auth.uid()` with song ownership validation

| Key Columns | Type | Description |
|-------------|------|-------------|
| `id` | uuid | Primary key |
| `song_id` | uuid (NOT NULL) | Links to songs table |
| `user_id` | uuid | Direct user authentication |
| `song_title` | text | Denormalized song title |
| `release_title` | text | Denormalized release title |
| `aka_titles` | text[] | Alternate song titles array |
| `creation_location` | text | Studio/location of creation |
| `sample_use_clause` | text | Sample clearance agreements |
| `agreement_date` | date | Split sheet agreement date |
| `is_signed` | boolean | Digital signature status |
| `sheet_created_at` | date | Sheet creation date |

#### split_sheet_writers
**Purpose**: Comprehensive contributor and writer information  
**Authentication**: `user_id = auth.uid()`

| Key Columns | Type | Description |
|-------------|------|-------------|
| `id` | uuid | Primary key |
| `split_sheet_id` | uuid | Links to split_sheets |
| `user_id` | uuid | Direct user authentication |
| `legal_name` | text (NOT NULL) | Full legal name |
| `stage_name` | text | Professional/performance name |
| `mailing_address` | text | Full contact address |
| `phone_number` | text | Contact phone |
| `email_address` | text | Contact email |
| `pro_affiliation` | text | ASCAP, BMI, SESAC, etc. |
| `ipi_cae_number` | text | International songwriter ID |
| `contribution_description` | text | What they contributed |
| `writers_share_percentage` | numeric | Writer's royalty share (0-100%) |
| `publishers_share_percentage` | numeric | Publisher's royalty share (0-100%) |
| `split_percentage` | numeric | Total ownership percentage (0-100%) |
| `signature_date` | timestamptz | Digital signature timestamp |
| `signature_ip_address` | inet | IP address for signature tracking |

**Constraints**: CHECK constraints ensure all percentage fields are between 0-100%

#### split_sheet_publishers
**Purpose**: Publisher entity management and contact details  
**Authentication**: `user_id = auth.uid()`

| Key Columns | Type | Description |
|-------------|------|-------------|
| `id` | uuid | Primary key |
| `writer_id` | uuid | Links to split_sheet_writers |
| `user_id` | uuid | Direct user authentication |
| `company_name` | text (NOT NULL) | Legal publishing company name |
| `pro_affiliation` | text | Publisher's PRO registration |
| `ipi_cae_number` | text | Publisher's international ID |
| `contact_address` | text | Business address |
| `contact_phone` | text | Business phone |
| `contact_email` | text | Business email |

#### lyric_sheets & lyric_sheet_sections
**Purpose**: Lyric management system  
**Authentication**: `user_id = auth.uid()`

**lyric_sheets**: Main lyric sheet records  
**lyric_sheet_sections**: Individual lyric sections (verse, chorus, etc.)

---

*Last Updated: August 21, 2025 - v3.0.0*  
*Database Version: PostgreSQL 16.x via Supabase*  
*Authentication: Migrated to user_id-only system*  
*Professional Features: Label Copy & Split Sheet systems implemented*  
*Documentation Status: Updated for v3.0.0 Label Copy & Split Sheet implementation*