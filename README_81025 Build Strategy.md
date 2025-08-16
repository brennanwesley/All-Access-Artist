# Expanded MVP Build Strategy (with Data Scrubbing)

This is our finalized, sequential roadmap. We will execute these steps in order to build the Release Manager and the integrated Lyric Sheet feature.

## 1. Database Foundation
This is our first action. We will create a single SQL migration script to get the entire database schema ready for all MVP features.
* Add the `project_budget` column to the `music_releases` table.
* Create the new `songs` table, with a foreign key linking it to `music_releases`.
* Create the new `task_templates` and `release_tasks` tables for the to-do list feature.
* Create the new `lyric_sheets` and `lyric_sheet_sections` tables to support the **Lyric Sheet** feature.

## 2. Backend API & Logic
With the database ready, we'll build the necessary backend services.
* **To-Do List Logic:** First, we'll populate the `task_templates` table with your predefined checklists. Then, we'll enhance the `ReleasesService` so that creating a new release also generates the corresponding to-do list in the `release_tasks` table.
* **Lyric Sheet API:** As you suggested, we will create a new, separate file (e.g., `backend/src/routes/lyrics.ts`) to house all the API endpoints for the Lyric Sheet. We will build all the required CRUD endpoints to create, read, and update lyric sheets and their individual sections.

## 3. Frontend: Build the "Release Detail" Page
This is now the most complex page, so we will build its components first.
* **Scrub Hardcoded Data:** The first action is to delete all hardcoded, placeholder data from the existing `ReleaseDetails.tsx` component.
* We will then build the UI to display all the details for a single release. This includes:
    * The interactive **to-do list checklist** with "Mark Complete" buttons.
    * The UI for adding and viewing the list of **songs** associated with the project.
    * The new **Lyric Sheet form**, including the dynamic "Add Section" functionality.
* We will integrate all the necessary TanStack Query hooks to fetch and update this data (e.g., `useGetReleaseDetails`, `useUpdateTask`, `useGetLyrics`, `useAddLyricSection`, etc.).

## 4. Frontend: Connect the Main Release Manager Page
With the detail page components ready, we will now build the main list view.
* **Scrub Hardcoded Data:** We will begin by deleting the hardcoded array of sample releases from the `ReleaseCalendar.tsx` component.
* We will then connect the `ReleaseCalendar` page to fetch and display the live list of all releases for the logged-in user, implementing the empty state and loading skeletons.

## 5. Frontend: "New Release" Modal & Final Integration
This step ties the creation flow together with the display.
* We will refactor the `NewReleaseForm` into a modal.
* We'll ensure that successfully creating a release from the modal correctly invalidates our queries, causing the main list on the `ReleaseCalendar` page to refresh automatically.

## 6. PDF Export Integration
As the final step, we will implement the PDF export.
* The "Export to PDF" button on the Lyric Sheet UI will be wired to a new backend endpoint.
* This endpoint's only job will be to securely trigger the n8n webhook URL you provide to generate the PDF.