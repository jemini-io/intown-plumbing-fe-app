import { getPodiumLocationId } from "@/app/actions/getConfig"
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
  const podiumLocationId = await getPodiumLocationId();
  const contactData: PodiumContactRequest = {
    locations: [podiumLocationId],
    name: data.name,
    phoneNumber: data.phoneNumber,
  }

  logger.info({
    contactData: contactData,
  }, 'creating or updating contact')

  // check if contact already exists
  try {
    const existingContact = await podiumClient.get<PodiumContact>(`/contacts/${data.phoneNumber}`)
    if (existingContact.data) {
      logger.info({
        contactName: existingContact.data.name,
      }, 'podium contact already exists')
      return existingContact.data
    }
  } catch (error) {
    logger.error({
      err: error,
    }, 'error checking if contact exists will attempt to create')
  }

  try {
    // Try to create the contact first
    const response = await podiumClient.post<PodiumContactCreatedResponse>('/contacts', contactData)
    logger.info({
      contactId: response.data.identifier,
    }, 'created contact')
  } catch (error) {
    logger.error({
      err: error,
    }, 'error creating contact')
  }
  const response = await podiumClient.get<PodiumContact>(`/contacts/${data.phoneNumber}`)
  logger.info({
    contactName: response.data.name,
  }, 'fetched contact')
  return response.data
}
