import { podiumClient } from "./client";
import {
  ChannelType,
  PodiumMessageRequest,
  PodiumMessageResponse,
} from "./types";
import { createOrUpdateContact } from "./contacts";
import { config } from "../config";
import { env } from "../config/env";

/**
 * Format phone number to E.164 format for consistent API usage
 * @param phone - Phone number string
 * @returns Formatted phone number in E.164 format (+15551234567)
 */
function formatPhoneForSubmission(phone: string): string {
  try {
    // Simple regex-based formatting for common US phone number patterns
    const cleaned = phone.replace(/\D/g, ''); // Remove all non-digits
    
    // If it's already in E.164 format (starts with +1), return as is
    if (phone.startsWith('+1') && phone.length === 12) {
      return phone;
    }
    
    // If it's a 10-digit US number, add +1
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    }
    
    // If it's an 11-digit number starting with 1, add +
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    }
    
    // If it's already in E.164 format without +, add it
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    }
    
    // Fallback: return original if we can't parse it
    return phone;
  } catch {
    return phone; // Fallback to original if parsing fails
  }
}

export interface SendMessageData {
  phoneNumber: string;
  body: string;
  locationUid: string;
  contactName: string;
  channelType: ChannelType; // e.g. "phone" or "email"
  subject?: string;
  senderName?: string;
}

/**
 * Send a text message to a contact
 */
async function sendPodiumMessage(data: SendMessageData) {
  console.log(`Sending message to ${data.phoneNumber} with body: ${data.body}`);

  // Ensure the contact exists and get their info
  await createOrUpdateContact({
    phoneNumber: data.phoneNumber,
    name: data.contactName,
  });


  // Build the request body as per OpenAPI spec
  const messageRequest: PodiumMessageRequest = {
    body: data.body,
    channel: {
      identifier: data.phoneNumber,
      type: data.channelType,
    },
    locationUid: data.locationUid,
    contactName: data.contactName,
    subject: data.subject,
    senderName: data.senderName,
  };

  // Send the message
  const response = await podiumClient.post<PodiumMessageResponse>(
    "/messages",
    messageRequest
  );
  return response.data;
}

/**
 * Send a text message using phone number (creates/updates contact if needed)
 */
export async function sendTextMessage(
  phoneNumber: string,
  message: string,
  contactName: string
): Promise<PodiumMessageResponse> {
  // Format phone number for consistent API usage
  const formattedPhone = formatPhoneForSubmission(phoneNumber);

  if (!env.podium.enabled) {
    console.log(`Podium is disabled. Skipping message to technician (phone number: ${phoneNumber}):`, message);
    return {
      data: {
        body: message,
        contact: {
          name: contactName,
          uid: "podium-disabled",
        },
        contactName: contactName,
        conversation: {
          uid: "podium-disabled",
          channel: {
            identifier: formattedPhone,
            type: "phone",
          },
        },
        createdAt: new Date().toISOString(),
        location: {
          uid: config.podium.locationId,
        },
        sender: {
          uid: ""
        },
        senderUid: "",
        uid: ""
      },
      metadata: {
        url: "podium-disabled",
      },
    };
  }

  // if app env = test, append " (TEST ENVIRONMENT)" to the message
  if (env.appEnv === "test") {
    message += "\n\n(TEST ENVIRONMENT)";
  }

  return sendPodiumMessage({
    phoneNumber: formattedPhone,
    body: message,
    locationUid: config.podium.locationId,
    contactName: contactName,
    channelType: "phone",
  });
}

/**
 * Template:
 * Hi {name}! You are confirmed for {date} at {time}
 *
 * You'll receive a link 5 mins before your scheduled call.
 *
 * For questions or to reschedule, call or text this number.
 *
 * Timezone: CT
 *
 * @param date
 * @param name
 * @returns
 */
export async function sendAppointmentConfirmation(
  phoneNumber: string,
  date: Date,
  name: string
) {
  const formattedDateAtTime = formatDateAtTimeString(date);
  const message = [
    `Hi ${name}! You are confirmed for ${formattedDateAtTime}.`,
    `You'll receive a link 5 mins before your scheduled call.`,
    `For questions or to reschedule, call or text this number.`,
  ].join("\n");
  return sendTextMessage(phoneNumber, message, name);
}


export async function sendTechnicianAppointmentConfirmation(
  phoneNumber: string,
  date: Date,
  name: string
) {
  if (env.podium.useTestTechnicianNumber) {
    console.log(`Using technician test number: ${env.podium.useTestTechnicianNumber}`);
    phoneNumber = env.podium.useTestTechnicianNumber;
  }

  const formattedDateAtTime = formatDateAtTimeString(date);
  const message = [
    `Hi ${name}! A new Virtual Consultation is booked for ${formattedDateAtTime}.`,
    `You'll receive a link 5 mins before the scheduled call.`, 
  ].join("\n");
  return sendTextMessage(phoneNumber, message, name);
}


function formatDateAtTimeString(date: Date): string {
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "America/Chicago",
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Chicago",
  });
  return `${formattedDate} at ${formattedTime}`;
}