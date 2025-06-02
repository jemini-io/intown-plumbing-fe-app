'use client';

interface FormLayoutProps {
  children: React.ReactNode;
  subtitle: string;
}

export default function FormLayout({ children, subtitle }: FormLayoutProps) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Schedule a Virtual Consultation with InTown Plumbing
          </h2>
          <h4 className="m-2 text-center text-gray-500">
            {subtitle}
          </h4>
          <h6 className="m-2 text-center text-sm text-gray-500">
            Brought to you by InTown Plumbing
          </h6>
        </div>
        {children}
      </div>
    </main>
  );
} 