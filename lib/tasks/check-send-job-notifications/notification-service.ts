import { sendTextMessage } from '../../podium/messages'
import { NOTIFICATION_CONFIG } from './config'
import { logger } from './logger'
import { Customer, SMSResult } from './types'
import { Jpm_V2_JobResponse } from '../../servicetitan/generated/jpm/models/Jpm_V2_JobResponse'
import { EnrichedJob } from './types'
import { config } from "@/lib/config";
import { getTechnicianFromJob } from '@/app/api/job/createJob'
import { env } from '@/lib/config/env'

/**
 * Extract the customer join link from job custom fields
 */
function getCustomerJoinLink(job: Jpm_V2_JobResponse): string | undefined {
  const fieldId = config.customFields.customerJoinLink;
  const field = job.customFields?.find(f => f.typeId === fieldId);
  return field?.value;
}

function getTechnicianJoinLink(job: Jpm_V2_JobResponse): string | undefined {
  const fieldId = config.customFields.technicianJoinLink;
  const field = job.customFields?.find(f => f.typeId === fieldId);
  return field?.value;
}

/**
 * Format SMS message using job and customer data
 */
function formatSMSMessage(job: Jpm_V2_JobResponse, customer: Customer): string {
  const customerName = `${customer.firstName}`.trim() || 'there';
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
        text: message,
        customerName
      });
      return { success: true, dryRun: true };
    }

    // Send SMS via Podium
    await sendTextMessage(
      customer.phone,
      message,
      customerName
    );

    logger.info('SMS sent successfully', {
      jobId: job.id,
      customerId: customer.id,
      phone: customer.phone,
    });

    return { success: true, messageId: 'unknown' };

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

export async function sendTechnicianConsultationReminder(job: Jpm_V2_JobResponse): Promise<SMSResult> {
  const technician = await getTechnicianFromJob(job.id);
  // get phone number
  let phoneNumber = technician.phoneNumber;
  if (!phoneNumber) {
    return {
      success: false,
      error: "Technician has no phone number"
    };
  }
  const technicianName = `${technician.name}`.trim() || 'Technician';
  if (!technicianName) {
    return {
      success: false,
      error: "Technician has no name"
    };
  }
  // get join link
  const joinLink = getTechnicianJoinLink(job);
  if (!joinLink) {
    return {
      success: false,
      error: "Technician has no join link"
    };
  }
  const message = `Hi ${technicianName}! You're next Virtual Consultation starts in 5 mins. Here's the join link: ${joinLink}`;
  if (env.podium.useTestTechnicianNumber) {
    console.log(`Using technician test number: ${env.podium.useTestTechnicianNumber}`);
    phoneNumber = env.podium.useTestTechnicianNumber;
  }
  const result = await sendTextMessage(phoneNumber, message, technicianName);
  if (result.data.uid) {
    return {
      success: true,
      messageId: result.data.uid
    };
  }
  return {
    success: false,
    error: "Failed to send SMS to technician",
    messageId: "unknown"
  };
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

  // check if phone number exists
  const phoneNumberExists = job.customer.phone !== null && job.customer.phone !== undefined && job.customer.phone !== '';

  logger.info('Checking notification eligibility', {
    jobId: job.id,
    withinTimeWindow,
    hasNotificationNote,
    timeDiffMinutes: Math.round(timeDiff),
    phoneNumberExists,
    eligible: withinTimeWindow && !hasNotificationNote && phoneNumberExists
  });

  return withinTimeWindow && !hasNotificationNote && phoneNumberExists;
} 