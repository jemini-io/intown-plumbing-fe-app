import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Intown Plumbing Virtual Consultation',
  description: 'Please fill out the form below to schedule a virtual consultation with an InTown Technician at the next available time.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
} 