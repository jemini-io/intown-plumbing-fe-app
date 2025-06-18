export interface WherebyMeeting {
  meetingId: string;
  roomUrl: string;
  hostRoomUrl?: string;
  viewerRoomUrl?: string;
  startDate?: string;
  endDate: string;
  roomName?: string;
  roomMode?: 'normal' | 'group';
}

export interface CreateMeetingRequest {
  endDate: string;
  startDate?: string;
  isLocked?: boolean;
  roomMode?: 'normal' | 'group';
  roomNamePrefix?: string;
  roomNamePattern?: 'uuid' | 'human-short';
  templateType?: 'viewerMode';
  recording?: {
    type: 'none' | 'local' | 'cloud';
    destination?: {
      provider: 's3' | 'whereby';
      bucket?: string;
      accessKeyId?: string;
      accessKeySecret?: string;
      fileFormat?: 'mkv' | 'mp4';
    } | null;
    startTrigger?: 'none' | 'prompt' | 'automatic' | 'automatic-2nd-participant';
  };
  liveTranscription?: {
    destination: {
      provider: 's3' | 'whereby';
      bucket?: string;
      accessKeyId?: string;
      accessKeySecret?: string;
      region?: string;
    } | null;
    startTrigger: 'none' | 'manual' | 'automatic' | 'automatic-2nd-participant';
    language?: string;
    liveCaptions?: boolean;
  };
  streaming?: {
    destination: {
      url: string;
    };
    startTrigger: 'none' | 'prompt' | 'automatic';
  };
  fields?: ('hostRoomUrl' | 'viewerRoomUrl')[];
}

export interface CreateMeetingResponse {
  meetingId: string;
  roomUrl: string;
  hostRoomUrl?: string;
  viewerRoomUrl?: string;
  startDate?: string;
  endDate: string;
  roomName?: string;
}

export interface GetMeetingResponse {
  meetingId: string;
  roomUrl: string;
  hostRoomUrl?: string;
  viewerRoomUrl?: string;
  startDate?: string;
  endDate: string;
  roomName?: string;
}

export interface ListMeetingsResponse {
  results: GetMeetingResponse[];
  cursor: string | null;
}

export interface ListMeetingsRequest {
  cursor?: string;
  limit?: number;
  fields?: ('hostRoomUrl' | 'viewerRoomUrl')[];
} 