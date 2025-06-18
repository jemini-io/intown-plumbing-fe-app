'use server';

import { createJobAppointment } from "@/app/api/job/createJob";
import { sendAppointmentConfirmation } from "@/lib/podium";

export interface CreateJobData {
  name: string;
  email: string;
  phone: string;
  startTime: string;
  endTime: string;
  technicianId: string;
  jobTypeId: number;
  jobSummary: string;
  street: string;
  unit: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface CreateJobActionResult {
  success: boolean;
  id?: string;
  error?: string;
  notificationSent?: boolean;
}

export async function createJobAction(data: CreateJobData): Promise<CreateJobActionResult> {
  try {
    if (!data.name || !data.email || !data.phone || !data.startTime || !data.endTime || !data.technicianId || !data.jobTypeId) {
      return { success: false, error: "Missing required information" };
    }

    // Use the handler function to manage job creation
    const jobResponse = await createJobAppointment({
      job: {
        name: data.name,
        startTime: data.startTime,
        endTime: data.endTime,
        technicianId: data.technicianId,
        jobTypeId: data.jobTypeId,
        summary: data.jobSummary,
      },
      location: {
        street: data.street,
        unit: data.unit,
        city: data.city,
        state: data.state,
        zip: data.zip,
        country: data.country
      },
      customer: {
        name: data.name,
        email: data.email,
        phone: data.phone
      }
    });

    // Send confirmation notification via Podium
    let notificationSent = false;
    try {
      await sendAppointmentConfirmation(
        data.phone,
        new Date(data.startTime),
        data.name
      );
      notificationSent = true;
    } catch (notificationError) {
      console.error("[createJobAction] Error sending Podium notification:", notificationError);
      // Don't fail the entire job creation if notification fails
    }

    return { 
      success: true, 
      id: jobResponse.id,
      notificationSent 
    };
  } catch (error) {
    console.error("[createJobAction] Error creating job appointment:", JSON.stringify(error, null, 2));
    return { success: false, error: "Error creating job appointment" };
  }
} 