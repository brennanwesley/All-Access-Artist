# Feature Spec: The Content Creator

## 1. Overview & Vision
The **Content Creator** (formerly Content Planner) is a cornerstone feature of the All Access Artist platform. It is designed to be an artist's central hub for ideation, creation, and scheduling of all their promotional content.

The vision is to move beyond a simple calendar and create an **AI-powered co-creation suite**. It solves two of the biggest problems for an artist: the creative "blank page" problem and the logistical challenge of organizing a content schedule. By integrating powerful AI tools for both idea and media generation, this feature empowers artists to *make art* and connect with their audience more effectively, which is a massive selling point for users and investors.

## 2. Core User Stories
* **As an artist,** I want to plan and schedule my social media posts on a calendar so I can stay organized and consistent.
* **As an artist,** I want to get AI-powered ideas for posts related to my music so I can overcome creative block.
* **As an artist,** I want to upload my own photos and logos to a central library so I can maintain my brand identity across my content.
* **As an artist,** I want to generate new, unique images based on my own likeness and brand assets to use in my promotions.

## 3. Feature Breakdown & Phased Rollout

### Phase 1: MVP + Wow Factor (Lead with Magic)
This phase combines essential utility with immediate differentiation through AI image generation.
* **Content Calendar CRUD:** A fully functional calendar view where artists can manually create, view, update, and delete content posts for specific dates and social platforms.
* **AI Idea Assistant:** A simple, high-impact button that calls a text-based AI to generate a list of relevant post ideas for a specific release.
* **Basic Brand Kit:** Simplified asset management allowing artists to upload 3-5 core visual assets (headshots, logos, artwork) via Supabase Storage.
* **AI Image Generation:** Direct API integration for text-to-image generation with Brand Kit reference support. Synchronous generation with loading states for immediate wow factor.
* **User Onboarding Flow:** Guided tutorial to generate first promotional image in 30 seconds with pre-written template prompts.

### Phase 2: Advanced Features & Optimization
This phase enhances the core functionality with advanced capabilities.
* **Asynchronous Job Handling:** Migrate to n8n workflow for complex AI operations and better scalability.
* **Advanced Brand Kit:** Enhanced asset management with categorization, versioning, and bulk uploads.
* **Template Marketplace:** User-generated prompt templates and sharing capabilities.
* **Usage Analytics:** Track generation patterns and prompt effectiveness.
* **Quality Tiers:** Fast/Standard/High-quality generation options with credit system.

### Phase 3: Platform Ecosystem
* **AI Video Generation:** Short-form and long-form video generation capabilities.
* **Direct Social Media Publishing:** Native posting to Instagram, TikTok, Twitter, and YouTube.
* **Performance Analytics:** Comprehensive engagement tracking and ROI measurement.
* **Community Features:** Content sharing, collaboration tools, and viral mechanics.
* **Advanced AI Models:** Custom model training on user's brand assets for personalized generation.

## 4. Technical Architecture

### 4.1. Database Schema (Supabase/PostgreSQL)
We will use a unified content storage approach with three new tables, following the user_id-based authentication pattern.

**`generated_content` (Primary Content Storage):**
* `id`: (uuid, pk)
* `user_id`: (uuid, NOT NULL) - Direct user authentication via auth.uid()
* `release_id`: (uuid, fk to `music_releases`, nullable) - Link to specific campaign
* `content_type`: (varchar, NOT NULL) - 'image', 'video_short', 'video_long', 'audio'
* `content_category`: (varchar) - 'promotional', 'behind_scenes', 'cover', 'lifestyle'
* `generation_method`: (varchar, NOT NULL) - 'ai_generated', 'user_uploaded', 'template'
* `prompt_text`: (text) - AI prompt used for generation
* `source_asset_id`: (uuid, fk to `artist_assets`, nullable) - Brand Kit reference
* `storage_provider`: (varchar, default 'supabase') - 'supabase', 'gdrive'
* `storage_path`: (text, NOT NULL) - File path or ID
* `file_name`: (varchar) - Original filename
* `file_size_bytes`: (bigint) - File size for storage management
* `mime_type`: (varchar) - Content type for proper handling
* `metadata`: (jsonb) - Content-specific data (dimensions, duration, AI model, etc.)
* `usage_count`: (integer, default 0) - Track content reuse
* `last_used_at`: (timestamptz) - Last usage timestamp
* `created_at`: (timestamptz, default now())
* `updated_at`: (timestamptz, default now())

