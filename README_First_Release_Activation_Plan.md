# First Release Activation Plan

**Date:** 2026-03-26

## Goal
Make the first successful release feel fast, simple, and collaborative so test users reach a clear win quickly.

## Product intent
- Help a user create their first release with minimal friction.
- Make song/track creation feel like one clear action.
- Defer detailed lyric and documentation structure until the user is ready for official label copy and split-sheet work.
- Keep the plan flexible so we can add other high-impact, low-complexity improvements as we learn from test users.

## Core recommendation
Create a simplified first-track flow that starts with one primary button:
- **Start Track** or **Add First Track**

That entry point should open a lightweight collaborative editor for:
- track title
- optional notes / ideas
- optional lyric draft
- optional metadata basics

The more detailed song, lyric, label-copy, and split-sheet structure should come later in the flow, not at the start.

## Recommended implementation approach
The best place to begin is the **Tracks tab redesign**.

Why:
- It creates the fastest visible win for test users.
- It reduces the number of decisions they must make before they can start.
- It keeps the existing label copy and split sheet infrastructure available for later.
- It lets us preserve the current official documentation path without forcing it into the first user action.

The current Songs / Lyrics / Metadata experience should **not be deleted outright**.
Instead:
- the first-time user experience should be moved into a simpler Tracks workspace,
- the existing formal documentation flow should remain available behind a later-stage action,
- and the current data model can still support label copy and split sheet generation when the user is ready.

## Guiding principles
- **Fast first win:** the user should complete something valuable within minutes.
- **Progressive disclosure:** show only the essentials first.
- **Collaborative by default:** the app should feel like a partner, not a form.
- **Documentation later:** detailed fields belong in the official documentation stage.
- **Flexible backlog:** if we find another small, high-value improvement, we can insert it here.

## Phase 1 — Redesign the release detail surface
### Status
Complete

### Outcome
The release detail page becomes easier to understand and faster to act on.

### Candidate changes
- Replace the current three-tab release detail layout with **Checklist** and **Tracks**.
- Keep the Checklist tab focused on release readiness and progress.
- Make the Tracks tab the primary place to start a song or track draft.
- Add a clear primary CTA such as **Start Track** or **Add First Track**.
- Keep the official label copy / split sheet workflow accessible, but move it behind a later-stage action.

### Step 1.1 — Preserve the official documentation path
- Retain the existing label copy and split sheet infrastructure.
- Do not remove the data model or supporting workflows needed for final documentation.
- Expose this path with a clear later-stage action such as **Prepare Official Docs**.

### Step 1.2 — Replace the current Tracks entry point
- Merge the current songs and lyric sheet entry points into a single Tracks workspace.
- Remove the need for users to bounce between separate song and lyric tabs when they are just getting started.
- Treat the new tab as the first place a user goes after creating a release.

### Step 1.3 — Build the draft-first track editor
- Let a user create a track with only the essentials.
- Capture track title, rough notes, draft lyrics, and optional lightweight metadata.
- Auto-save drafts so the user can explore without fear of losing work.
- Keep the interface collaborative and low-pressure.

### Success signal
Users can create their first track from one obvious action without needing to understand the full label-copy structure.

## Phase 2 — Keep the release detail page focused on progress and next actions
### Outcome
The page helps users understand what to do next without overwhelming them.

### Candidate changes
- Add an obvious “next step” panel.
- Highlight the next best action for new users.
- Collapse advanced options behind **details** or **official docs** actions.
- Keep the Tracks tab intentionally simple while still allowing later expansion.
- Make it obvious when the user is moving from draft creation to official documentation.

### Step 2.1 — Add a next-step panel
- Show the user the single best action to complete next.
- Use this to nudge them from release creation into track creation.

### Step 2.2 — Improve empty states and guidance
- Make empty states explain the value of the next action.
- Use lightweight helper text instead of dense form instructions.

### Success signal
Users no longer need to choose between too many tabs before they get value.

## Phase 3 — Reintroduce the official documentation workflow as a deliberate later step
### Outcome
When users are ready for label copy and split sheets, the app captures details cleanly.

### Candidate changes
- Expand structured fields only in the official documentation stage.
- Preserve the draft track content and map it into label-copy fields.
- Let the user promote a track draft into the more structured documentation mode.
- Keep the split sheet and label copy workflow accurate, explicit, and traceable.

### Step 3.1 — Connect draft data to official docs
- Reuse the track data captured in the Tracks tab.
- Map draft content into the label copy and split sheet forms.
- Avoid forcing the user to re-enter information unnecessarily.

### Step 3.2 — Keep the official mode explicit
- Make it clear that this is the final documentation phase.
- Show which fields are required for label copy and split sheet output.

### Success signal
The app supports both quick creation and accurate final documentation.

## Phase 4 — Add small high-impact improvements as discovered
### Outcome
Keep shipping whatever removes friction fastest.

### Candidate additions
- Better empty states
- Guided starter templates
- Inline helper text
- One-click “continue where you left off” actions
- Feedback capture after the first track is created
- Quick-add collaborator notes
- Draft-to-official documentation prompts
- Better mobile-first track editing

## Open questions
- What is the smallest useful version of a first-track editor?
- Which fields truly belong in the draft stage versus official documentation?
- Can we auto-populate later documentation from the draft without extra user work?
- What would make test users feel progress immediately on the release detail page?

## Review cadence
- Revisit this plan after every meaningful UX change.
- Add new low-complexity, high-impact improvements as they appear.
- Keep the first-user win as the priority unless a blocker appears.
