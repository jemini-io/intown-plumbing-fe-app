import { config } from '../config'
import { podiumClient } from './client'
import { PodiumContact, PodiumContactCreatedResponse, PodiumContactRequest } from './types'
import { logger } from './logger'

export interface CreateContactData {
  phoneNumber: string
  name: string
  email?: string
}

export interface UpdateContactData {
  phoneNumber: string
  name?: string
  email?: string
  attributes?: Record<string, unknown>
}

/**
 * Create or update a contact in Podium
 * If the contact already exists, it will be updated
 */
export async function createOrUpdateContact(data: CreateContactData): Promise<PodiumContact> {
  const contactData: PodiumContactRequest = {
    locations: [config.podium.locationId],
    name: data.name,
    phoneNumber: data.phoneNumber,
  }

  logger.info({
    message: 'creating or updating contact',
    contactData: contactData,
  })

  // check if contact already exists
  try {
    const existingContact = await podiumClient.get<PodiumContact>(`/contacts/${data.phoneNumber}`)
    if (existingContact.data) {
      logger.info({
        message: 'podium contact already exists',
        contactName: existingContact.data.name,
      })
      return existingContact.data
    }
  } catch (error) {
    logger.error({
      message: 'error checking if contact exists will attempt to create',
      err: error,
    })
  }

  try {
    // Try to create the contact first
    const response = await podiumClient.post<PodiumContactCreatedResponse>('/contacts', contactData)
    logger.info({
      message: 'created contact',
      contactId: response.data.identifier,
    })
  } catch (error) {
    logger.error({
      message: 'error creating contact',
      err: error,
    })
  }
  const response = await podiumClient.get<PodiumContact>(`/contacts/${data.phoneNumber}`)
  logger.info({
    message: 'fetched contact',
    contactName: response.data.name,
  })
  return response.data
}
