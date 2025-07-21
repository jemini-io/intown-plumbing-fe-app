import { config } from '../config'
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

  console.log('creating or updating contact', contactData)

  // check if contact already exists
  try {
    const existingContact = await podiumClient.get<PodiumContact>(`/contacts/${data.phoneNumber}`)
    if (existingContact.data) {
      console.log('podium contact already exists', existingContact.data.name)
      return existingContact.data
    }
  } catch (error) {
    console.log('error checking if contact exists will attempt to create', error)
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
