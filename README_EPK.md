# Feature Spec: The Artist EPK (Electronic Press Kit)

## 1. Overview & Vision
The Electronic Press Kit (EPK) is a professional artist's digital resume. This feature will empower artists on the All Access Artist platform to create, manage, and share a beautiful, industry-standard EPK. Our goal is to provide a tool that not only organizes their career information but also actively helps them secure opportunities.

This feature will be built in two distinct phases:
* **Phase 1** focuses on the creation of the core EPK and providing the tools for professional, external outreach via email.
* **Phase 2** expands the EPK into a social and networking tool within the All Access Artist ecosystem, allowing for richer media bundling and internal sharing.

## 2. Phase 1: EPK Creation & Professional Outreach

### User Stories for Phase 1
* **As an artist,** I want to easily input my bios, photos, career highlights, and stats to build a comprehensive EPK.
* **As an artist,** I want my EPK to be hosted on a clean, professional-looking public webpage.
* **As an artist,** I want to send my EPK to any email address (e.g., a booking agent, a blogger, a venue) directly from the platform.
* **As an artist,** I need the email to be sent from my own professional email address so I can manage the conversation and maintain my brand identity.

### Core EPK Content & Data Model
This is the foundational data that makes up the EPK. This will be managed via a new settings page, "EPK Manager," and stored in a new `epks` table in the database.

* **Bios:**
    * `short_bio`: (text, ~250 characters max) - The elevator pitch.
    * `long_bio`: (text, rich-text enabled) - The full story.

* **Photos:**
    * Integration with the **"Creator Studio" (Brand Kit)**. The user can select which of their uploaded headshots, live shots, or full-body images to feature in their EPK. We should support at least 3-5 high-resolution press photos.

* **Music Showcase:**
    * `featured_tracks`: (array of objects) - An array containing up to 5 tracks, with fields for `title`, `description`, and `embed_url` (e.g., from an unlisted SoundCloud or public Spotify link).

* **Videos:**
    * `featured_videos`: (array of objects) - An array containing up to 3 videos, with fields for `title` and `embed_url` (e.g., from YouTube/Vimeo). A high-quality live performance video is essential.

* **Career Highlights:**
    * `highlights`: (array of objects) - A list of key achievements, with fields for `year`, `title`, and `description` (e.g., "Opened for The 1975," "Featured on Spotify's 'Fresh Finds' playlist").

* **Press & Reviews:**
    * `press_quotes`: (array of objects) - A list of positive quotes from media, with fields for `quote_text`, `publication_name`, and `article_url`.

* **Stats:**
    * `stats`: (JSONB) - A flexible object to store key metrics like `monthly_listeners`, `social_followers`, etc. This can be integrated with our Fan Analytics feature in the future.

* **Team:**
    * `team_members`: (array of objects) - A list of the artist's professional team, with fields for `name`, `role` (Manager, Agent, Attorney, Publicist), and `email`.

### Public EPK Page
A core part of Phase 1 is that every artist's EPK will be available at a clean, public, shareable URL.
* **URL Structure:** `allaccessartist.com/epk/[artist-vanity-url]`
* **Functionality:** This page will be a read-only, beautifully designed presentation of all the EPK data listed above. It will be server-side rendered (SSR) for fast loading and SEO benefits. It must be fully responsive for viewing on mobile devices.

### Email Sharing Feature
This is the primary action for the Phase 1 EPK.

**User Experience:**
* A "Share" button on the EPK management page will open a "Share EPK" modal.
* **Modal Fields:**
    * `To`: Recipient's email address.
    * `From`: Pre-filled and locked with the user's connected email account.
    * `Subject`: Pre-filled with a smart default (e.g., "EPK for [Artist Name]").
    * `Body`: A rich-text editor with optional templates for common outreach scenarios (Venue Booking, Press Submission, etc.). The body will automatically include the link to the public EPK page.

**Technical Architecture (OAuth 2.0):**
* **Email Connection:** A new section in the user's main settings, "Connected Accounts," will allow for a one-time connection to their email provider. We will start with **Google (Gmail)** and **Microsoft (Outlook)**.
* **OAuth Flow:** This will be a standard OAuth 2.0 flow where the user is redirected to their email provider to grant "All Access Artist" permission to send emails on their behalf. We will never see or store the user's password.
* **Token Storage:** Our backend will securely encrypt and store the resulting `access_token` and `refresh_token` in a new `email_oauth_tokens` table, linked to the `user_id`.

**Technical Architecture (Backend Email Service):**
* A new backend endpoint (`POST /api/epk/send`) will receive the `to`, `subject`, and `body` from the frontend.
* The service will retrieve the user's stored OAuth token.
* It will then make an authenticated API call to the appropriate provider's API (e.g., Gmail API's `users.messages.send` method) to send the email.
* The email will appear in the user's actual "Sent" folder, creating a seamless professional experience.

---
## 3. Phase 2: Internal Networking & The "Promotional Bundle"

### User Stories for Phase 2
* **As an artist,** I want to share my EPK and other exclusive content with specific users on the All Access Artist platform (e.g., a potential collaborator, a manager I met on the platform).
* **As an artist,** I want to bundle exclusive, downloadable assets with my EPK to create a special package for industry contacts.
* **As an artist,** I want to be notified when another user shares a promotional bundle with me.

### The "Promotional Bundle" Concept
A "Bundle" is a shareable package that contains an artist's EPK plus other exclusive assets hosted within the All Access Artist ecosystem.

**Bundle Content (in addition to the EPK):**
* **Downloadable Song Files:** The artist can select up to 3 tracks from their music library (a feature to be built) to be included as high-quality MP3 or WAV downloads. This requires using Supabase Storage.
* **Technical Rider / Stage Plot:** The artist can upload and attach technical documents (PDFs) for live performance inquiries.
* **Private Links:** The ability to include private, unlisted links to unreleased music or videos.

### Internal Sharing System
This functionality turns the EPK into a social and business development tool within our platform.

* **User Experience:**
    * The "Share" modal will have a new tab: "Share with an Artist."
    * This tab will include a search bar to find other registered users on the platform by their artist name.
    - The artist can then select which optional bundle assets to include with their EPK.
* **Notifications:** When a bundle is shared, the recipient will receive a notification within the All Access Artist app.
* **Backend Logic:** A new `promotional_bundles` table will track the contents of each bundle, and a `bundle_shares` table will manage the permissions, linking the `sender_id`, `recipient_id`, and `bundle_id`.