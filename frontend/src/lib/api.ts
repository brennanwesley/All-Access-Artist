import { supabase } from './supabase'
import type {
  ApiResponse,
  BackendResponse,
  Release,
  ReleaseDetails,
  CreateReleaseData,
  UpdateReleaseData,
  Artist,
  CreateArtistData,
  UpdateSocialMediaData,
  Task,
  UpdateTaskData,
  UserProfile,
  UpdateProfileData,
  ReferralStats,
  ReferralValidation,
  ReferralApplication,
  AnalyticsData,
  CreateAnalyticsData,
  CalendarEvent,
  CreateCalendarEventData,
  Song,
  CreateSongData,
  UpdateSongData,
  LyricSheet,
  CreateLyricSheetData,
  UpdateLyricSheetData,
  LyricSection,
  CreateLyricSectionData,
  UpdateLyricSectionData,
  SplitSheet,
  CreateSplitSheetData,
  SubscriptionStatus,
  SubscriptionProduct,
  CheckoutSessionData,
  CheckoutSessionResponse,
  AdminUser,
  AdminStats,
  OnboardingData,
  FallbackAccountResponse,
  HealthCheckResponse
} from '../types/api'

// API base URL from environment variables with fallback
const API_BASE_URL = import.meta.env['VITE_API_URL'] || 'https://all-access-artist.onrender.com'

if (!import.meta.env['VITE_API_URL']) {
  console.warn('VITE_API_URL environment variable not set. Using fallback URL.')
}

