# All Access Artist - Database Documentation

*Last Updated: August 19, 2025 - v2.8.0*

## Overview

The All Access Artist platform uses **Supabase** (PostgreSQL 16.x) as its primary database with comprehensive Row Level Security (RLS) policies. Following the August 19, 2025 migration, the database now uses a simplified `user_id`-based authentication system with enhanced security and data isolation.

**Database Status**: ✅ **Fully Configured & Operational**  
**Authentication**: ✅ **Migrated to user_id-only system**  
**Security**: ✅ **Updated RLS policies for direct user authentication**  
**Data Isolation**: ✅ **Strict user-scoped access enforced**

---

## Database Architecture

### Core Tables (9)
**Primary Tables:**
1. **`music_releases`** - Track and album management with user authentication
2. **`release_tasks`** - Project checklist and task management
3. **`songs`** - Individual track information and metadata
4. **`lyric_sheets`** - Lyric management and organization
5. **`lyric_sheet_sections`** - Structured lyric content by section
6. **`task_templates`** - Predefined task templates for release types
7. **`user_profiles`** - User profile information and settings

**Legacy Tables (Optional):**
8. **`artist_profiles`** - Optional artist metadata (not required for core functionality)
9. **`audit_log`** - Database change tracking and forensics

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
**Purpose**: Track and album management with direct user authentication  
**Records**: Active | **RLS**: ✅ Updated for user_id | **Authentication**: Direct user_id

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | ❌ | `gen_random_uuid()` | Primary key |
| `user_id` | uuid | ❌ | null | Direct user authentication |
| `title` | varchar | ❌ | null | Release title |
| `release_type` | varchar | ❌ | null | single/ep/album/mixtape |
| `status` | varchar | ❌ | `'draft'` | draft/scheduled/released |
| `release_date` | date | ✅ | null | Official release date |
| `genre` | varchar | ✅ | null | Music genre |
| `description` | text | ✅ | null | Release description |
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
    ├── release_tasks
    ├── songs
    ├── lyric_sheets
    └── lyric_sheet_sections
```

### Foreign Key Constraints (Current)
- `music_releases.user_id` → `auth.users.id`
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

## Migration History (v2.8.0 - August 19, 2025)

### ✅ Completed Migrations
1. **`make_artist_id_nullable_in_release_tasks`** - Made artist_id nullable in release_tasks
2. **`add_unique_constraint_to_task_templates`** - Added unique constraint on release_type
3. **`update_release_tasks_rls_policy_for_user_id`** - Updated RLS to use user_id directly
4. **`make_artist_id_nullable_in_songs_table`** - Made artist_id nullable in songs
5. **`update_songs_rls_policy_for_user_id`** - Updated songs RLS policy
6. **`fix_lyric_sheets_schema_and_rls`** - Fixed lyric sheets schema and RLS policies

### ✅ Current Status
- **Authentication System**: Fully migrated to user_id-only system
- **RLS Policies**: All updated for direct user authentication
- **Data Isolation**: Complete user data separation enforced
- **Platform Functionality**: All features operational (releases, tasks, songs, lyrics)
- **Security**: Enhanced with simplified, vulnerability-free authentication

### 🎯 Database Architecture Benefits
1. **Simplified Security**: Direct user authentication eliminates complex lookups
2. **Enhanced Performance**: Reduced query complexity with direct user_id filtering
3. **Improved Maintainability**: Cleaner codebase without artist_id dependencies
4. **Vulnerability Elimination**: Removed potential security issues from intermediate lookups
5. **Backward Compatibility**: Nullable artist_id columns preserve legacy data

---

## Connection Information

**Database Type**: PostgreSQL 16.x (Supabase)  
**Environment**: Production  
**Access Method**: Supabase Client with RLS  
**API Integration**: Via Hono backend with JWT authentication  

**Backend API Endpoints**:
- `GET/POST /api/artists` - Artist profile management
- `GET/POST /api/releases` - Music release management
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
**Purpose**: Individual track management  
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

#### lyric_sheets & lyric_sheet_sections
**Purpose**: Lyric management system  
**Authentication**: `user_id = auth.uid()`

**lyric_sheets**: Main lyric sheet records  
**lyric_sheet_sections**: Individual lyric sections (verse, chorus, etc.)

---

*Last Updated: August 19, 2025 - v2.8.0*  
*Database Version: PostgreSQL 16.x via Supabase*  
*Authentication: Migrated to user_id-only system*  
*Documentation Status: Updated for v2.8.0 migration*