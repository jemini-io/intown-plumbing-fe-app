export interface Job {
  id: number
  startTime: string
  endTime: string
  jobType: string
  status: string
  customer: Customer
  notes?: JobNote[]
}

export interface Customer {
  id: number
  firstName: string
  lastName: string
  phone: string
  email?: string
}

export interface JobNote {
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
  totalJobs: number
  eligibleJobs: number
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

export interface JobQueryFilters {
  jobType: string
  startTimeFrom: string
  startTimeTo: string
  status?: string[]
} 