**`artist_assets` (Brand Kit Storage):**
* `id`: (uuid, pk)
* `user_id`: (uuid, NOT NULL) - Direct user authentication
* `asset_name`: (varchar, NOT NULL) - User-defined name
* `asset_type`: (varchar, NOT NULL) - 'headshot', 'logo', 'artwork', 'background'
* `storage_provider`: (varchar, default 'supabase')
* `storage_path`: (text, NOT NULL) - File location
* `file_size_bytes`: (bigint) - Storage tracking
* `mime_type`: (varchar) - File type validation
* `is_active`: (boolean, default true) - Soft delete capability
* `created_at`: (timestamptz, default now())

**`generation_jobs` (Async Processing Tracking):**
* `id`: (uuid, pk)
* `user_id`: (uuid, NOT NULL) - Direct user authentication
* `job_type`: (varchar, NOT NULL) - 'image_generation', 'video_generation'
* `job_status`: (varchar, default 'pending') - 'pending', 'processing', 'completed', 'failed'
* `input_prompt`: (text, NOT NULL) - Generation prompt
* `source_asset_id`: (uuid, fk to `artist_assets`, nullable) - Brand Kit reference
* `result_content_id`: (uuid, fk to `generated_content`, nullable) - Generated content link
* `error_message`: (text, nullable) - Failure details
* `created_at`: (timestamptz, default now())
* `completed_at`: (timestamptz, nullable) - Job completion time

**`content_calendar` (Modified - Content Scheduling):**
* `id`: (uuid, pk)
* `user_id`: (uuid, NOT NULL) - Direct user authentication
* `release_id`: (uuid, fk to `music_releases`, nullable) - Campaign link
* `generated_content_id`: (uuid, fk to `generated_content`, nullable) - Associated media
* `post_text`: (text) - Caption or post content
* `platform`: (varchar) - 'instagram', 'tiktok', 'twitter', 'youtube'
* `content_pillar`: (varchar) - 'upcoming', 'new_songs', 'covers', 'lifestyle'
* `status`: (varchar, default 'draft') - 'draft', 'scheduled', 'posted'
* `scheduled_at`: (timestamptz, nullable) - Publish time
* `posted_at`: (timestamptz, nullable) - Actual post time
* `engagement_data`: (jsonb, nullable) - Likes, comments, shares tracking
* `created_at`: (timestamptz, default now())
* `updated_at`: (timestamptz, default now())

**RLS Policies (All Tables):**
```sql
CREATE POLICY "Users manage own content" ON [table_name]
  FOR ALL USING (user_id = auth.uid());
```

### 4.2. Backend API & Services (Hono/Node.js)
The backend will require several new modular route files and services following our established patterns.

**Phase 1 Endpoints (Simplified):**
* **Content Calendar (`/api/content-calendar`):** Standard CRUD endpoints for managing calendar entries with generated content associations.
* **AI Idea Assistant (`/api/ai/ideas`):** POST endpoint accepting release context and returning structured idea lists from OpenAI/Claude.
* **Brand Kit (`/api/assets`):** CRUD endpoints for `artist_assets` with Supabase Storage integration and signed URL generation.
* **Generated Content (`/api/content`):** CRUD endpoints for `generated_content` with metadata handling and usage tracking.
* **AI Image Generation (`/api/generate/image`):** POST endpoint for direct AI API calls with synchronous response handling.

**Phase 2 Endpoints (Advanced):**
* **Job Management (`/api/jobs/:jobId`):** GET endpoint for async job status polling.
* **Webhook Handler (`/webhooks/n8n/completion`):** Internal endpoint for n8n workflow completion callbacks.
* **Template Marketplace (`/api/templates`):** CRUD endpoints for sharing and discovering prompt templates.
* **Analytics (`/api/analytics/content`):** GET endpoints for usage patterns and generation statistics.

**Service Layer Architecture:**
* **ContentService:** Business logic for content CRUD operations and metadata management.
* **AIService:** Abstraction layer for multiple AI providers (OpenAI, Stability AI, etc.).
* **AssetService:** Brand Kit management with storage provider abstraction.
* **GenerationService:** Orchestrates AI generation workflows and job tracking.
* **AnalyticsService:** Content usage tracking and performance metrics.

**Zod Validation Schemas:**
* **CreateContentSchema:** Validation for content creation with type-specific metadata.
* **GenerateImageSchema:** AI generation request validation with prompt and asset references.
* **AssetUploadSchema:** Brand Kit asset validation with file type restrictions.
* **ContentCalendarSchema:** Calendar entry validation with platform-specific requirements.

