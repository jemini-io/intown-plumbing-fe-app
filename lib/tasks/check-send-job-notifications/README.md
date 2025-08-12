# check-send-job-notifications

This task checks for jobs that require notifications to be sent (e.g., reminders, updates) and triggers the appropriate notification service.

## Key Files

- `index.ts`: Main entry point. Runs the notification check and send logic.
- `job-queries.ts`: Helpers for querying jobs needing notifications.
- `notification-service.ts`: Handles sending notifications.
- `config.ts`: Task configuration.
- `logger.ts`: Logging utility.
- `types.ts`: Type definitions.

## Usage

```sh
# In Dev
npm run job-notifications

# As a Task
npx tsx lib/tasks/check-send-job-notifications/index.ts
```

---
Keep this directory focused on job notification logic only.
