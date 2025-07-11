import { NOTIFICATION_CONFIG, validateConfig } from './config'
import { logger } from './logger'
import { calculateTimeWindow, queryBookingsInTimeWindow, addBookingNote } from './booking-queries'
import { sendConsultationReminder, isEligibleForNotification } from './notification-service'
import { NotificationMetrics } from './types'

/**
 * Utility function to chunk array into batches
 */
function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

/**
 * Process a batch of bookings
 */
async function processBookingBatch(bookings: any[], metrics: NotificationMetrics) {
  const promises = bookings.map(async (booking) => {
    try {
      if (isEligibleForNotification(booking)) {
        metrics.eligibleBookings++
        
        // Send SMS
        const smsResult = await sendConsultationReminder(booking, booking.customer)
        
        // Add note if SMS was successful
        if (smsResult.success) {
          const noteResult = await addBookingNote(booking.id, NOTIFICATION_CONFIG.REMINDER_NOTE_TEXT)
          
          if (noteResult.success) {
            metrics.notificationsSent++
            logger.info('Notification sent successfully', {
              bookingId: booking.id,
              customerId: booking.customer.id,
              dryRun: NOTIFICATION_CONFIG.DRY_RUN
            })
          } else {
            logger.error('Failed to add notification note', {
              bookingId: booking.id,
              error: noteResult.error
            })
          }
        } else {
          logger.error('Failed to send SMS', {
            bookingId: booking.id,
            error: smsResult.error
          })
        }
      }
    } catch (error) {
      metrics.errors++
      logger.error('Failed to process booking', error, {
        bookingId: booking.id
      })
    }
  })
  
  await Promise.all(promises)
}

/**
 * Main function to check and send booking notifications
 */
export async function checkAndSendBookingNotifications() {
  const startTime = Date.now()
  const metrics: NotificationMetrics = {
    totalBookings: 0,
    eligibleBookings: 0,
    notificationsSent: 0,
    errors: 0,
    dryRun: NOTIFICATION_CONFIG.DRY_RUN
  }

  try {
    // Validate configuration
    validateConfig()
    
    logger.info('Starting booking notification task', {
      dryRun: NOTIFICATION_CONFIG.DRY_RUN,
      bookingType: NOTIFICATION_CONFIG.BOOKING_TYPE,
      timeWindowMinutes: NOTIFICATION_CONFIG.TIME_WINDOW_MINUTES
    })

    // 1. Get current time window (±5 minutes)
    const timeWindow = calculateTimeWindow()
    
    // 2. Query bookings with custom type in time window
    const bookings = await queryBookingsInTimeWindow(timeWindow)
    metrics.totalBookings = bookings.length
    
    if (bookings.length === 0) {
      logger.info('No bookings found in time window', {
        start: timeWindow.start.toISOString(),
        end: timeWindow.end.toISOString()
      })
      return metrics
    }
    
    // 3. Process bookings in batches
    const batches = chunk(bookings, 10) // Process 10 at a time
    
    for (const batch of batches) {
      await processBookingBatch(batch, metrics)
    }
    
    // 4. Log final metrics
    const duration = Date.now() - startTime
    metrics.duration = duration
    
    logger.info('Task completed', metrics)
    
    return metrics
    
  } catch (error) {
    metrics.errors++
    const duration = Date.now() - startTime
    metrics.duration = duration
    
    logger.error('Task failed', error, metrics)
    throw error
  }
}

/**
 * Entry point for the cron job
 */
if (require.main === module) {
  checkAndSendBookingNotifications()
    .then((metrics) => {
      logger.info('Cron job completed successfully', metrics)
      process.exit(0)
    })
    .catch((error) => {
      logger.error('Cron job failed', error)
      process.exit(1)
    })
} 