### 4.3. Frontend Components & State (React/TanStack Query)
**Main Page Components:**
* **`ContentCreator.tsx`:** Primary page component replacing ContentCalendarFixed.tsx with full functionality.
* **`ContentCalendarView.tsx`:** Calendar interface for scheduling and managing posts across platforms.
* **`ContentLibrary.tsx`:** Gallery view of all generated content with filtering and search capabilities.
* **`BrandKit.tsx`:** Asset management page for uploading and organizing brand assets.

**Modal Components:**
* **`CreateContentModal.tsx`:** Unified modal for creating calendar entries with AI generation integration.
* **`AIGeneratorModal.tsx`:** Dedicated AI image generation interface with prompt templates and Brand Kit selector.
* **`AssetUploadModal.tsx`:** Brand Kit asset upload with drag-and-drop and metadata entry.
* **`ContentPreviewModal.tsx`:** Full-screen preview of generated content with usage tracking.

**Utility Components:**
* **`GenerationStatusIndicator.tsx`:** Real-time status display for AI generation jobs with progress animation.
* **`PromptTemplateSelector.tsx`:** Pre-built prompt templates organized by content pillar and release type.
* **`PlatformSelector.tsx`:** Multi-platform selection with platform-specific optimization hints.
* **`ContentPillarGuide.tsx`:** Interactive guide showing content pillar balance and suggestions.

**Custom Hooks (TanStack Query):**
* **`useContentCalendar()`:** Calendar CRUD operations with user-scoped caching.
* **`useGeneratedContent()`:** Content library management with infinite scroll and filtering.
* **`useBrandKit()`:** Asset management with upload progress and validation.
* **`useGenerateImage()`:** AI image generation with loading states and error handling.
* **`useAIIdeas()`:** Text-based idea generation with release context integration.
* **`useContentAnalytics()`:** Usage tracking and performance metrics.
* **`usePromptTemplates()`:** Template marketplace integration with user favorites.

**State Management Patterns:**
* **User-scoped caching:** All queries include user ID for data isolation.
* **Optimistic updates:** Immediate UI feedback for generation requests.
* **Background sync:** Automatic content library refresh and job status polling.
* **Error boundaries:** Graceful handling of AI service failures with retry mechanisms.

### 4.4. External Integrations

**Phase 1: Direct API Integration (Simplified)**
* **OpenAI DALL-E 3:** Primary image generation service for high-quality results.
* **Stability AI:** Alternative provider for style variety and cost optimization.
* **Supabase Storage:** Direct file storage with CDN delivery and automatic optimization.
* **OpenAI GPT-4:** Text-based idea generation and prompt enhancement.

**Phase 2: n8n Workflow (Advanced)**
Custom n8n workflow for complex AI operations and multi-step processing:
* **Trigger:** Webhook from backend with job parameters and user context.
* **AI Generation:** Multiple provider fallback system with quality/cost optimization.
* **Post-Processing:** Image optimization, watermarking, and format conversion.
* **Storage Management:** Multi-provider storage with automatic backup and CDN distribution.
* **Completion Callback:** Status update to backend with generated content metadata.

**Integration Architecture:**
* **Provider Abstraction:** Service layer supporting multiple AI providers with unified interface.
* **Fallback System:** Automatic provider switching on failures or rate limits.
* **Cost Optimization:** Dynamic provider selection based on user tier and content requirements.
* **Quality Assurance:** Content filtering and validation before storage.
* **Usage Tracking:** Comprehensive analytics for cost management and optimization.

## 5. Implementation Plan (Sequential Steps)

**Phase 1: MVP + Wow Factor**

**Step 1: Database Foundation** ✅ **COMPLETED**
1. ✅ Create database migrations for all new tables (`generated_content`, `artist_assets`, `generation_jobs`, modified `content_calendar`)
2. ✅ Implement RLS policies with user_id-based authentication
3. 🔄 Set up Supabase Storage buckets with proper access controls
4. ✅ Create database indexes for optimal query performance

**Implementation Details:**
- **Migration File**: `database/migrations/06_content_creator_foundation.sql`
- **Tables Created**: 3 new tables + 1 modified existing table
- **Security**: User-scoped RLS policies on all tables using `auth.uid()`
- **Performance**: 9 strategic indexes for optimal query patterns
- **Features**: Utility functions, auto-timestamps, comprehensive constraints
- **Status**: updated deployment successful

**Step 2: Backend API Foundation** ✅ **COMPLETED**
1. ✅ Build ContentService and AssetService with full CRUD operations
2. ✅ Implement `/api/content-calendar` endpoints with generated content associations
3. ✅ Create `/api/assets` endpoints with signed URL generation for uploads
4. ✅ Add comprehensive Zod validation schemas for all new endpoints
5. ✅ Build GenerationJobService for async AI generation job management
6. ✅ Create `/api/content` endpoints for generated content management with usage tracking
7. ✅ Create `/api/jobs` endpoints for generation job lifecycle management
8. ✅ Integrate all new routes into worker.ts for API access

