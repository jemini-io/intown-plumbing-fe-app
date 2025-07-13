import { AuthService } from '../../../app/api/services/services'
import { env } from '../../config/env'
import { ServiceTitanClient } from '../../servicetitan/client'
import { NOTIFICATION_CONFIG } from './config'
import { logger } from './logger'
import { Job, TimeWindow } from './types'

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
export async function queryJobsInTimeWindow(timeWindow: TimeWindow): Promise<Job[]> {
  try {
    logger.info('Querying jobs in time window', {
      start: timeWindow.start.toISOString(),
      end: timeWindow.end.toISOString(),
      jobTypeFilter: NOTIFICATION_CONFIG.JOB_TYPE_FILTER
    })

    // Get auth token
    const authService = new AuthService(env.environment)
    const authToken = await authService.getAuthToken(
      env.servicetitan.clientId,
      env.servicetitan.clientSecret
    )

    // Create authenticated ServiceTitan client
    const serviceTitanClient = new ServiceTitanClient({
      authToken,
      appKey: env.servicetitan.appKey,
      tenantId: env.servicetitan.tenantId
    })

    // Get jobs from ServiceTitan JPM service
    const response = await serviceTitanClient.jpm.JobsService.jobsGetList({
      tenant: parseInt(env.servicetitan.tenantId),
      firstAppointmentStartsOnOrAfter: timeWindow.start.toISOString(),
      firstAppointmentStartsBefore: timeWindow.end.toISOString(),
      page: 1,
      pageSize: 100, // Adjust based on expected volume
      includeTotal: true
    })

    if (!response.data || !Array.isArray(response.data)) {
      logger.warn('No jobs found or invalid response format')
      return []
    }

    // Filter jobs by appointment time and job type, then enrich with customer data
    const enrichedJobs = await Promise.all(
      response.data
        .filter(async (job) => {
          // First check if job has appointments in our time window
          const appointments = await getJobAppointments(job.id, serviceTitanClient)
          const hasAppointmentInWindow = appointments.some(appointment => {
            const appointmentStart = new Date(appointment.start)
            return appointmentStart >= timeWindow.start && appointmentStart <= timeWindow.end
          })
          
          if (!hasAppointmentInWindow) return false
          
          // Then check if job type matches our filter (case-insensitive)
          const jobType = await getJobType(job.jobTypeId, serviceTitanClient)
          return jobType?.name?.toLowerCase().includes(NOTIFICATION_CONFIG.JOB_TYPE_FILTER.toLowerCase())
        })
        .map(async (job) => {
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
            
            return {
              id: job.id,
              startTime: appointmentInWindow.start,
              endTime: appointmentInWindow.end,
              jobType: jobType?.name || 'Unknown',
              status: job.jobStatus,
              customer,
              notes
            } as Job
          } catch (error) {
            logger.error('Failed to enrich job data', error, { jobId: job.id })
            return null
          }
        })
    )

    const validJobs = enrichedJobs.filter(job => job !== null) as Job[]
    
    logger.info('Found jobs for notification processing', {
      total: response.data.length,
      filtered: validJobs.length,
      jobTypeFilter: NOTIFICATION_CONFIG.JOB_TYPE_FILTER
    })

    return validJobs

  } catch (error) {
    logger.error('Failed to query jobs', error)
    throw error
  }
}

/**
 * Get appointments for a job
 */
async function getJobAppointments(jobId: number, serviceTitanClient: ServiceTitanClient) {
  try {
    const response = await serviceTitanClient.jpm.AppointmentsService.appointmentsGetList({
      tenant: parseInt(env.servicetitan.tenantId),
      jobId: jobId,
      page: 1,
      pageSize: 10
    })
    
    return response.data || []
  } catch (error) {
    logger.error('Failed to get job appointments', error, { jobId })
    return []
  }
}

/**
 * Get job type details
 */
async function getJobType(jobTypeId: number, serviceTitanClient: ServiceTitanClient) {
  try {
    const response = await serviceTitanClient.jpm.JobTypesService.jobTypesGet({
      tenant: parseInt(env.servicetitan.tenantId),
      id: jobTypeId
    })
    
    return response
  } catch (error) {
    logger.error('Failed to get job type', error, { jobTypeId })
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
      tenant: parseInt(env.servicetitan.tenantId)
    })

    // Get customer contacts
    const contactsResponse = await serviceTitanClient.crm.CustomersService.customersGetContactList({
      id: customerId,
      tenant: parseInt(env.servicetitan.tenantId),
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
    logger.error('Failed to get customer for job', error, { customerId })
    throw error
  }
}

/**
 * Get notes for a job
 */
async function getJobNotes(jobId: number, serviceTitanClient: ServiceTitanClient) {
  try {
    const response = await serviceTitanClient.jpm.JobsService.jobsGetNotes({
      tenant: parseInt(env.servicetitan.tenantId),
      id: jobId,
      page: 1,
      pageSize: 50
    })
    
    return response.data?.map((note, index) => ({
      id: index,
      text: note.text,
      timestamp: note.createdOn,
      createdBy: note.createdById || 'Unknown'
    })) || []
  } catch (error) {
    logger.error('Failed to get job notes', error, { jobId })
    return []
  }
}

/**
 * Add a note to a job
 */
export async function addJobNote(jobId: number, noteText: string) {
  try {
    if (NOTIFICATION_CONFIG.DRY_RUN) {
      logger.info('DRY RUN: Would add job note', {
        jobId,
        noteText
      })
      return { success: true, dryRun: true }
    }

    // Get auth token
    const authService = new AuthService(env.environment)
    const authToken = await authService.getAuthToken(
      env.servicetitan.clientId,
      env.servicetitan.clientSecret
    )

    // Create authenticated ServiceTitan client
    const serviceTitanClient = new ServiceTitanClient({
      authToken,
      appKey: env.servicetitan.appKey,
      tenantId: env.servicetitan.tenantId
    })

    // Add note to job
    await serviceTitanClient.jpm.JobsService.jobsCreateNote({
      id: jobId,
      tenant: parseInt(env.servicetitan.tenantId),
      requestBody: {
        text: noteText
      }
    })
    
    logger.info('Added job note', {
      jobId,
      noteText
    })

    return { success: true }

  } catch (error) {
    logger.error('Failed to add job note', error, { jobId, noteText })
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
} 