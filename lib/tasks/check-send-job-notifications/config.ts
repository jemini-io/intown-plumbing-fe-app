const THREE_DAYS_IN_MINUTES = 3 * 24 * 60
const FIVE_IN_MINUTES = 5
const TIME_WINDOW_MINUTES = FIVE_IN_MINUTES

export const NOTIFICATION_CONFIG = {
  // Core settings
  TIME_WINDOW_MINUTES: TIME_WINDOW_MINUTES,
  JOB_TYPE_FILTER: process.env.JOB_TYPE_FILTER || 'Virtual Consultation',
  REMINDER_NOTE_TEXT: 'Consultation reminder sent to customer.',
  
  // Environment flags
  DRY_RUN: process.env.DRY_RUN === 'true',
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // ServiceTitan configuration
  ST_BASE_URL: process.env.ST_BASE_URL,
  ST_CLIENT_ID: process.env.ST_CLIENT_ID,
  ST_CLIENT_SECRET: process.env.ST_CLIENT_SECRET,
  
  // Podium configuration
  PODIUM_API_KEY: process.env.PODIUM_API_KEY,
  PODIUM_LOCATION_ID: process.env.PODIUM_LOCATION_ID,
  
  // SMS template
  SMS_TEMPLATE: 'Hi {customerName}, this is a reminder about your consultation with InTown Plumbing scheduled for {appointmentTime}. Please be ready for your video call. If you need to reschedule, please contact us.'
}

// Validate required environment variables
export function validateConfig() {
  const required = [
    'ST_BASE_URL',
    'ST_CLIENT_ID', 
    'ST_CLIENT_SECRET',
    'PODIUM_API_KEY',
    'PODIUM_LOCATION_ID'
  ]

  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
} 