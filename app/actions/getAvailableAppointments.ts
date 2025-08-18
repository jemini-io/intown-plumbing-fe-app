'use server';

import { DateEntry, getAvailableTimeSlots } from '@/app/api/appointments/getAppointments';
import { QuoteSkill, ServiceToJobTypeMapping } from '@/lib/config/types';
import pino from 'pino';

const logger = pino({ name: "getAvailableAppointmentsAction" });

export interface GetAvailableAppointmentsResponse {
  success: boolean;
  data?: DateEntry[];
  error?: string;
}

export async function getAvailableAppointmentsAction(selectedJobType: ServiceToJobTypeMapping | null, selectedSkill?: QuoteSkill | null): Promise<GetAvailableAppointmentsResponse> {
  try {
    if (!selectedJobType) {
      logger.warn('No job type selected');
      return {
        success: false,
        error: 'No job type selected'
      };
    }

    logger.info(
      {
        serviceTitanId: selectedJobType.serviceTitanId,
        skill: selectedSkill
      },
      'Fetching available time slots'
    );

    const timeSlots = await getAvailableTimeSlots({
      serviceTitanId: selectedJobType.serviceTitanId,
      skill: selectedSkill || undefined
    });

    if (!timeSlots || timeSlots.length === 0) {
      logger.warn(
        {
          serviceTitanId: selectedJobType.serviceTitanId,
          skill: selectedSkill
        },
        'No available time slots found'
      );
      
      return {
        success: false,
        error: 'No appointments available right now. Please try again later.'
      };
    }

    logger.info(
      {
        count: timeSlots.length,
        serviceTitanId: selectedJobType.serviceTitanId
      },
      'Successfully fetched available time slots'
    );

    timeSlots.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      success: true,
      data: timeSlots
    };
  } catch (error) {
    logger.error({ err: error }, 'Failed to fetch available appointments');

    return {
      success: false,
      error: 'Failed to load available time slots. Please try again.'
    };
  }
}
