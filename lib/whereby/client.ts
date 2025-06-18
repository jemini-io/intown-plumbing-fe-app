import { env } from '@/lib/config/env';
import { 
  CreateMeetingRequest, 
  CreateMeetingResponse, 
  GetMeetingResponse, 
  ListMeetingsRequest, 
  ListMeetingsResponse 
} from './types';

class WherebyClient {
  private baseUrl = 'https://api.whereby.dev/v1';
  private apiToken: string;

  constructor() {
    this.apiToken = env.whereby.apiToken;
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Whereby API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    if (response.status === 204) {
      return {} as T; // No content for DELETE requests
    }

    return response.json();
  }

  async createMeeting(data: CreateMeetingRequest): Promise<CreateMeetingResponse> {
    return this.makeRequest<CreateMeetingResponse>('/meetings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMeeting(meetingId: string, fields?: ('hostRoomUrl' | 'viewerRoomUrl')[]): Promise<GetMeetingResponse> {
    const searchParams = new URLSearchParams();
    if (fields && fields.length > 0) {
      searchParams.append('fields', fields.join(','));
    }
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/meetings/${meetingId}?${queryString}` : `/meetings/${meetingId}`;
    
    return this.makeRequest<GetMeetingResponse>(endpoint);
  }

  async listMeetings(params?: ListMeetingsRequest): Promise<ListMeetingsResponse> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'fields' && Array.isArray(value)) {
            searchParams.append(key, value.join(','));
          } else {
            searchParams.append(key, value.toString());
          }
        }
      });
    }
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/meetings?${queryString}` : '/meetings';
    
    return this.makeRequest<ListMeetingsResponse>(endpoint);
  }

  async deleteMeeting(meetingId: string): Promise<void> {
    await this.makeRequest(`/meetings/${meetingId}`, {
      method: 'DELETE',
    });
  }
}

export const wherebyClient = new WherebyClient(); 