export interface Booking {
  id: number
  startTime: string
  endTime: string
  bookingType: string
  status: string
  customer: Customer
  notes?: BookingNote[]
}

export interface Customer {
  id: number
  firstName: string
  lastName: string
  phone: string
  email?: string
}

export interface BookingNote {
  id: number
  text: string
  timestamp: string
  createdBy: string
}

export interface TimeWindow {
  start: Date
  end: Date
}

export interface NotificationMetrics {
  totalBookings: number
  eligibleBookings: number
  notificationsSent: number
  errors: number
  dryRun: boolean
  duration?: number
}

export interface SMSResult {
  success: boolean
  messageId?: string
  dryRun?: boolean
  error?: string
}

export interface NoteResult {
  success: boolean
  dryRun?: boolean
  error?: string
}

export interface BookingQueryFilters {
  bookingType: string
  startTimeFrom: string
  startTimeTo: string
  status?: string[]
} 