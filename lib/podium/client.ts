import { podiumAuth } from './auth'
import { PODIUM_CONFIG } from '@/lib/config/podium'
import { PodiumApiResponse, PodiumApiError } from './types'

export class PodiumClient {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<PodiumApiResponse<T>> {
    const token = await podiumAuth.getAccessToken()
    
    const response = await fetch(`${PODIUM_CONFIG.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      let errorMessage = `Podium API error: ${response.status} ${response.statusText}`
      
      try {
        const errorData: PodiumApiError = await response.json()
        errorMessage = `Podium API error: ${errorData.message} (Code: ${errorData.code})`
        if (errorData.moreInfo) {
          errorMessage += ` - ${errorData.moreInfo}`
        }
      } catch {
        // If we can't parse the error response, use the default message
      }
      
      throw new Error(errorMessage)
    }

    return response.json()
  }

  async get<T>(endpoint: string): Promise<PodiumApiResponse<T>> {
    return this.makeRequest<T>(endpoint)
  }

  async post<T>(endpoint: string, data: unknown): Promise<PodiumApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data: unknown): Promise<PodiumApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT', 
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<PodiumApiResponse<T>> {
    return this.makeRequest<T>(endpoint, {
      method: 'DELETE',
    })
  }
}

export const podiumClient = new PodiumClient() 