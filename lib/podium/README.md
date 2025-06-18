# Podium Integration

This module provides integration with Podium's API for sending text notifications to customers.

## Setup

1. **Environment Variables**: Add the following to your `.env.local`:
   ```
   PODIUM_CLIENT_ID=your_podium_client_id
   PODIUM_CLIENT_SECRET=your_podium_client_secret
   ```

2. **Podium App Configuration**: 
   - Create a Podium app in the Podium Developer Portal
   - Configure OAuth2 with Client Credentials flow
   - Set the required scopes: `read_contacts write_contacts write_messages`

## Usage

### Basic Message Sending

```typescript
import { sendTextMessage } from '@/lib/podium'

// Send a simple text message
await sendTextMessage(
  '+1234567890',
  'Your appointment has been confirmed!',
  'John Doe'
)
```

### Appointment Notifications

```typescript
import { 
  sendAppointmentConfirmation,
  sendAppointmentReminder,
  sendJobCompletionNotification 
} from '@/lib/podium'

// Send appointment confirmation
await sendAppointmentConfirmation(
  '+1234567890',
  'Monday, January 15, 2024 at 2:00 PM EST',
  'plumbing repair',
  'John Doe'
)

// Send appointment reminder
await sendAppointmentReminder(
  '+1234567890',
  'Monday, January 15, 2024 at 2:00 PM EST',
  'plumbing repair',
  'John Doe'
)

// Send job completion notification
await sendJobCompletionNotification(
  '+1234567890',
  'plumbing repair',
  'John Doe'
)
```

### Contact Management

```typescript
import { 
  createOrUpdateContact,
  getContact,
  updateContact 
} from '@/lib/podium'

// Create or update a contact
const contact = await createOrUpdateContact({
  phoneNumber: '+1234567890',
  name: 'John Doe',
  email: 'john@example.com'
})

// Get contact information
const contact = await getContact('+1234567890')

// Update contact
await updateContact('+1234567890', {
  name: 'John Smith',
  email: 'johnsmith@example.com'
})
```

## Integration with Job Creation

The Podium integration is automatically used in the `createJobAction` to send appointment confirmation messages when a job is created.

## Error Handling

All Podium API calls include comprehensive error handling:
- Authentication errors are automatically retried
- API errors include detailed error messages
- Notification failures don't prevent job creation

## Available Functions

### Messages
- `sendPodiumMessage()` - Send a message to a contact by ID
- `sendTextMessage()` - Send a message by phone number (creates contact if needed)
- `sendAppointmentConfirmation()` - Send appointment confirmation
- `sendAppointmentReminder()` - Send appointment reminder
- `sendJobCompletionNotification()` - Send job completion notification

### Contacts
- `createOrUpdateContact()` - Create or update a contact
- `updateContact()` - Update an existing contact
- `getContact()` - Get contact by phone number
- `listContacts()` - List all contacts with pagination

### Authentication
- `podiumAuth` - Singleton auth instance with automatic token management
- `podiumClient` - HTTP client with built-in authentication

## Testing

The auth module includes utility methods for testing:
- `podiumAuth.isTokenValid()` - Check if current token is valid
- `podiumAuth.clearToken()` - Clear cached token (useful for testing) 