'use client';

import Image from 'next/image';

interface FormLayoutProps {
  children: React.ReactNode;
}

export default function FormLayout({ children}: FormLayoutProps) {
  return (
    <main className="min-h-screen flex items-center justify-center py-4 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg md:max-w-3xl sm:max-w-lg w-full">

        {/* Hero-like logo section */}
        <div className="mb-4 sm:mb-8">
          <div className="flex justify-center mb-4 sm:mb-6">
            <a href="https://intownplumbingtx.com/" target="_blank" rel="noopener noreferrer">
              <Image
                src="/intown-logo-2023.svg"
                alt="InTown Plumbing Logo"
                width={200}
                height={134}
                className="h-auto w-64 sm:w-40 lg:w-64"
                priority
              />
            </a>
          </div>
          
          {/* Title section with overlapping text */}
          <div className="relative text-center">
            {/* Introductory text floating over the main title */}
            <p className="font-have-heart text-4xl sm:text-6xl lg:text-6xl px-9 md:px-16 lg:px-32 text-left font-light text-gray-700 relative z-10 -mb-3 sm:-mb-3 md:-mb-0 lg:-mb-0">
              Schedule your
            </p>
            
            {/* Main title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-center text-gray-700 relative z-0">
              Virtual Consult
            </h1>
          </div>
        </div>
        
        <div className="bg-white p-4 sm:p-6">
          {children}
        </div>

        {/* Add tiny text to return to home page */}
        <div className="text-xs text-center text-gray-500 mt-6">
          <a href="https://intownplumbingtx.com/" target="_blank" rel="noopener noreferrer">
            Return to InTown Plumbing Website
          </a>
        </div>
      </div>
    </main>
  );
} 