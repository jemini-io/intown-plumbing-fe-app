'use server';

import axios from 'axios';

interface NotificationData {
  name: string;
  date: string;
  time: string;
  phoneNumber: string;
}

export async function sendConsultationNotification(data: NotificationData) {
  const message = `
Hey ${data.name},

You are confirmed for ${data.date} at ${data.time}.

You'll receive a link 5 mins before your scheduled call.

For questions or to reschedule call or text: (469) 936-4227.
`.trim();

  try {
    await axios.post(
      `${process.env.PODIUM_API_URL}/v4/messages`,
      {
        contactPhoneNumber: data.phoneNumber,
        message: message,
        type: "text"
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.PODIUM_API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Failed to send notification:', error);
    // Don't throw - we don't want to block the booking flow
  }
} 