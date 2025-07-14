import { sendTextMessage } from '../../podium/messages'
import { NOTIFICATION_CONFIG } from './config'
import { logger } from './logger'
import { Customer, SMSResult } from './types'
import { Jpm_V2_JobResponse } from '../../servicetitan/generated/jpm/models/Jpm_V2_JobResponse'
import { EnrichedJob } from './types'
import { CUSTOM_FIELDS_MAPPING } from '../../utils/constants'

/**
 * Extract the customer join link from job custom fields
 */
function getCustomerJoinLink(job: Jpm_V2_JobResponse): string | undefined {
  const fieldId = CUSTOM_FIELDS_MAPPING.customerJoinLink;
  const field = job.customFields?.find(f => f.typeId === fieldId);
  return field?.value;
}

/**
 * Format SMS message using job and customer data
 */
function formatSMSMessage(job: Jpm_V2_JobResponse, customer: Customer): string {
  const customerName = `${customer.firstName} ${customer.lastName}`.trim() || 'there';
  const customerJoinLink = getCustomerJoinLink(job) || '[link unavailable]';
  return `Hey, ${customerName}, your InTown Plumbing consultation is starting in 5 mins!\n\nFollow this link to join: ${customerJoinLink}`;
}

/**
 * Send consultation reminder SMS
 */
export async function sendConsultationReminder(job: Jpm_V2_JobResponse, customer: Customer): Promise<SMSResult> {
  try {
    const message = formatSMSMessage(job, customer);
    const customerName = `${customer.firstName} ${customer.lastName}`.trim() || 'Customer';

    if (NOTIFICATION_CONFIG.DRY_RUN) {
      logger.info('DRY RUN: Would send SMS', {
        jobId: job.id,
        customerId: customer.id,
        phone: customer.phone,
        message,
        customerName
      });
      return { success: true, dryRun: true };
    }

    // Send SMS via Podium
    const result = await sendTextMessage(
      customer.phone,
      message,
      customerName
    );

    logger.info('SMS sent successfully', {
      jobId: job.id,
      customerId: customer.id,
      phone: customer.phone,
      messageId: result.data.uid
    });

    return { success: true, messageId: result.data.uid };

  } catch (error) {
    logger.error('Failed to send SMS', error, {
      jobId: job.id,
      customerId: customer.id,
      phone: customer.phone
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Check if a job is eligible for notification
 */
export function isEligibleForNotification(job: EnrichedJob): boolean {
  const now = new Date();
  const appointmentTime = job.startTime ? new Date(job.startTime) : null;
  if (!appointmentTime) return false;
  const timeDiff = Math.abs(now.getTime() - appointmentTime.getTime()) / (1000 * 60); // minutes

  // Check if within 5 minutes
  const withinTimeWindow = timeDiff <= NOTIFICATION_CONFIG.TIME_WINDOW_MINUTES;

  // Check if notification already sent
  const hasNotificationNote = job.notes?.some(note =>
    note.text === NOTIFICATION_CONFIG.REMINDER_NOTE_TEXT
  );

  logger.info('Checking notification eligibility', {
    jobId: job.id,
    withinTimeWindow,
    hasNotificationNote,
    timeDiffMinutes: Math.round(timeDiff),
    eligible: withinTimeWindow && !hasNotificationNote
  });

  return withinTimeWindow && !hasNotificationNote;
} 