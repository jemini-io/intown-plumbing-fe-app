import { AuthService, TechnicianService, AppointmentService } from '../services/services';
import { env } from "@/lib/config/env";
import { toZonedTime, format } from 'date-fns-tz';
import { Appointment } from '../servicetitan-api/types';
import { ServiceTitanQueryResponse } from '../servicetitan-api/types';
import { TECHNICIAN_TO_SKILLS_MAPPING } from '@/lib/utils/constants';
import { JobTypesService } from '../servicetitan-api/job-planning-management/job-types';

const { servicetitan: { clientId, clientSecret, appKey, tenantId }, environment } = env;

interface Technician {
    id: string;
    name: string;
}

interface TimeSlot {
    time: string;
    technicians: Technician[];
}

interface DateEntry {
    date: string;
    timeSlots: TimeSlot[];
}

// Convert shift and appointment times to CT
const convertToCT = (dateString: string) => {
    const date = new Date(dateString);
    const timeZone = 'America/Chicago';
    return toZonedTime(date, timeZone);
};

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
    const jobTypeService = new JobTypesService();

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Get auth token
    const authToken = await authService.getAuthToken(clientId, clientSecret);

    // Fetch all technicians
    const allTechsResponse = await technicianService.getAllTechnicians(authToken, appKey, tenantId);
    const allTechs = allTechsResponse.data || allTechsResponse; // adjust if API returns .data

    // Fetch job type
    const jobTypeResponse = await jobTypeService.getJobType(authToken, appKey, tenantId, jobType.serviceTitanId);

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
        const shiftsResponse = await technicianService.getTechShifts(authToken, appKey, tenantId, tech.id, todayStr);
        const shifts = shiftsResponse.data;

        // Filter shifts for the next 2 weeks, including today
        const twoWeeksFromNow = new Date(today);
        twoWeeksFromNow.setDate(today.getDate() + 14);
        const filteredShifts = shifts.filter((shift: any) => {
            const shiftDate = new Date(shift.start);
            return shiftDate.toISOString().split('T')[0] >= todayStr && shiftDate <= twoWeeksFromNow;
        });

        // Fetch appointments for this technician
        const appointmentsResponse = await appointmentService.getAppointments(authToken, appKey, tenantId, todayStr, tech.id);
        const {data: appointments} = appointmentsResponse as ServiceTitanQueryResponse<Appointment>;

        // Process available time slots for this technician
        filteredShifts.forEach((shift: any) => {
            const shiftDate = new Date(shift.start).toISOString().split('T')[0];
            const shiftStart = convertToCT(shift.start);
            const shiftEnd = convertToCT(shift.end);
            let currentTime = new Date(shiftStart);

            while (currentTime < shiftEnd) {
                const currentTimeStr = format(currentTime, 'HH:mm', { timeZone: 'America/Chicago' });
                const nextTime = new Date(currentTime);
                nextTime.setMinutes(currentTime.getMinutes() + 30);

                // Check if the current time block is available
                const isAvailable = !appointments.some((appointment) => {
                    const appointmentStart = convertToCT(appointment.start);
                    const appointmentEnd = convertToCT(appointment.end);
                    return currentTime >= appointmentStart && currentTime < appointmentEnd;
                });

                // Add time slot if available and meets the criteria
                const oneHourFromNow = new Date(today.getTime() + 60 * 60 * 1000);
                if (isAvailable && (shiftDate !== todayStr || currentTime > oneHourFromNow)) {
                    // Find or create the date entry
                    let dateEntry = availableTimeSlots.find(slot => slot.date === shiftDate);
                    if (!dateEntry) {
                        dateEntry = { date: shiftDate, timeSlots: [] };
                        availableTimeSlots.push(dateEntry);
                    }

                    // Find or create the time slot entry
                    let timeSlotEntry = dateEntry.timeSlots.find(slot => slot.time === currentTimeStr);
                    if (!timeSlotEntry) {
                        timeSlotEntry = { time: currentTimeStr, technicians: [] };
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
        dateEntry.timeSlots.sort((a, b) => a.time.localeCompare(b.time));
    });

    return availableTimeSlots;
}