class ApiClient {
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.access_token) {
      throw new Error('No authentication token available')
    }

    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders()
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      })

      const data = await response.json()

      return {
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : data.error || 'Request failed',
        status: response.status,
      }
    } catch (error) {
      console.error('API request failed:', error)
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      }
    }
  }

  private async makeRequestPublic<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      const data = await response.json()

      return {
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : data.error || 'Request failed',
        status: response.status,
      }
    } catch (error) {
      console.error('API request failed:', error)
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status: 0,
      }
    }
  }

  // Health check (no auth required)
  async healthCheck(): Promise<ApiResponse<BackendResponse<HealthCheckResponse>>> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`)
      const data = await response.json()
      return {
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : 'Health check failed',
        status: response.status,
      }
    } catch {
      return {
        error: 'Network error',
        status: 0,
      }
    }
  }

  // Artists API
  async getArtists(): Promise<ApiResponse<BackendResponse<Artist[]>>> {
    return this.makeRequest('/api/artists')
  }

  async getArtist(id: string): Promise<ApiResponse<BackendResponse<Artist>>> {
    return this.makeRequest(`/api/artists/${id}`)
  }

  async createArtist(artistData: CreateArtistData): Promise<ApiResponse<BackendResponse<Artist>>> {
    return this.makeRequest('/api/artists', {
      method: 'POST',
      body: JSON.stringify(artistData),
    })
  }

  async updateSocialMediaUrls(socialMediaData: UpdateSocialMediaData): Promise<ApiResponse<BackendResponse<Artist>>> {
    return this.makeRequest('/api/artists/social-media', {
      method: 'PATCH',
      body: JSON.stringify(socialMediaData),
    })
  }

  // Releases API
  async getReleases(): Promise<ApiResponse<BackendResponse<Release[]>>> {
    return this.makeRequest('/api/releases')
  }

  async getRelease(id: string): Promise<ApiResponse<BackendResponse<Release>>> {
    return this.makeRequest(`/api/releases/${id}`)
  }

  async createRelease(releaseData: CreateReleaseData): Promise<ApiResponse<BackendResponse<Release>>> {
    return this.makeRequest('/api/releases', {
      method: 'POST',
      body: JSON.stringify(releaseData),
    })
  }

  async updateRelease(releaseId: string, releaseData: UpdateReleaseData): Promise<ApiResponse<BackendResponse<Release>>> {
    return this.makeRequest(`/api/releases/${releaseId}`, {
      method: 'PATCH',
      body: JSON.stringify(releaseData),
    })
  }

  async getReleaseDetails(id: string): Promise<ApiResponse<BackendResponse<ReleaseDetails>>> {
    return this.makeRequest(`/api/releases/${id}`)
  }

  async generateTasksForRelease(releaseId: string): Promise<ApiResponse<BackendResponse<Task[]>>> {
    return this.makeRequest(`/api/releases/${releaseId}/generate-tasks`, {
      method: 'POST',
    })
  }

  // Tasks API
  async updateTask(taskId: string, taskData: UpdateTaskData): Promise<ApiResponse<BackendResponse<Task>>> {
    return this.makeRequest(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(taskData),
    })
  }

  // Analytics API
  async getAnalytics(userId?: string): Promise<ApiResponse<BackendResponse<AnalyticsData[]>>> {
    const endpoint = userId ? `/api/analytics?user_id=${userId}` : '/api/analytics'
    return this.makeRequest(endpoint)
  }

  async createAnalytics(analyticsData: CreateAnalyticsData): Promise<ApiResponse<BackendResponse<AnalyticsData>>> {
    return this.makeRequest('/api/analytics', {
      method: 'POST',
      body: JSON.stringify(analyticsData),
    })
  }

  // Calendar API
  async getCalendar(userId?: string): Promise<ApiResponse<BackendResponse<CalendarEvent[]>>> {
    const endpoint = userId ? `/api/calendar?user_id=${userId}` : '/api/calendar'
    return this.makeRequest(endpoint)
  }

  async createCalendarEvent(eventData: CreateCalendarEventData): Promise<ApiResponse<BackendResponse<CalendarEvent>>> {
    return this.makeRequest('/api/calendar', {
      method: 'POST',
      body: JSON.stringify(eventData),
    })
  }

  // Songs API
  async addSong(releaseId: string, songData: CreateSongData): Promise<ApiResponse<BackendResponse<Song>>> {
    return this.makeRequest(`/api/releases/${releaseId}/songs`, {
      method: 'POST',
      body: JSON.stringify(songData),
    })
  }

  async updateSong(songId: string, songData: UpdateSongData): Promise<ApiResponse<BackendResponse<Song>>> {
    return this.makeRequest(`/api/songs/${songId}`, {
      method: 'PATCH',
      body: JSON.stringify(songData),
    })
  }

  async deleteSong(songId: string): Promise<ApiResponse<BackendResponse<{ deleted: boolean }>>> {
    return this.makeRequest(`/api/songs/${songId}`, {
      method: 'DELETE',
    })
  }

  // Lyric Sheets API
  async getLyricSheet(songId: string): Promise<ApiResponse<BackendResponse<LyricSheet>>> {
    return this.makeRequest(`/api/lyrics/${songId}`)
  }

  async createLyricSheet(songId: string, lyricData: CreateLyricSheetData): Promise<ApiResponse<BackendResponse<LyricSheet>>> {
    return this.makeRequest(`/api/lyrics/${songId}`, {
      method: 'POST',
      body: JSON.stringify(lyricData),
    })
  }

  async updateLyricSheet(songId: string, lyricData: UpdateLyricSheetData): Promise<ApiResponse<BackendResponse<LyricSheet>>> {
    return this.makeRequest(`/api/lyrics/${songId}`, {
      method: 'PATCH',
      body: JSON.stringify(lyricData),
    })
  }

  async addLyricSection(songId: string, sectionData: CreateLyricSectionData): Promise<ApiResponse<BackendResponse<LyricSection>>> {
    return this.makeRequest(`/api/lyrics/${songId}/sections`, {
      method: 'POST',
      body: JSON.stringify(sectionData),
    })
  }

  async updateLyricSection(sectionId: string, sectionData: UpdateLyricSectionData): Promise<ApiResponse<BackendResponse<LyricSection>>> {
    return this.makeRequest(`/api/lyrics/sections/${sectionId}`, {
      method: 'PATCH',
      body: JSON.stringify(sectionData),
    })
  }

  async deleteLyricSection(sectionId: string): Promise<ApiResponse<BackendResponse<{ deleted: boolean }>>> {
    return this.makeRequest(`/api/lyrics/sections/${sectionId}`, {
      method: 'DELETE',
    })
  }

  // Profile API
  async getProfile(): Promise<ApiResponse<BackendResponse<UserProfile>>> {
    return this.makeRequest('/api/profile')
  }

  async updateProfile(profileData: UpdateProfileData): Promise<ApiResponse<BackendResponse<UserProfile>>> {
    return this.makeRequest('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  }

  async validateReferralCode(referralCode: string): Promise<ApiResponse<BackendResponse<ReferralValidation>>> {
    return this.makeRequest('/api/profile/validate-referral', {
      method: 'POST',
      body: JSON.stringify({ referral_code: referralCode }),
    })
  }

  async applyReferralCode(referralCode: string): Promise<ApiResponse<BackendResponse<ReferralApplication>>> {
    return this.makeRequest('/api/profile/referral', {
      method: 'POST',
      body: JSON.stringify({ referral_code: referralCode }),
    })
  }

  async getReferralStats(): Promise<ApiResponse<BackendResponse<ReferralStats>>> {
    return this.makeRequest('/api/profile/referral-stats')
  }

  // Split Sheets API
  async getSplitSheet(songId: string): Promise<ApiResponse<BackendResponse<SplitSheet>>> {
    return this.makeRequest(`/api/splitsheets/song/${songId}`)
  }

  async saveSplitSheet(songId: string, splitSheetData: CreateSplitSheetData): Promise<ApiResponse<BackendResponse<SplitSheet>>> {
    return this.makeRequest(`/api/splitsheets/song/${songId}`, {
      method: 'PUT',
      body: JSON.stringify(splitSheetData),
    })
  }

  async deleteSplitSheet(songId: string): Promise<ApiResponse<BackendResponse<{ deleted: boolean }>>> {
    return this.makeRequest(`/api/splitsheets/song/${songId}`, {
      method: 'DELETE',
    })
  }

  // Subscription API
  async createCheckoutSession(checkoutData: CheckoutSessionData): Promise<ApiResponse<BackendResponse<CheckoutSessionResponse>>> {
    return this.makeRequestPublic('/api/subscription/checkout', {
      method: 'POST',
      body: JSON.stringify(checkoutData),
    })
  }

  async getSubscriptionStatus(): Promise<ApiResponse<BackendResponse<SubscriptionStatus>>> {
    return this.makeRequest('/api/subscription/status')
  }

  async cancelSubscription(): Promise<ApiResponse<BackendResponse<{ cancelled: boolean }>>> {
    return this.makeRequest('/api/subscription/cancel', {
      method: 'POST',
    })
  }

  async getSubscriptionProducts(): Promise<ApiResponse<BackendResponse<SubscriptionProduct[]>>> {
    return this.makeRequestPublic('/api/subscription/products')
  }

  async setupStripeProducts(): Promise<ApiResponse<BackendResponse<{ setup: boolean }>>> {
    return this.makeRequest('/api/subscription/setup', {
      method: 'POST',
    })
  }

  // Onboarding API
  async createFallbackAccount(sessionId: string): Promise<ApiResponse<BackendResponse<FallbackAccountResponse>>> {
    return this.makeRequestPublic('/api/onboarding/create-fallback', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    })
  }

  async completeOnboarding(onboardingData: OnboardingData): Promise<ApiResponse<BackendResponse<UserProfile>>> {
    return this.makeRequestPublic('/api/onboarding/complete', {
      method: 'POST',
      body: JSON.stringify(onboardingData),
    })
  }

  // Admin API
  async getAdminUsers(): Promise<ApiResponse<BackendResponse<AdminUser[]>>> {
    return this.makeRequest('/api/admin/users')
  }

  async getAdminStats(): Promise<ApiResponse<BackendResponse<AdminStats>>> {
    return this.makeRequest('/api/admin/stats')
  }

  // Social Media Metrics API
  async getInstagramMetrics(username: string): Promise<ApiResponse<BackendResponse<{
    username: string
    date_ingested: string
    posts_30d: number | null
    likes_30d: number | null
    comments_30d: number | null
    profile_url: string | null
  }>>> {
    return this.makeRequest(`/api/social/metrics/instagram/${encodeURIComponent(username)}`)
  }
}

export const apiClient = new ApiClient()
export default apiClient
