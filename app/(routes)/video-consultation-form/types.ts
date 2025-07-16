export interface FormData {
  name: string;
  phone: string;
  email: string;
  startTime?: string;
  endTime?: string;
  street: string;
  unit?: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
  // Bill To Address fields
  billToStreet?: string;
  billToUnit?: string;
  billToCity?: string;
  billToState?: string;
  billToZip?: string;
  billToSameAsService?: boolean;
}

export interface Technician {
  id: string;
  name: string;
}

export interface BookRequest extends FormData {
  successUrl: string;
  cancelUrl: string;
  technicianId?: string;
  technician?: Technician;
  jobTypeId?: number;
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

export interface EmbeddedCheckoutResponse {
  clientSecret: string;
}

export interface ErrorResponse {
  error: string;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  formattedTime: string;
} 