'use client';

import Image from 'next/image';

interface FormLayoutProps {
  children: React.ReactNode;
}

export default function FormLayout({ children}: FormLayoutProps) {
  return (
    <main className="min-h-screen flex items-center justify-center py-4 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md sm:max-w-lg w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-6 sm:mb-8">
            <Image
              src="/intown-logo-2023.svg"
              alt="InTown Plumbing Logo"
              width={100}
              height={67}
              className="h-auto w-20 sm:w-24 lg:w-30"
              priority
            />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
            Schedule a Virtual Consultation
          </h2>
        </div>
        <div className="bg-white p-4 sm:p-6">
          {children}
        </div>
      </div>
    </main>
  );
} 