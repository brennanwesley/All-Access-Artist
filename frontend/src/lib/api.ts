import { supabase } from './supabase'

// API base URL from environment variables with fallback
const API_BASE_URL = import.meta.env['VITE_API_URL'] || 'https://all-access-artist.onrender.com'

if (!import.meta.env['VITE_API_URL']) {
  console.warn('VITE_API_URL environment variable not set. Using fallback URL.')
}

interface ApiResponse<T = any> {
  data?: T
  error?: string
  status: number
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

  // Health check (no auth required)
  async healthCheck(): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`)
      const data = await response.json()
      return {
        data: response.ok ? data : undefined,
        error: response.ok ? undefined : 'Health check failed',
        status: response.status,
      } as ApiResponse
    } catch (error) {
      return {
        error: 'Network error',
        status: 0,
      }
    }
  }

  // Artists API
  async getArtists(): Promise<ApiResponse<any[]>> {
    return this.makeRequest('/api/artists')
  }

  async getArtist(id: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/artists/${id}`)
  }

  async createArtist(artistData: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/artists', {
      method: 'POST',
      body: JSON.stringify(artistData),
    })
  }

  // Releases API
  async getReleases(): Promise<ApiResponse<any[]>> {
    return this.makeRequest('/api/releases')
  }

  async getRelease(id: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/releases/${id}`)
  }

  async createRelease(releaseData: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/releases', {
      method: 'POST',
      body: JSON.stringify(releaseData),
    })
  }

  async updateRelease(releaseId: string, releaseData: any): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/releases/${releaseId}`, {
      method: 'PATCH',
      body: JSON.stringify(releaseData),
    })
  }

  async getReleaseDetails(id: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/releases/${id}`)
  }

  async generateTasksForRelease(releaseId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/releases/${releaseId}/generate-tasks`, {
      method: 'POST',
    })
  }

  // Tasks API
  async updateTask(taskId: string, taskData: any): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(taskData),
    })
  }

  // Analytics API
  async getAnalytics(artistId?: string): Promise<ApiResponse<any[]>> {
    const endpoint = artistId ? `/api/analytics?artist_id=${artistId}` : '/api/analytics'
    return this.makeRequest(endpoint)
  }

  async createAnalytics(analyticsData: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/analytics', {
      method: 'POST',
      body: JSON.stringify(analyticsData),
    })
  }

  // Calendar API
  async getCalendar(artistId?: string): Promise<ApiResponse<any[]>> {
    const endpoint = artistId ? `/api/calendar?artist_id=${artistId}` : '/api/calendar'
    return this.makeRequest(endpoint)
  }

  async createCalendarEvent(eventData: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/calendar', {
      method: 'POST',
      body: JSON.stringify(eventData),
    })
  }

  // Songs API
  async addSong(releaseId: string, songData: any): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/releases/${releaseId}/songs`, {
      method: 'POST',
      body: JSON.stringify(songData),
    })
  }

  async updateSong(songId: string, songData: any): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/songs/${songId}`, {
      method: 'PATCH',
      body: JSON.stringify(songData),
    })
  }

  async deleteSong(songId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/songs/${songId}`, {
      method: 'DELETE',
    })
  }

  // Lyric Sheets API
  async getLyricSheet(songId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/lyrics/${songId}`)
  }

  async createLyricSheet(songId: string, lyricData: any): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/lyrics/${songId}`, {
      method: 'POST',
      body: JSON.stringify(lyricData),
    })
  }

  async updateLyricSheet(songId: string, lyricData: any): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/lyrics/${songId}`, {
      method: 'PATCH',
      body: JSON.stringify(lyricData),
    })
  }

  async addLyricSection(songId: string, sectionData: any): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/lyrics/${songId}/sections`, {
      method: 'POST',
      body: JSON.stringify(sectionData),
    })
  }

  async updateLyricSection(sectionId: string, sectionData: any): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/lyrics/sections/${sectionId}`, {
      method: 'PATCH',
      body: JSON.stringify(sectionData),
    })
  }

  async deleteLyricSection(sectionId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/api/lyrics/sections/${sectionId}`, {
      method: 'DELETE',
    })
  }

  // Profile API
  async getProfile(): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/profile')
  }

  async updateProfile(profileData: any): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    })
  }

  async validateReferralCode(referralCode: string): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/profile/validate-referral', {
      method: 'POST',
      body: JSON.stringify({ referral_code: referralCode }),
    })
  }

  async applyReferralCode(referralCode: string): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/profile/referral', {
      method: 'POST',
      body: JSON.stringify({ referral_code: referralCode }),
    })
  }

  async getReferralStats(): Promise<ApiResponse<any>> {
    return this.makeRequest('/api/profile/referral-stats')
  }
}

export const apiClient = new ApiClient()
export default apiClient
