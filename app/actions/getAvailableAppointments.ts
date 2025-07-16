'use server';

import { DateEntry, getAvailableTimeSlots } from '@/app/api/appointments/getAppointments';
import { QuoteSkill, ServiceToJobTypeMapping } from '@/lib/config/types';

export interface GetAvailableAppointmentsResponse {
  success: boolean;
  data?: DateEntry[];
  error?: string;
}

export async function getAvailableAppointmentsAction(selectedJobType: ServiceToJobTypeMapping | null, selectedSkill?: QuoteSkill | null): Promise<GetAvailableAppointmentsResponse> {
  try {
    if (!selectedJobType) {
      return {
        success: false,
        error: 'No job type selected'
      };
    }

    const timeSlots = await getAvailableTimeSlots({
      serviceTitanId: selectedJobType.serviceTitanId,
      skill: selectedSkill || undefined
    });

    return {
      success: true,
      data: timeSlots
    };
  } catch (error) {
    console.error('Failed to fetch available appointments:', error);
    return {
      success: false,
      error: 'Failed to load available time slots. Please try again.'
    };
  }
}
