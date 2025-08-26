import './globals.css';
import type { Metadata } from 'next';
import { env } from '@/lib/config/env';
import { PostHogProvider } from '@/components/PostHogProvider';
import Providers from "@/components/SessionProviderWrapper";

export const metadata: Metadata = {
  title: 'Intown Plumbing Virtual Consultation',
  description:
    'Please fill out the form below to schedule a virtual consultation with an InTown Technician at the next available time.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isTestEnv = env.nextEnv === 'test';
  return (
    <html lang="en">
      <body>
        <Providers>
          <PostHogProvider>
            {isTestEnv && (
              <div className="w-full fixed top-0 left-0 z-50 bg-red-700 text-white text-center py-4 text-md font-bold shadow-lg">
                TEST ENV | Texting and Video Calling Enabled. Use Personal Phone/Email ONLY
              </div>
            )}
            <div className={isTestEnv ? 'pt-20' : ''}>{children}</div>
          </PostHogProvider>
        </Providers>
      </body>
    </html>
  );
}