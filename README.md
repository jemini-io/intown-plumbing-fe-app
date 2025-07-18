# Virtual Consultation Service App

> Books virtual consultations for InTown Plumbing. Is iFrame embeddable.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .example.env .env.test.local
   ```

   Edit `.env` with your actual secrets and configuration.

3. Start the development server:

   ```bash
   npm run dev
   ```

   Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

- Set all required environment variables in your `.env.test.local` file (see `.example.env` for reference).

## Build

To create a production build:

```bash
npm run build
```

To start the production server:

```bash
npm start
```

## Deployment

This app is deployed on [Render](https://render.com):

- **Main App:** Deploy the main Next.js app as a web service.
- **Cron Tasks:** Deploy a second service (cron job) to run background tasks (see `lib/tasks/check-send-job-notifications`).  
  Configure the cron job in Render to run the appropriate script/command at your desired schedule.

Set all required environment variables in the Render dashboard for each service.

## Features

- Form with name, phone, and email fields
- Form validation
- Error handling
- Success/error notifications
- Responsive design
- Tailwind CSS styling

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- React Hook Form
