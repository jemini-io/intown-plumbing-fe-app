// const FIVE_IN_MINUTES = 5
const TWENTY_FOUR_HOURS_IN_MINUTES = 24 * 60 * 3
const TIME_WINDOW_MINUTES = TWENTY_FOUR_HOURS_IN_MINUTES

export const NOTIFICATION_CONFIG = {
  // Core settings
  TIME_WINDOW_MINUTES: TIME_WINDOW_MINUTES,
  JOB_TYPE_FILTER: process.env.JOB_TYPE_FILTER || 'Virtual Consultation',
  REMINDER_NOTE_TEXT: 'Consultation reminder sent to customer.',
  
  // Environment flags
  DRY_RUN: process.env.DRY_RUN === 'true',
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // ServiceTitan configuration
  SERVICETITAN_BASE_URL: process.env.SERVICETITAN_BASE_URL,
  SERVICETITAN_CLIENT_ID: process.env.SERVICETITAN_CLIENT_ID,
  SERVICETITAN_CLIENT_SECRET: process.env.SERVICETITAN_CLIENT_SECRET,
  SERVICETITAN_APP_KEY: process.env.SERVICETITAN_APP_KEY,
  SERVICETITAN_TENANT_ID: process.env.SERVICETITAN_TENANT_ID,
  
  // Podium configuration
  PODIUM_ENABLED: process.env.PODIUM_ENABLED,
  PODIUM_USE_TEST_NUMBER: process.env.PODIUM_USE_TEST_NUMBER,
  PODIUM_REFRESH_TOKEN: process.env.PODIUM_REFRESH_TOKEN,
  PODIUM_CLIENT_ID: process.env.PODIUM_CLIENT_ID,
  PODIUM_CLIENT_SECRET: process.env.PODIUM_CLIENT_SECRET,
  
  // SMS template
  SMS_TEMPLATE: 'Hi {customerName}, this is a reminder about your consultation with InTown Plumbing scheduled for {appointmentTime}. Please be ready for your video call. If you need to reschedule, please contact us.'
}

// Validate required environment variables
export function validateConfig() {
  const required = [
    'SERVICETITAN_BASE_URL',
    'SERVICETITAN_CLIENT_ID', 
    'SERVICETITAN_CLIENT_SECRET',
    'SERVICETITAN_APP_KEY',
    'SERVICETITAN_TENANT_ID',
    'PODIUM_REFRESH_TOKEN',
    'PODIUM_CLIENT_ID',
    'PODIUM_CLIENT_SECRET'
  ]

  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }
} 