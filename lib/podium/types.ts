// Podium API Types

export interface PodiumToken {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
}

export interface PodiumContact {
  attributes: {
    label: string
    value: string
    uid: string
    dataType: string
    ownerResource: {
      type: string
      uid: string
    }
  }
  name: string
  address: string
  organization: {
    uid: string
  }
  channels: {
    label: string
    type: string
    identifier: string
    createdAt: string
    updatedAt: string
  }
  uid: string
  createdAt: string
  updatedAt: string
  tags: {
    label: string
    description: string
    uid: string
  }
  locations: {
    uid: string
  }
  emails: string[]
  conversations: {
    uid: string
  }
  phoneNumbers: string[]
}


export interface PodiumContactRequest {
  locations: string[]
  email?: string
  name: string
  phoneNumber: string
}

export interface PodiumContactCreatedResponse {
  identifier: string
}

export interface PodiumMessage {
  uid: string
  contactIdentifier: string
  message: string
  type: 'text' | 'image' | 'file'
  status: string
  createdAt: string
  updatedAt: string
}

export type ChannelType = 'phone' | 'email'

export interface PodiumMessageRequest {
  body: string;
  channel: {
    identifier: string;
    type: ChannelType;
  };
  locationUid: string;
  subject?: string;
  contactName?: string;
  senderName?: string;
}

export interface PodiumMessageResponse {
  data: {
    attachmentUrl?: string;
    body: string;
    contact: {
      externalIdentifier?: string;
      name: string;
      uid: string;
    };
    contactName: string;
    conversation: {
      assignedUserUid?: string;
      channel: {
        identifier: string;
        type: string;
      };
      startedAt?: string;
      uid: string;
    };
    createdAt: string;
    failureReason?: string;
    location: {
      organizationUid?: string;
      uid: string;
    };
    sender: {
      uid: string;
    };
    senderUid: string;
    uid: string;
  };
  metadata: {
    url: string;
  };
}

export interface PodiumApiResponse<T> {
  data: T
  metadata: {
    url: string
  }
}

export interface PodiumApiError {
  code: number
  message: string
  moreInfo?: string
}

export interface PodiumContactListResponse {
  data: PodiumContact[]
  metadata: {
    nextCursor?: string
    url: string
  }
}

export interface PodiumContactResponse {
  data: PodiumContact
  metadata: {
    url: string
  }
} 