import { NOTIFICATION_CONFIG, validateConfig } from './config'
import { logger } from './logger'
import { calculateTimeWindow, queryJobsInTimeWindow, addJobNote } from './job-queries'
import { sendCustomerConsultationReminder, isEligibleForNotification, sendTechnicianConsultationReminder } from './notification-service'
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
        const smsResult = await sendCustomerConsultationReminder(job, job.customer)
        const technicianSmsResult = await sendTechnicianConsultationReminder(job)

        if (!smsResult.success || !technicianSmsResult.success) {
          logger.error({
            jobId: job.id,
            smsResult: smsResult,
            technicianSmsResult: technicianSmsResult,
          }, 'Failed to send SMS')
        }
        
        // Add note if SMS was successful (will be logged only in dry run)
        if (smsResult.success) {
          const noteResult = await addJobNote(job.id, NOTIFICATION_CONFIG.REMINDER_NOTE_TEXT)
          
          if (noteResult.success) {
            metrics.notificationsSent++
            logger.info({
              jobId: job.id,
              customerId: job.customer.id,
              dryRun: NOTIFICATION_CONFIG.DRY_RUN,
              smsSent: !smsResult.dryRun,
              noteAdded: !noteResult.dryRun
            }, 'Notification processed successfully')
          } else {
            logger.error({
              jobId: job.id,
              error: noteResult.error
            }, 'Failed to add notification note')
          }
        } else {
          logger.error({
            jobId: job.id,
            error: smsResult.error
          }, 'Failed to send SMS')
        }
      }
    } catch (error) {
      metrics.errors++
      logger.error({
        err: error,
        jobId: job.id
      }, 'Failed to process job')
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
    
    logger.info({
      dryRun: NOTIFICATION_CONFIG.DRY_RUN,
      timeWindowMinutes: NOTIFICATION_CONFIG.TIME_WINDOW_MINUTES
    }, 'Starting job notification task')

    // 1. Get current time window (±5 minutes)
    const timeWindow = calculateTimeWindow()
    
    // 2. Query jobs with appointment time in time window
    const jobs = await queryJobsInTimeWindow(timeWindow)
    metrics.totalJobs = jobs.length
    
    if (jobs.length === 0) {
      logger.info({
        start: timeWindow.start.toISOString(),
        end: timeWindow.end.toISOString()
      }, 'No jobs to send notifications for')
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
    
    logger.info({
      ...metrics
    }, 'Task completed')
    
    return metrics
    
  } catch (error) {
    metrics.errors++
    const duration = Date.now() - startTime
    metrics.duration = duration
    
    logger.error({
      err: error,
      ...metrics
    }, 'Task failed')
    throw error
  }
}

/**
 * Entry point for the cron job
 */
if (require.main === module) {
  checkAndSendJobNotifications()
    .then((metrics) => {
      logger.info({
        ...metrics
      }, 'Cron job completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      logger.error({
        err: error
      }, 'Cron job failed')
      process.exit(1)
    })
} 