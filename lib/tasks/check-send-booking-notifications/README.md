# Booking Notification Task

Automatically sends consultation reminders to customers based on booking timing and notification status.

## Overview

This task runs as a cron job and:
- Queries for bookings with a specific type within ±5 minutes of current time
- Checks if a reminder has already been sent (via booking notes)
- Sends SMS reminders to eligible customers
- Updates booking notes to prevent duplicate notifications

## Files

- `index.ts` - Main task orchestrator
- `config.ts` - Configuration management and environment validation
- `types.ts` - TypeScript type definitions
- `logger.ts` - Structured logging utility
- `booking-queries.ts` - ServiceTitan API integration for booking queries
- `notification-service.ts` - Podium SMS integration
- `test-cli.sh` - CLI interface for testing and running the task

## Setup

### Environment Variables

Required environment variables:

```bash
# Core settings
BOOKING_TYPE=video-consultation
DRY_RUN=false

# ServiceTitan
ST_TENANT_ID=your_tenant_id
ST_CLIENT_ID=your_client_id
ST_CLIENT_SECRET=your_client_secret

# Podium
PODIUM_API_KEY=your_api_key
PODIUM_LOCATION_ID=your_location_id

# Environment
NODE_ENV=production
```

### ServiceTitan Integration

The task uses the ServiceTitan CRM API to:
- Query bookings within time windows
- Get customer contact information
- Add notification notes to bookings

**Note**: Some ServiceTitan API integrations are currently placeholders and need to be completed based on your specific ServiceTitan setup.

### Podium Integration

The task uses the Podium API to send SMS messages to customers.

## Usage

### CLI Interface (Recommended)

Use the CLI script for easy testing and running:

```bash
# Show help
./lib/tasks/check-send-booking-notifications/test-cli.sh --help

# Check environment variables
./lib/tasks/check-send-booking-notifications/test-cli.sh --check-env

# Run quick test
./lib/tasks/check-send-booking-notifications/test-cli.sh --test

# Run in dry run mode (default)
./lib/tasks/check-send-booking-notifications/test-cli.sh --dry-run

# Run with different booking type
./lib/tasks/check-send-booking-notifications/test-cli.sh --booking-type consultation

# Run in production mode (with confirmation prompt)
./lib/tasks/check-send-booking-notifications/test-cli.sh --production

# Run with verbose output
./lib/tasks/check-send-booking-notifications/test-cli.sh --verbose
```

### Direct TypeScript Usage

Run the task directly with TypeScript:

```bash
# Using tsx (recommended)
npx tsx lib/tasks/check-send-booking-notifications/index.ts

# Or compile and run
npx tsc lib/tasks/check-send-booking-notifications/index.ts
node lib/tasks/check-send-booking-notifications/index.js
```

### Programmatic Usage

```typescript
import { checkAndSendBookingNotifications } from './lib/tasks/check-send-booking-notifications'

const metrics = await checkAndSendBookingNotifications()
console.log('Task completed:', metrics)
```

## Render Cron Setup

Set up a cron job on Render to run every 2 minutes:

```bash
# Cron schedule: every 2 minutes
*/2 * * * * cd /opt/render/project/src && node lib/tasks/check-send-booking-notifications/index.js
```

## Monitoring

The task provides structured logging with metrics:

```json
{
  "timestamp": "2024-01-01T12:00:00.000Z",
  "level": "info",
  "message": "Task completed",
  "totalBookings": 5,
  "eligibleBookings": 2,
  "notificationsSent": 2,
  "errors": 0,
  "dryRun": false,
  "duration": 1500
}
```

## TODOs

- [ ] Complete ServiceTitan customer data retrieval
- [ ] Implement booking notes API integration
- [ ] Add ServiceTitan authentication flow
- [ ] Add retry logic for failed SMS sends
- [ ] Implement health checks
- [ ] Add comprehensive error recovery

## Troubleshooting

### Common Issues

1. **Missing environment variables**: Check that all required env vars are set
   ```bash
   ./lib/tasks/check-send-booking-notifications/test-cli.sh --check-env
   ```

2. **ServiceTitan authentication**: Verify API credentials and tenant ID
3. **Podium API errors**: Check API key and location ID
4. **No bookings found**: Verify booking type and time window settings
5. **CLI script permissions**: Make sure the script is executable
   ```bash
   chmod +x lib/tasks/check-send-booking-notifications/test-cli.sh
   ```

### Logs

All operations are logged with structured JSON. Check logs for:
- Configuration validation errors
- API request/response details
- SMS sending results
- Error details with context 