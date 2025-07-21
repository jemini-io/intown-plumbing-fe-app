import { NOTIFICATION_CONFIG, validateConfig } from './config'
import { logger } from './logger'
import { calculateTimeWindow, queryJobsInTimeWindow, addJobNote } from './job-queries'
import { sendConsultationReminder, isEligibleForNotification, sendTechnicianAppointmentConfirmation } from './notification-service'
import { EnrichedJob, NotificationMetrics } from './types'

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
 * Process a batch of jobs
 */
async function processJobBatch(jobs: EnrichedJob[], metrics: NotificationMetrics) {
  const promises = jobs.map(async (job) => {
    try {
      if (isEligibleForNotification(job)) {
        metrics.eligibleJobs++
        
        // Send SMS (will be logged only in dry run)
        const smsResult = await sendConsultationReminder(job, job.customer)
        const technicianSmsResult = await sendTechnicianAppointmentConfirmation(job)

        if (!smsResult.success || !technicianSmsResult.success) {
          logger.error('Failed to send SMS', {
            jobId: job.id,
            error: smsResult.error || technicianSmsResult.error
          })
        }
        
        // Add note if SMS was successful (will be logged only in dry run)
        if (smsResult.success) {
          const noteResult = await addJobNote(job.id, NOTIFICATION_CONFIG.REMINDER_NOTE_TEXT)
          
          if (noteResult.success) {
            metrics.notificationsSent++
            logger.info('Notification processed successfully', {
              jobId: job.id,
              customerId: job.customer.id,
              dryRun: NOTIFICATION_CONFIG.DRY_RUN,
              smsSent: !smsResult.dryRun,
              noteAdded: !noteResult.dryRun
            })
          } else {
            logger.error('Failed to add notification note', {
              jobId: job.id,
              error: noteResult.error
            })
          }
        } else {
          logger.error('Failed to send SMS', {
            jobId: job.id,
            error: smsResult.error
          })
        }
      }
    } catch (error) {
      metrics.errors++
      logger.error('Failed to process job', error, {
        jobId: job.id
      })
    }
  })
  
  await Promise.all(promises)
}

/**
 * Main function to check and send job notifications
 */
export async function checkAndSendJobNotifications() {
  const startTime = Date.now()
  const metrics: NotificationMetrics = {
    totalJobs: 0,
    eligibleJobs: 0,
    notificationsSent: 0,
    errors: 0,
    dryRun: NOTIFICATION_CONFIG.DRY_RUN
  }

  try {
    // Validate configuration
    validateConfig()
    
    logger.info('Starting job notification task', {
      dryRun: NOTIFICATION_CONFIG.DRY_RUN,
      jobTypeFilter: NOTIFICATION_CONFIG.JOB_TYPE_FILTER,
      timeWindowMinutes: NOTIFICATION_CONFIG.TIME_WINDOW_MINUTES
    })

    // 1. Get current time window (±5 minutes)
    const timeWindow = calculateTimeWindow()
    
    // 2. Query jobs with appointment time in time window
    const jobs = await queryJobsInTimeWindow(timeWindow)
    metrics.totalJobs = jobs.length
    
    if (jobs.length === 0) {
      logger.info('No jobs found in time window', {
        start: timeWindow.start.toISOString(),
        end: timeWindow.end.toISOString()
      })
      return metrics
    }
    
    // 3. Process jobs in batches
    const batches = chunk(jobs, 10) // Process 10 at a time
    
    for (const batch of batches) {
      await processJobBatch(batch, metrics)
    }
    
    // 4. Log final metrics
    const duration = Date.now() - startTime
    metrics.duration = duration
    
    logger.info('Task completed', { ...metrics })
    
    return metrics
    
  } catch (error) {
    metrics.errors++
    const duration = Date.now() - startTime
    metrics.duration = duration
    
    logger.error('Task failed', error, { ...metrics })
    throw error
  }
}

/**
 * Entry point for the cron job
 */
if (require.main === module) {
  checkAndSendJobNotifications()
    .then((metrics) => {
      logger.info('Cron job completed successfully', { ...metrics })
      process.exit(0)
    })
    .catch((error) => {
      logger.error('Cron job failed', error)
      process.exit(1)
    })
} 