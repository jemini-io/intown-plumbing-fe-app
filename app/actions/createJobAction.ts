'use server';

import { createJobAppointment } from "@/app/api/job/createJob";
import { sendAppointmentConfirmation } from "@/lib/podium";
import { createConsultationMeeting, WherebyMeeting } from "@/lib/whereby";
import { AuthService, JobService } from "@/app/api/services/services";
import { ServiceTitanCustomFieldModel, ServiceTitanUpdateJobRequest } from "@/app/api/servicetitan-api/types";
import { CUSTOM_FIELDS_MAPPING } from "@/lib/utils/constants";
import { env } from "@/lib/config/env";

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
  meetingCreated?: boolean;
  meetingDetails?: WherebyMeeting | null;
}

async function updateJobWithMeetingDetails(
  jobId: string,
  meetingDetails: WherebyMeeting
): Promise<void> {
  const authService = new AuthService(env.environment);
  const jobService = new JobService(env.environment);
  
  // Get auth token
  const authToken = await authService.getAuthToken(
    env.servicetitan.clientId,
    env.servicetitan.clientSecret
  );

  // Prepare custom fields data with proper typing
  const customFields: ServiceTitanCustomFieldModel[] = [
    {
      typeId: CUSTOM_FIELDS_MAPPING.customerJoinLink,
      value: meetingDetails.roomUrl || null
    },
    {
      typeId: CUSTOM_FIELDS_MAPPING.technicianJoinLink,
      value: meetingDetails.hostRoomUrl || null
    }
  ];

  // Update the job with custom fields - strongly typed
  const updateData: ServiceTitanUpdateJobRequest = {
    customFields
  };

  await jobService.updateJob(
    authToken,
    env.servicetitan.appKey,
    env.servicetitan.tenantId,
    jobId,
    updateData
  );

  console.log(`[createJobAction] Successfully updated ServiceTitan job ${jobId} with meeting details:`, {
    meetingId: meetingDetails.meetingId,
    customerJoinLink: meetingDetails.roomUrl,
    technicianJoinLink: meetingDetails.hostRoomUrl,
  });
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

    // Create Whereby meeting
    let meetingCreated = false;
    let meetingDetails = null;
    try {
      meetingDetails = await createConsultationMeeting(
        data.startTime,
        data.endTime,
        data.name
      );
      meetingCreated = true;
      
      // Update ServiceTitan with meeting details
      await updateJobWithMeetingDetails(jobResponse.id, meetingDetails);
      
    } catch (meetingError) {
      console.error("[createJobAction] Error creating Whereby meeting:", meetingError);
      // Don't fail the entire job creation if meeting creation fails
    }

    return { 
      success: true, 
      id: jobResponse.id,
      notificationSent,
      meetingCreated,
      meetingDetails
    };
  } catch (error) {
    console.error("[createJobAction] Error creating job appointment:", JSON.stringify(error, null, 2));
    return { success: false, error: "Error creating job appointment" };
  }
} 