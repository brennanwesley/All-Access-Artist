# All Access Artist - Database Documentation

## Overview

The All Access Artist platform uses **Supabase** (PostgreSQL 16.x) as its primary database with comprehensive Row Level Security (RLS) policies. The database is designed to support a complete music industry management platform with artist profiles, music releases, royalty tracking, content calendar management, and fan analytics.

**Database Status**: ✅ **Fully Configured & Operational**  
**Current Data**: ❌ **Empty (0 records in all tables)**  
**Security**: ✅ **RLS Enabled on All Tables**  
**Extensions**: ✅ **Essential Extensions Installed**

---

## Database Architecture

### Core Tables (5)
1. **`artist_profiles`** - Central artist information and social media links
2. **`music_releases`** - Track and album management with streaming platform data
3. **`royalty_data`** - Financial tracking and royalty management
4. **`content_calendar`** - Social media content planning and scheduling
5. **`fan_analytics`** - Audience insights and engagement metrics

### Relationships
- All tables link to `artist_profiles` via `artist_id` foreign key
- `artist_profiles` links to Supabase Auth via `user_id`
- Cascading relationships ensure data integrity

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

### 2. music_releases
**Purpose**: Track and album management with streaming platform integration  
**Records**: 0 | **RLS**: ✅ Enabled | **Size**: 48 kB

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | ❌ | `gen_random_uuid()` | Primary key |
| `artist_id` | uuid | ✅ | null | Foreign key to artist_profiles |
| `title` | varchar | ❌ | null | Release title |
| `release_type` | varchar | ❌ | null | single/album/EP |
| `status` | varchar | ❌ | `'draft'` | draft/scheduled/released |
| `release_date` | date | ✅ | null | Official release date |
| `genre` | varchar | ✅ | null | Music genre |
| `duration_seconds` | integer | ✅ | `0` | Total duration in seconds |
| `track_count` | integer | ✅ | `1` | Number of tracks |
| `cover_art_url` | varchar | ✅ | null | Album/single artwork URL |
| `spotify_url` | varchar | ✅ | null | Spotify release URL |
| `apple_music_url` | varchar | ✅ | null | Apple Music URL |
| `youtube_url` | varchar | ✅ | null | YouTube URL |
| `description` | text | ✅ | null | Release description |
| `tags` | jsonb | ✅ | null | Searchable tags array |
| `created_at` | timestamptz | ✅ | `now()` | Record creation timestamp |
| `updated_at` | timestamptz | ✅ | `now()` | Last update timestamp |

**RLS Policies**:
- ✅ Artists can manage their own releases (via artist_id lookup)
- ✅ Users can view released music (`status = 'released'`)

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

## Database Relationships

```
auth.users (Supabase Auth)
    ↓ (user_id)
artist_profiles
    ↓ (artist_id)
    ├── music_releases
    ├── royalty_data
    ├── content_calendar
    └── fan_analytics
```

### Foreign Key Constraints
- `artist_profiles.user_id` → `auth.users.id`
- `music_releases.artist_id` → `artist_profiles.id`
- `royalty_data.artist_id` → `artist_profiles.id`
- `content_calendar.artist_id` → `artist_profiles.id`
- `fan_analytics.artist_id` → `artist_profiles.id`

---

## Security Implementation

### Row Level Security (RLS)
All tables have RLS enabled with comprehensive policies:

**Artist-Owned Data**: Users can only access data linked to their artist profiles
**Public Data**: Released music and public profiles are viewable by all users
**Private Data**: Royalty data and analytics are strictly private to the artist

### Authentication Integration
- Uses Supabase Auth JWT tokens
- Backend validates JWT on all `/api/*` endpoints
- User-scoped Supabase client enforces RLS automatically

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

## Current Status & Next Steps

### ✅ Completed
- Database schema fully designed and deployed
- All tables created with proper constraints
- RLS policies implemented and tested
- Foreign key relationships established
- Essential extensions installed

### ❌ Pending
- **Data Population**: All tables are currently empty (0 records)
- **Sample Data**: No test/demo data available
- **Data Migration**: No existing data to migrate
- **Performance Optimization**: No indexes beyond primary keys

### 🎯 Immediate Priorities
1. **Create Sample Data**: Populate tables with realistic test data
2. **Performance Tuning**: Add indexes for common query patterns
3. **Data Validation**: Test all CRUD operations through API
4. **Backup Strategy**: Implement automated backup procedures

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

*Last Updated: August 8, 2025*  
*Database Version: PostgreSQL 16.x via Supabase*  
*Documentation Status: Complete*