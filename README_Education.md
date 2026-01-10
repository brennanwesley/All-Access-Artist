# Feature Spec: Education Page

## 1. Overview & User Goal
This document outlines the technical specifications for the "Education" feature. The goal is to create a central knowledge base within All Access Artist that educates artists on key music industry practices. The feature will combine structured, browseable content with an interactive AI chatbot, allowing users to both learn foundational concepts and ask specific follow-up questions.

## 2. Navigation & Routing
* **Action:** Add a new primary navigation link in the main application layout (e.g., the main sidebar).
* **Label:** "Education"
* **Route:** The link should navigate the user to the `/education` path.
* **Page Component:** This route will render a new page component, likely named `EducationPage.tsx`.

## 3. Page Layout & Components
The `EducationPage` will consist of a full-height, two-pane layout. The two panes should be situated side-by-side and fill the entire vertical space of the viewport.

### Left Pane: "Industry Topics"
* **Component Name:** `IndustryTopics.tsx`
* **Title:** This pane should have a clear heading: "Industry Topics".
* **Layout:** This pane should have a fixed width (e.g., `35%` or `450px`) and be vertically scrollable if the content overflows (`overflow-y: auto`).
* **Functionality:** It will display the main educational content using an accordion-style interface. Each topic is a clickable header that expands to show detailed information.

### Right Pane: "AI Chatbot"
* **Component Name:** `Chatbot.tsx`
* **Layout:** This pane should be flexible and take up the remaining horizontal space of the page.
* **Functionality:** It will feature a standard chatbot interface:
    * A message history area that is vertically scrollable.
    * A text input field at the bottom for the user to type their questions.
    * A "Send" button to submit the question.

## 4. Left Pane: Content Structure & Data Model
The content in the "Industry Topics" pane should be structured and easy to manage.

### UI Component
Use an **Accordion** component (e.g., from shadcn/ui) to display the topics. This directly matches the "click-in detail to expand" requirement.

### Industry Topics (Final List)
This is the list of accordion items to be implemented:

* Your Professional Team
* Copyright Basics
* Songwriting & Publishing
* Record vs Distribution Deals
* Touring & Live Performance
* Your Brand & Merch
* Music in Film & TV (Sync)
* Industry Hot Takes or new deals

## 5. Right Pane: AI Chatbot Functionality
* **Initial State:** The chatbot should display a default welcome message, such as: "Welcome! I'm your AI music industry expert. Ask me anything about the topics on the left or any other questions you have."
* **Backend API:** The chatbot will need to communicate with a new backend endpoint, for example `POST /api/ai/chat`.
* **API Request:** The request to this endpoint should send the user's new message along with the recent conversation history to provide context for the AI model.
* **API Response:** The backend should stream the AI's response back to the frontend to be displayed in the chat history.

```typescript
// Example data structure
interface EducationTopic {
  id: string;      // A unique identifier, e.g., 'your-professional-team'
  title: string;   // The title displayed in the accordion header
  content: string; // The detailed text content, which can be formatted with Markdown
}