// Export all Podium functionality
export * from './types'
export * from './auth'
export * from './client'
export * from './contacts'
export * from './messages'

// Re-export commonly used functions for convenience
export { podiumAuth } from './auth'
export { podiumClient } from './client'
export { 
  createOrUpdateContact, 
} from './contacts'
export {
  sendTextMessage,
  sendAppointmentConfirmation,
  sendTechnicianAppointmentConfirmation,
} from "./messages"; 