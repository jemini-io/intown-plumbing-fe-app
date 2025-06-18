import { wherebyClient } from './client';
import { CreateMeetingRequest, WherebyMeeting } from './types';

export async function createConsultationMeeting(
  startTime: string,
  endTime: string,
  customerName: string
): Promise<WherebyMeeting> {
  // Create a room name prefix from customer name (lowercase, no spaces, max 39 chars)
  const roomNamePrefix = customerName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 39);

  const meetingData: CreateMeetingRequest = {
    endDate: endTime, // Required field
    startDate: startTime, // Deprecated but still accepted
    roomMode: 'normal',
    roomNamePrefix,
    roomNamePattern: 'uuid',
    fields: ['hostRoomUrl'], // Request hostRoomUrl in response
  };

  try {
    const response = await wherebyClient.createMeeting(meetingData);
    
    return {
      meetingId: response.meetingId,
      roomUrl: response.roomUrl,
      hostRoomUrl: response.hostRoomUrl,
      viewerRoomUrl: response.viewerRoomUrl,
      startDate: response.startDate,
      endDate: response.endDate,
      roomName: response.roomName,
      roomMode: 'normal',
    };
  } catch (error) {
    console.error('[Whereby] Error creating meeting:', error);
    throw new Error('Failed to create Whereby meeting');
  }
}

// Stub function for future ServiceTitan integration
export async function updateServiceTitanWithMeetingDetails(
  jobId: string,
  meetingDetails: WherebyMeeting
): Promise<void> {
  // TODO: Implement ServiceTitan custom fields update
  // This could be either on the job or appointment level
  // You'll need to decide which makes more sense for your workflow
  
  console.log(`[Whereby] Stub: Would update ServiceTitan job ${jobId} with meeting details:`, {
    meetingId: meetingDetails.meetingId,
    roomUrl: meetingDetails.roomUrl,
    hostRoomUrl: meetingDetails.hostRoomUrl,
    viewerRoomUrl: meetingDetails.viewerRoomUrl,
    startDate: meetingDetails.startDate,
    endDate: meetingDetails.endDate,
    roomName: meetingDetails.roomName,
  });
  
  // Example of what this might look like:
  // await serviceTitanClient.updateJobCustomFields(jobId, {
  //   wherebyMeetingId: meetingDetails.meetingId,
  //   wherebyRoomUrl: meetingDetails.roomUrl,
  //   wherebyHostRoomUrl: meetingDetails.hostRoomUrl,
  //   wherebyViewerRoomUrl: meetingDetails.viewerRoomUrl,
  //   wherebyStartDate: meetingDetails.startDate,
  //   wherebyEndDate: meetingDetails.endDate,
  //   wherebyRoomName: meetingDetails.roomName,
  // });
}

export async function getMeeting(meetingId: string): Promise<WherebyMeeting> {
  try {
    const response = await wherebyClient.getMeeting(meetingId, ['hostRoomUrl']);
    
    return {
      meetingId: response.meetingId,
      roomUrl: response.roomUrl,
      hostRoomUrl: response.hostRoomUrl,
      viewerRoomUrl: response.viewerRoomUrl,
      startDate: response.startDate,
      endDate: response.endDate,
      roomName: response.roomName,
      roomMode: 'normal',
    };
  } catch (error) {
    console.error('[Whereby] Error getting meeting:', error);
    throw new Error('Failed to get Whereby meeting');
  }
}

export async function deleteMeeting(meetingId: string): Promise<void> {
  try {
    await wherebyClient.deleteMeeting(meetingId);
    console.log(`[Whereby] Successfully deleted meeting: ${meetingId}`);
  } catch (error) {
    console.error('[Whereby] Error deleting meeting:', error);
    throw new Error('Failed to delete Whereby meeting');
  }
} 