'use server';

import { createJobAppointment, getTechnician } from "@/app/api/job/createJob";
import { sendAppointmentConfirmation, sendTechnicianAppointmentConfirmation, sendTechnicianAppointmentConfirmationToManager } from "@/lib/podium";
import { createConsultationMeeting, WherebyMeeting } from "@/lib/whereby";
import { ServiceTitanClient } from "@/lib/servicetitan";
import { Jpm_V2_CustomFieldModel, Jpm_V2_UpdateJobRequest } from "@/lib/servicetitan/generated/jpm";
import { env } from "@/lib/config/env";
import pino from "pino";
import { getCustomFields, getDefaultManagedTechId, } from "@/lib/appSettings/getConfig";

const logger = pino({ name: "createJobAction" });

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
  meetingDetails?: WherebyMeeting;
}

async function updateJobWithMeetingDetails(jobId: number, meetingDetails: WherebyMeeting) {
  const serviceTitanClient = new ServiceTitanClient();
  const tenantId = Number(env.servicetitan.tenantId);

  const customFieldsConfig = await getCustomFields();

  const customFields: Jpm_V2_CustomFieldModel[] = [
    {
      typeId: customFieldsConfig.customerJoinLink,
      value: meetingDetails.roomUrl || null
    },
    {
      typeId: customFieldsConfig.technicianJoinLinkLabel,
      value: meetingDetails.hostRoomUrl || null
    }
  ];

  const updateData: Jpm_V2_UpdateJobRequest = {
    customFields: customFields
  };

  await serviceTitanClient.jpm.JobsService.jobsUpdate({
    tenant: tenantId,
    id: jobId,
    requestBody: updateData
  });

  logger.info(
    {
      jobId,
      meetingId: meetingDetails.meetingId,
      customerJoinLink: meetingDetails.roomUrl,
      technicianJoinLink: meetingDetails.hostRoomUrl
    },
    `[createJobAction] Successfully updated ServiceTitan job ${jobId} with meeting details`
  );
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

    logger.info(
      {
        jobId: jobResponse.id,
        customer: {
          name: data.name,
          phone: data.phone,
          email: data.email,
        },
        technicianId: data.technicianId,
        jobTypeId: data.jobTypeId,
        startTime: data.startTime,
        endTime: data.endTime
      },
      "[createJobAction] Job created successfully"
    );

    // Send notification to original technician
    const originalTechnician = await getTechnician(data.technicianId);
    if (originalTechnician.phoneNumber) {
      await sendTechnicianAppointmentConfirmation(
        originalTechnician.phoneNumber,
        new Date(data.startTime),
        originalTechnician.name,
      );
    }

    // If original tech is non-managed, also notify the default managed tech
    // TODO: this really needs to pull from the appointment assignments list on the job.
    if (!originalTechnician.isManagedTech) {
      const defaultManagedTechId = await getDefaultManagedTechId();
      const managedTechnician = await getTechnician(defaultManagedTechId);
      if (managedTechnician.phoneNumber) {
        await sendTechnicianAppointmentConfirmationToManager(
          managedTechnician.phoneNumber,
          new Date(data.startTime),
          managedTechnician.name,
          originalTechnician.name,
        );
      }
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
      logger.error({ err: notificationError }, "Failed to send Podium notification");
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
      logger.error({ err: meetingError }, "Failed to create Whereby meeting");
      // Don't fail the entire job creation if meeting creation fails
    }

    return { 
      success: true, 
      id: jobResponse.id,
      notificationSent,
      meetingCreated,
      meetingDetails: meetingDetails || undefined
    };
  } catch (error) {
    logger.error({ err: error }, "[createJobAction] Error creating job appointment");
    
    return { success: false, error: "Error creating job appointment" };
  }
} 