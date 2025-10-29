import { ServiceTitanClient } from '@/lib/servicetitan';
import { env } from "@/lib/config/env";
import { Jpm_V2_AppointmentResponse } from '@/lib/servicetitan/generated/jpm';
// import { QuoteSkill, TechnicianToSkillsMapping } from '@/lib/config/types';
import { TechnicianToSkills } from '@/lib/types/technicianToSkills';
import { Skill } from '@/lib/types/skill';
// import { getTechnicianToSkills } from '@/lib/appSettings/getConfig';
import { getAllTechnicians } from '@/app/dashboard/technicians/actions';

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
    skill?: Skill;
    // skill?: string;
}

/**
 * Need to get all technicians in the "Virtual Service" business unit
 * Accepts job details: skills and serviceTitanId
 */
export async function getAvailableTimeSlots(jobType: JobType): Promise<DateEntry[]> {
    const prompt= 'getAvailableTimeSlots function says:';
    logger.info({ jobType }, `${prompt} Starting with parameters:`);

    // ************************************************ 
    // Log the skill parameter to check if it is arriving with the associated technicians:
    logger.info(`${prompt} The selected skill has ${jobType.skill?.technicians?.length} technicians.`);
    // if so, there is no need for filtering the technicians as done below to get the available time slots.
    // it will be as simple as iterating over jobType.skill.technicians to get the tech IDs to filter shifts and appointments.
    // ************************************************

    const serviceTitanClient = new ServiceTitanClient();
    const now = new Date();

    // ST API does not return the skills for technicians.
    // const getTechsList = await client.settings.TechniciansService.techniciansGetList({
    //     tenant: tenantId,
    //     pageSize: 1000,
    // });
    // const allTechs = getTechsList.data || getTechsList;
    // const techsSkillsList: TechnicianToSkills[]  = await getTechnicianToSkills();
    logger.info(`${prompt} Invoking getAllTechnicians function...`);
    const techsSkillsList: TechnicianToSkills[]  = await getAllTechnicians();
    logger.info(`${prompt} Fetched ${techsSkillsList.length} technicians from getAllTechnicians function.`);


    // Filter to only enabled technicians
    logger.info(`${prompt} Filtering just ENABLED technicians...`);
    const enabledTechsSkillsList = techsSkillsList.filter(tech => tech.enabled === true);
    if (enabledTechsSkillsList.length === 0) {
      logger.warn(`${prompt} No ENABLED technicians available`);
      return [];
    }
    logger.info(`${prompt} Found ${enabledTechsSkillsList.length} ENABLED technicians (${enabledTechsSkillsList.map(tech => tech.technicianName).join(', ')})`);

    // Get ST Job Type
    logger.info(`${prompt} Hitting ServiceTitan API for jobType with serviceTitanId: ${jobType.serviceTitanId}`);
    const jobTypeResponse = await serviceTitanClient.jpm.JobTypesService.jobTypesGet({
        tenant: tenantId,
        id: jobType.serviceTitanId
    });
    const jobTypeSkills = jobTypeResponse.skills;
    logger.info(`${prompt} ServiceTitan returned: Job Type with serviceTitanId ${jobType.serviceTitanId} has skills: ${jobTypeSkills.join(', ')}`);

    // Filter techs for matching skills
    const selectedSkill = jobType.skill;
    logger.info({ selectedSkill }, `${prompt} Filtering technicians for matching the selected skill:`);
    let filteredTechs: TechnicianToSkills[] = enabledTechsSkillsList;
    if (selectedSkill) {
        // If a specific skill is provided, filter for that skill
        filteredTechs = enabledTechsSkillsList.filter((tech) => tech.skills.find(skill => skill.id === selectedSkill?.id));
        // filteredTechs = selectedSkill?.technicians?.filter(tech => tech.enabled) || [];
        logger.info(`Found ${filteredTechs.length} technicians for job type ${jobType.serviceTitanId} with skill ${selectedSkill?.id}(${selectedSkill?.name}): ${filteredTechs.map((tech) => tech.technicianName).join(', ')}`);
    } else {
        // Otherwise, filter by jobTypeSkills as before
        filteredTechs = enabledTechsSkillsList.filter((tech) => {
            return tech.skills.some((skill) => jobTypeSkills.includes(skill.name));
        });
        logger.info(`Found ${filteredTechs.length} technicians for job type ${jobType.serviceTitanId} with skills ${jobTypeResponse.skills.join(', ')}: ${filteredTechs.map((tech) => tech.technicianName).join(', ')}`);
    }

    // For each technician, fetch shifts and appointments, then aggregate
    const availableTimeSlots: DateEntry[] = [];

    for (const tech of filteredTechs) {
        // on call shifts are long, need to look for startsOnOrAfter two weeks ago
        const twoWeeksAgo = new Date(now);
        twoWeeksAgo.setDate(now.getDate() - 14);
        // Fetch shifts for this technician
        const twoWeeksFromNow = new Date(now);
        twoWeeksFromNow.setDate(now.getDate() + 14);

        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);

        const shiftsResponse = await serviceTitanClient.dispatch.TechnicianShiftsService.technicianShiftsGetList({
            tenant: tenantId,
            technicianId: tech.technicianId,
            startsOnOrAfter: twoWeeksAgo.toISOString(),
            endsOnOrBefore: twoWeeksFromNow.toISOString()
        });
        const shifts = shiftsResponse.data;
        logger.info(`Found ${shifts.length} shifts for technician ${tech.technicianName}`);

        // Fetch appointments for this technician
        const appointmentsQuery = {
            tenant: tenantId,
            technicianId: tech.technicianId,
            startsOnOrAfter: startOfToday.toISOString(),
            pageSize: 1000,
        }
        const appointmentsResponse = await serviceTitanClient.jpm.AppointmentsService.appointmentsGetList(appointmentsQuery);
        const appointments = appointmentsResponse.data;
        // logger.info(`Found ${appointments.length} appointments for technician ${tech.technicianName}`);

        // Filter out cancelled appointments by checking the associated job status
        const activeAppointments: Jpm_V2_AppointmentResponse[] = [];

        let cancelledCount = 0;

        for (const appointment of appointments) {
            if (appointment.status?.toLowerCase() === "canceled") {
                cancelledCount += 1;
            } else {
                activeAppointments.push(appointment);
            }
        }

        logger.info(`Technician ${tech.technicianName} has ${appointments.length} total appointments, ${activeAppointments.length} active, and ${cancelledCount} cancelled.`);

        // Process available time slots for this technician
        shifts.forEach((shift) => {
            const shiftStart = new Date(shift.start);
            const shiftEnd = new Date(shift.end);
            let currentTime = new Date(shiftStart);

            while (currentTime < shiftEnd) {
                const nextTime = new Date(currentTime);
                nextTime.setMinutes(currentTime.getMinutes() + 30);

                // Check if the current time block is available
                const isAvailable = !activeAppointments.some((appointment: Jpm_V2_AppointmentResponse) => {
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

    logger.info({ availableTimeSlotsLength: availableTimeSlots.length }, 'Completed getAvailableTimeSlots');

    return availableTimeSlots;
}