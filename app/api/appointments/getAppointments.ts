import { AuthService, TechnicianService, AppointmentService } from '../services/services';
import { ServiceTitanClient } from '@/lib/servicetitan';
import { env } from "@/lib/config/env";
import { Jpm_V2_AppointmentResponse, PaginatedResponse_Of_Jpm_V2_AppointmentResponse } from '@/lib/servicetitan/generated/jpm';
import { TECHNICIAN_TO_SKILLS_MAPPING } from '@/lib/utils/constants';

const { servicetitan: { clientId, clientSecret, appKey, tenantId }, environment } = env;

interface Technician {
    id: string;
    name: string;
}

interface TimeSlot {
    time: string; // UTC ISO String
    technicians: Technician[];
}

export interface DateEntry {
    date: string; // CT Date String like "6/17/2025"
    timeSlots: TimeSlot[];
}

export interface JobType {
    serviceTitanId: number;
}

/**
 * Need to get all technicians in the "Virtual Service" business unit
 * Accepts job details: skills and serviceTitanId
 */
export async function getAvailableTimeSlots(jobType: JobType): Promise<DateEntry[]> {
    const authService = new AuthService(environment);
    const technicianService = new TechnicianService(environment);
    const appointmentService = new AppointmentService(environment);
    
    const client = new ServiceTitanClient({
        authToken: await authService.getAuthToken(clientId, clientSecret),
        appKey,
        tenantId
    });

    const now = new Date();

    const authToken = await authService.getAuthToken(clientId, clientSecret);

    const allTechsResponse = await technicianService.getAllTechnicians(authToken, appKey, tenantId);
    const allTechs = allTechsResponse.data || allTechsResponse; // adjust if API returns .data

    const jobTypeResponse = await client.jpm.JobTypesService.jobTypesGet({
        tenant: parseInt(tenantId),
        id: jobType.serviceTitanId
    });

    // filter techs for matching skills
    const filteredTechs = allTechs.filter((tech: any) => {
        const skills = TECHNICIAN_TO_SKILLS_MAPPING.find((mapping) => mapping.technicianId === tech.id)?.skills;
        return skills?.some((skill) => jobTypeResponse.skills.includes(skill));
    });

    console.log(`Found ${filteredTechs.length} technicians for job type ${jobType.serviceTitanId} with skills ${jobTypeResponse.skills.join(', ')}: ${filteredTechs.map((tech: any) => tech.name).join(', ')}`);
    // log first tech
    console.log(filteredTechs[0].name);

    // For each technician, fetch shifts and appointments, then aggregate
    const availableTimeSlots: DateEntry[] = [];

    for (const tech of filteredTechs) {
        // Fetch shifts for this technician
        const twoWeeksFromNow = new Date(now);
        twoWeeksFromNow.setDate(now.getDate() + 14);

        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);
        const shiftsResponse = await client.dispatch.TechnicianShiftsService.technicianShiftsGetList({
            tenant: parseInt(tenantId),
            technicianId: tech.id,
            startsOnOrAfter: startOfToday.toISOString(),
            endsOnOrBefore: twoWeeksFromNow.toISOString()
        });
        const shifts = shiftsResponse.data;

        // Fetch appointments for this technician
        const appointmentsResponse = await appointmentService.getAppointments(authToken, appKey, tenantId, now.toISOString(), tech.id);
        const {data: appointments} = appointmentsResponse as PaginatedResponse_Of_Jpm_V2_AppointmentResponse;

        // Process available time slots for this technician
        shifts.forEach((shift: any) => {
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
                        id: tech.id,
                        name: tech.name
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

    return availableTimeSlots;
}