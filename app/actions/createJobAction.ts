'use server';

import { createJobAppointment, getTechnician } from "@/app/api/job/createJob";
import { sendAppointmentConfirmation, sendTechnicianAppointmentConfirmation } from "@/lib/podium";
import { createConsultationMeeting, WherebyMeeting } from "@/lib/whereby";
import { ServiceTitanClient } from "@/lib/servicetitan";
import { Jpm_V2_CustomFieldModel, Jpm_V2_UpdateJobRequest } from "@/lib/servicetitan/generated/jpm";
import { config } from "@/lib/config";
import { env } from "@/lib/config/env";

export interface CreateJobData {
  name: string;
  email: string;
  phone: string;
  startTime: string;
  endTime: string;
  technicianId: number;
  jobTypeId: number;
  jobSummary: string;
  street: string;
  unit: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  // Bill To Address fields
  billToStreet?: string;
  billToUnit?: string;
  billToCity?: string;
  billToState?: string;
  billToZip?: string;
  billToCountry?: string;
  billToSameAsService?: boolean;
}

export interface CreateJobActionResult {
  success: boolean;
  id?: number;
  error?: string;
  notificationSent?: boolean;
  meetingCreated?: boolean;
  meetingDetails?: WherebyMeeting | null;
}

async function updateJobWithMeetingDetails(
  jobId: number,
  meetingDetails: WherebyMeeting
): Promise<void> {
  const serviceTitanClient = new ServiceTitanClient();

  // Prepare custom fields data with proper typing
  const customFields: Jpm_V2_CustomFieldModel[] = [
    {
      typeId: config.customFields.customerJoinLink,
      value: meetingDetails.roomUrl || null
    },
    {
      typeId: config.customFields.technicianJoinLink,
      value: meetingDetails.hostRoomUrl || null
    }
  ];

  // Update the job with custom fields - strongly typed
  const updateData: Jpm_V2_UpdateJobRequest = {
    customFields
  };

  // TODO: this probably shouldn't be here.
  await serviceTitanClient.jpm.JobsService.jobsUpdate({
    tenant: Number(env.servicetitan.tenantId),
    id: jobId,
    requestBody: updateData
  });

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
        phone: data.phone,
        // Bill To Address logic will be handled in createJobAppointment
        billToStreet: data.billToStreet,
        billToUnit: data.billToUnit,
        billToCity: data.billToCity,
        billToState: data.billToState,
        billToZip: data.billToZip,
        billToSameAsService: data.billToSameAsService
      }
    });

    // Send notification to technician
    const technician = await getTechnician(data.technicianId);
    const phoneNumber = technician.phoneNumber;
    if (phoneNumber) {
      await sendTechnicianAppointmentConfirmation(
        phoneNumber,
        new Date(data.startTime),
        technician.name,
      );
    }

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