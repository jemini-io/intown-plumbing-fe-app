'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFormStore } from '../useFormStore';

function ConfirmationStepContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { setJobId, resetForm } = useFormStore();

  useEffect(() => {
    const name = searchParams.get('name');
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');
    const startTime = searchParams.get('startTime');
    const endTime = searchParams.get('endTime');
    const technicianId = searchParams.get('technicianId');
    const jobTypeId = searchParams.get('jobTypeId');

    if (!name || !email || !phone || !startTime || !endTime || !technicianId || !jobTypeId) {
      setErrorMessage('Missing required information. Please complete the booking process.');
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
          body: JSON.stringify({ 
            name, 
            email, 
            phone, 
            startTime, 
            endTime, 
            technicianId,
            jobTypeId,
          }),
        });

        const data = await response.json();
        
        if ('error' in data) {
          throw new Error(data.error);
        }

        setJobId(data.id);
        setSuccessMessage(`Virtual Service scheduled successfully! Job ID: ${data.id}. You will receive notifications via SMS and email.`);
      } catch (error) {
        console.error('Error confirming job:', error);
        setErrorMessage('Failed to confirm the job. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    confirmJob();
  }, [searchParams, setJobId]);

  const handleStartOver = () => {
    resetForm();
  };

  const handleReturnHome = () => {
    window.location.href = '/';
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full space-y-8">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          </div>
          <p className="text-center text-gray-600">Confirming your appointment...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        {successMessage ? (
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Booking Confirmed!</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>{successMessage}</p>
                  {searchParams.get('technicianName') && (
                    <p className="mt-2">Technician: {searchParams.get('technicianName')}</p>
                  )}
                </div>
                <div className="mt-4 space-x-4">
                  <button
                    onClick={handleReturnHome}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Return to Home
                  </button>
                  <button
                    onClick={handleStartOver}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Book Another
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Booking Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{errorMessage}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={handleStartOver}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Start Over
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ConfirmationStep() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full space-y-8">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          </div>
          <p className="text-center text-gray-600">Loading...</p>
        </div>
      </main>
    }>
      <ConfirmationStepContent />
    </Suspense>
  );
} 