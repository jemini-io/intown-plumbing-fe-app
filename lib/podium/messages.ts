import { podiumClient } from "./client";
import {
  ChannelType,
  PodiumMessageRequest,
  PodiumMessageResponse,
} from "./types";
import { createOrUpdateContact } from "./contacts";
import { PODIUM_LOCATION_ID } from "../utils/constants";

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
export async function sendPodiumMessage(data: SendMessageData) {
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
  // Send the message
  return sendPodiumMessage({
    phoneNumber: phoneNumber,
    body: message,
    locationUid: PODIUM_LOCATION_ID,
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
  const message = [
    `Hi ${name}! You are confirmed for ${formattedDate} at ${formattedTime}.`,
    `You'll receive a link 5 mins before your scheduled call.`,
    `For questions or to reschedule, call or text this number.`,
  ].join("\n");
  return sendTextMessage(phoneNumber, message, name);
}