**Implementation Details:**
- **Services Created**: ContentService, AssetService, GenerationJobService with full CRUD operations
- **API Endpoints**: 3 complete route modules (`/api/assets`, `/api/content`, `/api/jobs`) with 25+ endpoints
- **Enhanced Calendar**: Added PATCH and GET endpoints for generated content associations
- **Validation**: Comprehensive Zod schemas for all Content Creator endpoints
- **Security**: JWT authentication and user-scoped RLS enforcement on all endpoints
- **Features**: Signed URL generation, usage tracking, job retry/cancel, statistics endpoints
- **Status**: All backend APIs ready for frontend integration

**Step 3: AI Integration (Ideas + Images)**
1. Implement AIService with OpenAI integration for text and image generation
2. Build `/api/ai/ideas` endpoint with release context integration
3. Create `/api/generate/image` endpoint with direct API calls and synchronous responses
4. Add error handling and rate limiting for AI service calls

**Step 4: Frontend Core Components**
1. Replace ContentCalendarFixed.tsx with full-featured ContentCreator.tsx
2. Build BrandKit.tsx with drag-and-drop asset upload and management
3. Create AIGeneratorModal.tsx with prompt templates and Brand Kit integration
4. Implement ContentLibrary.tsx for generated content management

**Step 5: Frontend Polish & Integration**
1. Build all custom hooks with TanStack Query and user-scoped caching
2. Implement GenerationStatusIndicator.tsx with real-time progress feedback
3. Create user onboarding flow with guided first-generation tutorial
4. Add comprehensive error boundaries and loading states

**Step 6: Testing & Optimization**
1. End-to-end testing of complete generation workflow
2. Performance optimization and caching strategy implementation
3. User acceptance testing with beta artists
4. Final polish and deployment preparation

**Phase 2: Advanced Features**
1. Migrate to n8n workflow for async processing and advanced capabilities
2. Implement template marketplace with user-generated content sharing
3. Add usage analytics and content performance tracking
4. Build advanced Brand Kit features with versioning and bulk operations
5. Integrate multiple AI providers with fallback and cost optimization

**Phase 3: Platform Ecosystem**
1. Add AI video generation capabilities for short and long-form content
2. Implement direct social media publishing with platform APIs
3. Build comprehensive analytics dashboard with ROI tracking
4. Create community features for content collaboration and sharing
5. Develop custom AI model training on user brand assets

## 6. Key Definitions & Strategic Concepts

**Core Concepts:**
* **Brand Kit:** User's personal library of reusable brand assets (headshots, logos, artwork) with metadata and usage tracking.
* **Generated Content:** AI-created or user-uploaded media assets stored with comprehensive metadata and usage analytics.
* **Content Pillars:** Strategic content categories (Upcoming, New Songs, Covers, Lifestyle) for balanced audience engagement.
* **Prompt Templates:** Pre-written, tested AI prompts organized by content type and release campaign.

**Technical Concepts:**
* **Unified Content Storage:** Single table approach for all content types with JSONB metadata for flexibility.
* **User-Scoped Authentication:** Direct user_id-based access control following established security patterns.
* **Synchronous Generation:** Direct AI API calls with immediate response for Phase 1 simplicity.
* **Asynchronous Jobs:** Background processing for complex operations with status polling and completion callbacks.
* **Signed URLs:** Secure, temporary upload permissions for direct-to-storage file transfers.

**User Experience Concepts:**
* **Wow Factor First:** Lead with AI image generation to create immediate value demonstration.
* **Progressive Enhancement:** Start simple, add complexity based on user feedback and usage patterns.
* **Template-Driven Creation:** Reduce creative block through guided prompts and proven templates.
* **Usage Analytics:** Track content performance to optimize generation strategies.

**Business Strategy:**
* **Freemium Model:** Generous free tier with premium features for advanced users.
* **Credit System:** Usage-based pricing for AI generation with transparent cost structure.
* **Community Marketplace:** User-generated templates and content sharing for viral growth.
* **Platform Lock-in:** Comprehensive content ecosystem that becomes essential to artist workflow.

**Implementation Philosophy:**
* **Start Simple, Scale Smart:** Begin with direct integrations, evolve to complex workflows.
* **User-Centric Design:** Every feature solves a real artist pain point with measurable value.
* **Technical Excellence:** Maintain high code quality and security standards throughout rapid development.
* **Data-Driven Decisions:** Use analytics to guide feature development and optimization priorities.