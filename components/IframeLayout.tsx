'use client';

export default function IframeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </div>
    </div>
  );
} 