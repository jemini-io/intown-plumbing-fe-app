import { ServiceTitanClient } from '../../servicetitan/client'
import { NOTIFICATION_CONFIG } from './config'
import { logger } from './logger'
import { Booking, TimeWindow, BookingQueryFilters } from './types'

// Initialize ServiceTitan client
const serviceTitanClient = new ServiceTitanClient({
  authToken: '', // Will be set by auth flow
  appKey: NOTIFICATION_CONFIG.ST_CLIENT_ID!,
  tenantId: process.env.ST_TENANT_ID || '0'
})

/**
 * Calculate time window for booking queries (±5 minutes from now)
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
 * Query bookings within the specified time window
 */
export async function queryBookingsInTimeWindow(timeWindow: TimeWindow): Promise<Booking[]> {
  try {
    logger.info('Querying bookings in time window', {
      start: timeWindow.start.toISOString(),
      end: timeWindow.end.toISOString(),
      bookingType: NOTIFICATION_CONFIG.BOOKING_TYPE
    })

    // Get bookings from ServiceTitan
    const response = await serviceTitanClient.crm.BookingsService.bookingsGetList({
      tenant: parseInt(process.env.ST_TENANT_ID || '0'),
      page: 1,
      pageSize: 100, // Adjust based on expected volume
      includeTotal: true,
      createdOnOrAfter: timeWindow.start.toISOString(),
      createdBefore: timeWindow.end.toISOString()
    })

    if (!response.data || !Array.isArray(response.data)) {
      logger.warn('No bookings found or invalid response format')
      return []
    }

    // Filter by booking type and enrich with customer data
    const enrichedBookings = await Promise.all(
      response.data
        .filter(booking => booking.externalId === NOTIFICATION_CONFIG.BOOKING_TYPE)
        .map(async (booking) => {
          try {
            // Get customer details for this booking
            const customer = await getCustomerForBooking(booking.id)
            
            // Get notes for this booking
            const notes = await getBookingNotes(booking.id)
            
            return {
              id: booking.id,
              startTime: booking.start,
              endTime: booking.start, // ServiceTitan doesn't provide end time in booking response
              bookingType: booking.externalId,
              status: booking.status,
              customer,
              notes
            } as Booking
          } catch (error) {
            logger.error('Failed to enrich booking data', error, { bookingId: booking.id })
            return null
          }
        })
    )

    const validBookings = enrichedBookings.filter(booking => booking !== null) as Booking[]
    
    logger.info('Found bookings for notification processing', {
      total: response.data.length,
      filtered: validBookings.length,
      bookingType: NOTIFICATION_CONFIG.BOOKING_TYPE
    })

    return validBookings

  } catch (error) {
    logger.error('Failed to query bookings', error)
    throw error
  }
}

/**
 * Get customer details for a booking
 */
async function getCustomerForBooking(bookingId: number) {
  try {
    // Get booking contacts
    const contactsResponse = await serviceTitanClient.crm.BookingsService.bookingsGetContactList({
      id: bookingId,
      tenant: parseInt(process.env.ST_TENANT_ID || '0'),
      page: 1,
      pageSize: 10
    })

    if (!contactsResponse.data || contactsResponse.data.length === 0) {
      throw new Error('No contacts found for booking')
    }

    // Get the primary contact (first one)
    const contact = contactsResponse.data[0]
    
    // Note: The booking contact response doesn't include customerId directly
    // We need to get the customer ID from the booking itself or use a different approach
    // For now, we'll need to implement this differently based on the actual ServiceTitan API structure
    
    logger.warn('Customer ID retrieval from booking contact not yet implemented', { 
      bookingId, 
      contactId: contact.id 
    })
    
    // TODO: Implement proper customer ID retrieval
    // This might require using the booking's customer relationship or a different API endpoint
    throw new Error('Customer ID retrieval not implemented')
    
    // TODO: Implement proper customer data retrieval
    // For now, return placeholder data
    return {
      id: 0,
      firstName: 'Unknown',
      lastName: 'Customer',
      phone: contact.value,
      email: undefined
    }

  } catch (error) {
    logger.error('Failed to get customer for booking', error, { bookingId })
    throw error
  }
}

/**
 * Get customer's phone number
 */
async function getCustomerPhoneNumber(customerId: number): Promise<string> {
  try {
    const contactsResponse = await serviceTitanClient.crm.CustomersService.customersGetContactList({
      id: customerId,
      tenant: parseInt(process.env.ST_TENANT_ID || '0'),
      page: 1,
      pageSize: 10
    })

    if (!contactsResponse.data || contactsResponse.data.length === 0) {
      throw new Error('No contacts found for customer')
    }

    // Find the primary phone contact
    const phoneContact = contactsResponse.data.find(contact => 
      contact.type === 'Phone' || contact.type === 'MobilePhone'
    )

    if (!phoneContact) {
      throw new Error('No phone number found for customer')
    }

    return phoneContact.value

  } catch (error) {
    logger.error('Failed to get customer phone number', error, { customerId })
    throw error
  }
}

/**
 * Get notes for a booking
 */
async function getBookingNotes(bookingId: number) {
  try {
    // Note: ServiceTitan CRM API doesn't seem to have a direct endpoint for booking notes
    // We might need to use a different approach or check if notes are available through a different endpoint
    // For now, return empty array - this will need to be implemented based on actual ServiceTitan API structure
    
    logger.warn('Booking notes retrieval not yet implemented', { bookingId })
    return []

  } catch (error) {
    logger.error('Failed to get booking notes', error, { bookingId })
    return []
  }
}

/**
 * Add a note to a booking
 */
export async function addBookingNote(bookingId: number, noteText: string) {
  try {
    // Note: This will need to be implemented based on actual ServiceTitan API structure
    // For now, log the action
    logger.info('Would add booking note', {
      bookingId,
      noteText,
      dryRun: NOTIFICATION_CONFIG.DRY_RUN
    })

    if (NOTIFICATION_CONFIG.DRY_RUN) {
      return { success: true, dryRun: true }
    }

    // TODO: Implement actual note creation
    // This might require using a different ServiceTitan API endpoint
    // or a different approach to adding notes to bookings

    return { success: true }

  } catch (error) {
    logger.error('Failed to add booking note', error, { bookingId, noteText })
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
} 