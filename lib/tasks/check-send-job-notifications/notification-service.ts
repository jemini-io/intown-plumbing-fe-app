import { sendTextMessage } from '../../podium/messages'
import { NOTIFICATION_CONFIG } from './config'
import { logger } from './logger'
import { Booking, Customer, SMSResult } from './types'

/**
 * Format SMS message using template and booking data
 */
function formatSMSMessage(booking: Booking, customer: Customer): string {
  const appointmentTime = new Date(booking.startTime).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Chicago'
  })

  const customerName = `${customer.firstName} ${customer.lastName}`.trim() || 'there'

  return NOTIFICATION_CONFIG.SMS_TEMPLATE
    .replace('{customerName}', customerName)
    .replace('{appointmentTime}', appointmentTime)
}

/**
 * Send consultation reminder SMS
 */
export async function sendConsultationReminder(booking: Booking, customer: Customer): Promise<SMSResult> {
  try {
    const message = formatSMSMessage(booking, customer)
    const customerName = `${customer.firstName} ${customer.lastName}`.trim() || 'Customer'

    if (NOTIFICATION_CONFIG.DRY_RUN) {
      logger.info('DRY RUN: Would send SMS', {
        bookingId: booking.id,
        customerId: customer.id,
        phone: customer.phone,
        message,
        customerName
      })
      return { success: true, dryRun: true }
    }

    // Send SMS via Podium
    const result = await sendTextMessage(
      customer.phone,
      message,
      customerName
    )

    logger.info('SMS sent successfully', {
      bookingId: booking.id,
      customerId: customer.id,
      phone: customer.phone,
      messageId: result.data.uid
    })

    return { success: true, messageId: result.data.uid }

  } catch (error) {
    logger.error('Failed to send SMS', error, {
      bookingId: booking.id,
      customerId: customer.id,
      phone: customer.phone
    })

    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * Check if a booking is eligible for notification
 */
export function isEligibleForNotification(booking: Booking): boolean {
  const now = new Date()
  const bookingTime = new Date(booking.startTime)
  const timeDiff = Math.abs(now.getTime() - bookingTime.getTime()) / (1000 * 60) // minutes
  
  // Check if within 5 minutes
  const withinTimeWindow = timeDiff <= NOTIFICATION_CONFIG.TIME_WINDOW_MINUTES
  
  // Check if notification already sent
  const hasNotificationNote = booking.notes?.some(note => 
    note.text === NOTIFICATION_CONFIG.REMINDER_NOTE_TEXT
  )
  
  logger.info('Checking notification eligibility', {
    bookingId: booking.id,
    withinTimeWindow,
    hasNotificationNote,
    timeDiffMinutes: Math.round(timeDiff),
    eligible: withinTimeWindow && !hasNotificationNote
  })
  
  return withinTimeWindow && !hasNotificationNote
} 