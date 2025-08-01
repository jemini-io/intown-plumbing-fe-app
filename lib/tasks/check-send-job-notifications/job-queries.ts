
import { env } from '../../config/env'
import { ServiceTitanClient } from '../../servicetitan/client'
import { NOTIFICATION_CONFIG } from './config'
import { logger } from './logger'
import { TimeWindow, EnrichedJob } from './types'
import { Jpm_V2_JobResponse } from '../../servicetitan/generated/jpm/models/Jpm_V2_JobResponse'

const tenantId = Number(env.servicetitan.tenantId);

/**
 * Calculate time window for job queries (±5 minutes from now)
 */
export function calculateTimeWindow(): TimeWindow {
  const now = new Date()
  const windowMs = NOTIFICATION_CONFIG.TIME_WINDOW_MINUTES * 60 * 1000
  
  return {
    start: new Date(now.getTime() - windowMs),
    end: new Date(now.getTime() + windowMs)
  }
}

/**
 * Query jobs within the specified time window
 */
export async function queryJobsInTimeWindow(timeWindow: TimeWindow): Promise<EnrichedJob[]> {
  try {
    logger.info({
      start: timeWindow.start.toISOString(),
      end: timeWindow.end.toISOString(),
      jobTypeFilter: NOTIFICATION_CONFIG.JOB_TYPE_FILTER
    }, 'Querying jobs in time window')

    const serviceTitanClient = new ServiceTitanClient();

    // Get jobs from ServiceTitan JPM service
    const response = await serviceTitanClient.jpm.JobsService.jobsGetList({
      tenant: tenantId,
      firstAppointmentStartsOnOrAfter: timeWindow.start.toISOString(),
      firstAppointmentStartsBefore: timeWindow.end.toISOString(),
      page: 1,
      pageSize: 100, // Adjust based on expected volume
      includeTotal: true
    })

    if (!response.data || !Array.isArray(response.data)) {
      logger.warn({
        responseDataType: typeof response.data
      }, 'No jobs found or invalid response format')
      return []
    }

    logger.info({
      totalCount: response.data.length
    }, `Found ${response.data.length} jobs in time window`)

    // Filter jobs by appointment time and job type, then enrich with customer and notes
    const enrichedJobs = await Promise.all(
      response.data.map(async (job: Jpm_V2_JobResponse): Promise<EnrichedJob | null> => {
        try {
          // Get appointments for this job
          const appointments = await getJobAppointments(job.id, serviceTitanClient)
          const appointmentInWindow = appointments.find(appointment => {
            const appointmentStart = new Date(appointment.start)
            return appointmentStart >= timeWindow.start && appointmentStart <= timeWindow.end
          })
          if (!appointmentInWindow) return null

          // Get customer details for this job
          const customer = await getCustomerForJob(job.customerId, serviceTitanClient)

          // Get notes for this job
          const notes = await getJobNotes(job.id, serviceTitanClient)

          // Get job type
          const jobType = await getJobType(job.jobTypeId, serviceTitanClient)

          // Return the job object, adding customer, notes, and startTime for downstream use
          return {
            ...job,
            startTime: appointmentInWindow.start,
            endTime: appointmentInWindow.end,
            jobType: jobType?.name || 'Unknown',
            customer,
            notes
          }
        } catch (error) {
          logger.error({
            err: error,
            jobId: job.id
          }, 'Failed to enrich job data')
          return null
        }
      })
    )

    const validJobs: EnrichedJob[] = enrichedJobs.filter((job: EnrichedJob | null): job is EnrichedJob => {
      if (job?.jobType === NOTIFICATION_CONFIG.JOB_TYPE_FILTER) {
        return true
      }
      return false
    })

    logger.info({
      totalCount: response.data.length,
      filteredCount: validJobs.length,
      jobTypeFilter: NOTIFICATION_CONFIG.JOB_TYPE_FILTER
    }, `Found ${validJobs.length} jobs for notification processing`)

    return validJobs

  } catch (error) {
    logger.error({
      err: error,
    }, 'Failed to query jobs')
    throw error
  }
}

/**
 * Get appointments for a job
 */
async function getJobAppointments(jobId: number, serviceTitanClient: ServiceTitanClient) {
  try {
    const response = await serviceTitanClient.jpm.AppointmentsService.appointmentsGetList({
      tenant: tenantId,
      jobId: jobId,
      page: 1,
      pageSize: 10
    })
    
    return response.data || []
  } catch (error) {
    logger.error({
      err: error,
      jobId: jobId
    }, 'Failed to get job appointments')
    return []
  }
}

/**
 * Get job type details
 */
async function getJobType(jobTypeId: number, serviceTitanClient: ServiceTitanClient) {
  try {
    const response = await serviceTitanClient.jpm.JobTypesService.jobTypesGet({
      tenant: tenantId,
      id: jobTypeId
    })
    
    return response
  } catch (error) {
    logger.error({
      err: error,
      jobTypeId: jobTypeId
    }, 'Failed to get job type')
    return null
  }
}

/**
 * Get customer details for a job
 */
async function getCustomerForJob(customerId: number, serviceTitanClient: ServiceTitanClient) {
  try {
    // Get customer details
    const customerResponse = await serviceTitanClient.crm.CustomersService.customersGet({
      id: customerId,
      tenant: tenantId
    })

    // Get customer contacts
    const contactsResponse = await serviceTitanClient.crm.CustomersService.customersGetContactList({
      id: customerId,
      tenant: tenantId,
      page: 1,
      pageSize: 10
    })

    const phoneContact = contactsResponse.data?.find(contact => 
      contact.type === 'Phone' || contact.type === 'MobilePhone'
    )

    return {
      id: customerResponse.id,
      firstName: customerResponse.name,
      lastName: '',
      phone: phoneContact?.value || '',
      email: contactsResponse.data?.find(contact => contact.type === 'Email')?.value
    }

  } catch (error) {
    logger.error({
      err: error,
      customerId: customerId
    }, 'Failed to get customer for job')
    throw error
  }
}

/**
 * Get notes for a job
 */
async function getJobNotes(jobId: number, serviceTitanClient: ServiceTitanClient) {
  try {
    const response = await serviceTitanClient.jpm.JobsService.jobsGetNotes({
      tenant: tenantId,
      id: jobId,
      page: 1,
      pageSize: 50
    })
    
    return response.data?.map((note, index) => ({
      id: index,
      text: note.text,
      timestamp: note.createdOn,
      createdBy: note.createdById ? String(note.createdById) : 'Unknown'
    })) || []
  } catch (error) {
    logger.error({
      err: error,
      jobId: jobId
    }, 'Failed to get job notes')
    return []
  }
}

/**
 * Add a note to a job
 */
export async function addJobNote(jobId: number, noteText: string) {
  try {
    if (NOTIFICATION_CONFIG.DRY_RUN) {
      logger.info({
        jobId: jobId,
        noteText: noteText
      }, 'DRY RUN: Would add job note')
      return { success: true, dryRun: true }
    }

    const serviceTitanClient = new ServiceTitanClient();

    // Add note to job
    await serviceTitanClient.jpm.JobsService.jobsCreateNote({
      id: jobId,
      tenant: tenantId,
      requestBody: {
        text: noteText
      }
    })
    
    logger.info({
      jobId: jobId,
      noteText: noteText
    }, 'Added job note')

    return { success: true }

  } catch (error) {
    logger.error({
      err: error,
      jobId: jobId,
      noteText: noteText
    }, 'Failed to add job note')
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
} 