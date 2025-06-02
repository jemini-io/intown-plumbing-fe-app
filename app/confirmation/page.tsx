'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');

    if (!name || !email || !phone || !startTime || !endTime) {
      setErrorMessage('Missing required information.');
      setIsLoading(false);
      return;
    }

    const confirmJob = async () => {
      try {
        const response = await fetch('/api/job', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email, phone, startTime, endTime }),
        });

        const data = await response.json();
        
        if ('error' in data) {
          throw new Error(data.error);
        }

        setSuccessMessage(`Virtual Service scheduled successfully! Job ID: ${data.id}. You will receive notifications via SMS and email.`);
      } catch (error) {
        console.error('Error confirming job:', error);
        setErrorMessage('Failed to confirm the job. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    confirmJob();
  }, [searchParams]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        {successMessage ? (
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <p className="text-sm text-green-700">{successMessage}</p>
            <button
              onClick={() => window.location.href = '/'}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Return to Home
            </button>
          </div>
        ) : (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}
      </div>
    </main>
  );
} 