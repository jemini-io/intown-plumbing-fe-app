import { sendTextMessage } from '../../podium/messages'
import { NOTIFICATION_CONFIG } from './config'
import { logger } from './logger'
import { Customer, SMSResult } from './types'
import { Jpm_V2_JobResponse } from '../../servicetitan/generated/jpm/models/Jpm_V2_JobResponse'
import { EnrichedJob } from './types'
import { getCustomFields } from '@/lib/appSettings/getConfig'
import { getTechnicianFromJob } from '@/app/api/job/createJob'
import { env } from '@/lib/config/env'

/**
 * Extract the customer join link from job custom fields
 */
async function getCustomerJoinLink(job: Jpm_V2_JobResponse): Promise<string | undefined> {
  const customFields = await getCustomFields();
  const fieldId = customFields.customerJoinLink;
  const field = job.customFields?.find(f => f.typeId === fieldId);
  return field?.value;
}

async function getTechnicianJoinLink(job: Jpm_V2_JobResponse): Promise<string | undefined> {
  const customFields = await getCustomFields();
  const fieldId = customFields.technicianJoinLink;
  const field = job.customFields?.find(f => f.typeId === fieldId);
  return field?.value;
}

/**
 * Format SMS message using job and customer data
 */
function formatCustomerSMSMessage(customerName: string, customerJoinLink: string): string {
  return `Hey, ${customerName}, your InTown Plumbing consultation is starting in 5 mins!\n\nFollow this link to join: ${customerJoinLink}`;
}

/**
 * Send consultation reminder SMS
 */
export async function sendCustomerConsultationReminder(job: Jpm_V2_JobResponse, customer: Customer): Promise<SMSResult> {
  try {

    const customerJoinLink = await getCustomerJoinLink(job)
    if (!customerJoinLink) {
      return {
        success: false,
        error: "Customer has no join link"
      };
    }

    const customerName = `${customer.firstName} ${customer.lastName}`.trim() || 'there';
    const message = formatCustomerSMSMessage(customerName, customerJoinLink);

    if (NOTIFICATION_CONFIG.DRY_RUN) {
      logger.info({
        jobId: job.id,
        customerId: customer.id,
        phone: customer.phone,
        text: message,
        customerName
      }, 'DRY RUN: Would send SMS');
      return { success: true, dryRun: true };
    }

    // Send SMS via Podium
    await sendTextMessage(
      customer.phone,
      message,
      customerName
    );

    logger.info({
      jobId: job.id,
      customerId: customer.id,
      phone: customer.phone,
      customerName: customerName,
    }, 'SMS sent successfully');

    return { success: true, messageId: 'unknown' };

  } catch (error) {
    logger.error({
      err: error,
      jobId: job.id,
      customerId: customer.id,
      phone: customer.phone
    }, 'Failed to send SMS');

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
    logger.info({
      phoneNumber: env.podium.useTestTechnicianNumber,
    }, "Using technician test number")
    phoneNumber = env.podium.useTestTechnicianNumber;
  }
  await sendTextMessage(phoneNumber, message, technicianName);
  return {
    success: true,
    messageId: 'unknown'
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

  logger.info({
    jobId: job.id,
    withinTimeWindow,
    hasNotificationNote,
    timeDiffMinutes: Math.round(timeDiff),
    phoneNumberExists,
    eligible: withinTimeWindow && !hasNotificationNote && phoneNumberExists
  }, 'Checking notification eligibility');

  return withinTimeWindow && !hasNotificationNote && phoneNumberExists;
} 