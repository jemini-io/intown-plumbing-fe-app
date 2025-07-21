import { ServiceTitanClient } from '@/lib/servicetitan';
import { env } from "@/lib/config/env";
import { Jpm_V2_AppointmentResponse, PaginatedResponse_Of_Jpm_V2_AppointmentResponse } from '@/lib/servicetitan/generated/jpm';
import { QuoteSkill } from '@/lib/config/types';
import { config } from '@/lib/config';
import pino from 'pino';

const logger = pino({ name: 'getAvailableTimeSlots' });

const { servicetitan: { tenantId } } = env;

interface Technician {
    id: string;
    name: string;
}

export interface TimeSlot {
    time: string; // UTC ISO String
    technicians: Technician[];
}

export interface DateEntry {
    date: string; // CT Date String like "6/17/2025"
    timeSlots: TimeSlot[];
}

export interface JobType {
    serviceTitanId: number;
    skill?: string;
}

/**
 * Need to get all technicians in the "Virtual Service" business unit
 * Accepts job details: skills and serviceTitanId
 */
export async function getAvailableTimeSlots(jobType: JobType): Promise<DateEntry[]> {
    logger.info({ jobType }, 'Starting getAvailableTimeSlots');

    const serviceTitanClient = new ServiceTitanClient();
    const now = new Date();

    // ST API does not return the skills for technicians.
    // const getTechsList = await client.settings.TechniciansService.techniciansGetList({
    //     tenant: tenantId,
    //     pageSize: 1000,
    // });
    // const allTechs = getTechsList.data || getTechsList;
    const techsSkillsList = config.technicianToSkills;

    // Get ST Job Type
    const jobTypeResponse = await serviceTitanClient.jpm.JobTypesService.jobTypesGet({
        tenant: tenantId,
        id: jobType.serviceTitanId
    });
    const jobTypeSkills = jobTypeResponse.skills;

    // Filter techs for matching skills
    let filteredTechs = techsSkillsList;
    if (jobType.skill) {
        // If a specific skill is provided, filter for that skill
        filteredTechs = techsSkillsList.filter((tech) => tech.skills.includes(jobType.skill as QuoteSkill));
        // console.log(`Found ${filteredTechs.length} technicians for job type ${jobType.serviceTitanId} with skill ${jobType.skill}: ${filteredTechs.map((tech) => tech.technicianName).join(', ')}`);
        logger.info(`Found ${filteredTechs.length} technicians for job type ${jobType.serviceTitanId} with skill ${jobType.skill}: ${filteredTechs.map((tech) => tech.technicianName).join(', ')}`);
    } else {
        // Otherwise, filter by jobTypeSkills as before
        filteredTechs = techsSkillsList.filter((tech) => {
            return tech.skills.some((skill) => jobTypeSkills.includes(skill));
        });
        // console.log(`Found ${filteredTechs.length} technicians for job type ${jobType.serviceTitanId} with skills ${jobTypeResponse.skills.join(', ')}: ${filteredTechs.map((tech) => tech.technicianName).join(', ')}`);
        logger.info(`Found ${filteredTechs.length} technicians for job type ${jobType.serviceTitanId} with skills ${jobTypeResponse.skills.join(', ')}: ${filteredTechs.map((tech) => tech.technicianName).join(', ')}`);
    }

    // For each technician, fetch shifts and appointments, then aggregate
    const availableTimeSlots: DateEntry[] = [];

    for (const tech of filteredTechs) {
        // Fetch shifts for this technician
        const twoWeeksFromNow = new Date(now);
        twoWeeksFromNow.setDate(now.getDate() + 14);

        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);

        const shiftsResponse = await serviceTitanClient.dispatch.TechnicianShiftsService.technicianShiftsGetList({
            tenant: tenantId,
            technicianId: tech.technicianId,
            startsOnOrAfter: startOfToday.toISOString(),
            endsOnOrBefore: twoWeeksFromNow.toISOString()
        });
        const shifts = shiftsResponse.data;

        // Fetch appointments for this technician
        const appointmentsResponse = await serviceTitanClient.jpm.AppointmentsService.appointmentsGetList({
            tenant: tenantId,
            technicianId: tech.technicianId,
            startsOnOrAfter: startOfToday.toISOString(),
            pageSize: 1000,
        });

        const {data: appointments} = appointmentsResponse as PaginatedResponse_Of_Jpm_V2_AppointmentResponse;

        // Process available time slots for this technician
        shifts.forEach((shift) => {
            const shiftStart = new Date(shift.start);
            const shiftEnd = new Date(shift.end);
            let currentTime = new Date(shiftStart);

            while (currentTime < shiftEnd) {
                const nextTime = new Date(currentTime);
                nextTime.setMinutes(currentTime.getMinutes() + 30);

                // Check if the current time block is available
                const isAvailable = !appointments.some((appointment: Jpm_V2_AppointmentResponse) => {
                    const appointmentStart = new Date(appointment.start);
                    const appointmentEnd = new Date(appointment.end);
                    return currentTime >= appointmentStart && currentTime < appointmentEnd;
                });

                // Add time slot if available and meets the criteria
                const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
                if (isAvailable && currentTime > oneHourFromNow) {
                    // Get the date part in UTC
                    const zeroHourDate = new Date(currentTime);
                    // Convert to CT
                    const dateStr = zeroHourDate.toLocaleDateString('en-US', { timeZone: 'America/Chicago' });
                    
                    // Find or create the date entry
                    let dateEntry = availableTimeSlots.find(slot => slot.date === dateStr);
                    if (!dateEntry) {
                        dateEntry = { date: dateStr, timeSlots: [] };
                        availableTimeSlots.push(dateEntry);
                    }

                    // Find or create the time slot entry
                    let timeSlotEntry = dateEntry.timeSlots.find(slot => slot.time === currentTime.toISOString());
                    if (!timeSlotEntry) {
                        timeSlotEntry = { time: currentTime.toISOString(), technicians: [] };
                        dateEntry.timeSlots.push(timeSlotEntry);
                    }

                    // Add the technician to the time slot
                    timeSlotEntry.technicians.push({
                        id: tech.technicianId.toString(),
                        name: tech.technicianName
                    });
                }

                currentTime = nextTime;
            }
        });
    }

    // Sort time slots within each date
    availableTimeSlots.forEach(dateEntry => {
        dateEntry.timeSlots.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    });

    logger.info({ availableTimeSlots }, 'Completed getAvailableTimeSlots');

    return availableTimeSlots;
}