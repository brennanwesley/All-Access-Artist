import { supabase } from './supabase'

// API base URL - update this to match your deployed backend
const API_BASE_URL = 'https://allaccessartist-dev.brennanwesley.workers.dev'

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
      }
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
}

export const apiClient = new ApiClient()
export default apiClient
