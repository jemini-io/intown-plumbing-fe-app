export interface FormData {
  name: string;
  phone: string;
  email: string;
  startTime?: string;
  endTime?: string;
}

export interface BookRequest extends FormData {
  successUrl: string;
  cancelUrl: string;
}

export interface BookResponse {
  sessionUrl: string;
  jobId?: number;
  name?: string;
  email?: string;
  phone?: string;
  startTime?: string;
  endTime?: string;
}

export interface ErrorResponse {
  error: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  formattedTime: string;
} 