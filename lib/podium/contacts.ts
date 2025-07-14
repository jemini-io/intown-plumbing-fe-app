import { PODIUM_LOCATION_ID } from '../utils/constants'
import { podiumClient } from './client'
import { PodiumContact, PodiumContactCreatedResponse, PodiumContactRequest } from './types'

export interface CreateContactData {
  phoneNumber: string
  name: string
  email?: string
}

export interface UpdateContactData {
  phoneNumber: string
  name?: string
  email?: string
  attributes?: Record<string, any>
}

/**
 * Create or update a contact in Podium
 * If the contact already exists, it will be updated
 */
export async function createOrUpdateContact(data: CreateContactData): Promise<PodiumContact> {
  const contactData: PodiumContactRequest = {
    locations: [PODIUM_LOCATION_ID],
    name: data.name,
    phoneNumber: data.phoneNumber,
  }

  // check if contact already exists
  const existingContact = await podiumClient.get<PodiumContact>(`/contacts/${data.phoneNumber}`)
  if (existingContact.data) {
    console.log('podium contact already exists', existingContact.data.name)
    return existingContact.data
  }

  try {
    // Try to create the contact first
    const response = await podiumClient.post<PodiumContactCreatedResponse>('/contacts', contactData)
    console.log('created contact', response.data.identifier)
  } catch (error) {
    console.log('error creating contact', error)
  }
  const response = await podiumClient.get<PodiumContact>(`/contacts/${data.phoneNumber}`)
  console.log('fetched contact', response.data.name)
  return response.data
}
