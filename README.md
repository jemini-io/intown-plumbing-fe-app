# Contact Form App

A simple Next.js application with a contact form that submits data to a webhook.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

Before using the form, you need to update the webhook URL in `app/page.tsx`. Replace `'YOUR_WEBHOOK_URL'` with your actual webhook endpoint.

## Features

- Form with name, phone, and email fields
- Form validation
- Error handling
- Success/error notifications
- Responsive design
- Tailwind CSS styling

## Development

The app is built with:
- Next.js 14
- TypeScript
- Tailwind CSS
- React Hook Form 