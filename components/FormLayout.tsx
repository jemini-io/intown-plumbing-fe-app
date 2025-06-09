'use client';

import Image from 'next/image';

interface FormLayoutProps {
  children: React.ReactNode;
  subtitle: string;
}

export default function FormLayout({ children, subtitle }: FormLayoutProps) {
  return (
    <main className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        <div>
          <div className="flex justify-center mb-8">
            <Image
              src="/intown-logo-2023.svg"
              alt="InTown Plumbing Logo"
              width={120}
              height={80}
              className="h-auto"
              priority
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Schedule a Virtual Consultation
          </h2>
        </div>
        {children}
      </div>
    </main>
  );
} 