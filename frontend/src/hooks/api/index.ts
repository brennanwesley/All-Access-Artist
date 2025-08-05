// API Hooks - Server State Management with TanStack Query
// Replaces useEffect data fetching patterns per All Access Artist Ruleset

export { useHealthCheck } from './useHealthCheck'
export { useArtists, useCreateArtist } from './useArtists'
export { useReleases, useCreateRelease } from './useReleases'
export { useCalendar, useCreateCalendarEvent } from './useCalendar'

// Note: Types are defined within individual hook files
// Import them directly from the specific hook files when needed
