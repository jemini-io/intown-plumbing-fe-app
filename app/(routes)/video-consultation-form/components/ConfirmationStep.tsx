"use client";

import React from 'react';
import { useFormStore } from '../useFormStore';
import FormLayout from '@/components/FormLayout';
import Image from 'next/image';

export default function ConfirmationStep() {
  const { formData, selectedTechnician, selectedJobType, jobId, resetForm } =
    useFormStore();

  const handleStartOver = () => {
    resetForm();
  };

  const handleReturnHome = () => {
    window.location.href = "/";
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZoneName: "short"
    });
  };

  return (
    <FormLayout>
      <div className="text-center space-y-6">
        {/* Success Header */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-green-800 mb-2">
              Appointment Confirmed!
            </h1>
            <p className="text-sm text-green-700">
              Your virtual consultation has been successfully scheduled
            </p>
          </div>
        </div>

        {/* Success Animation */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 overflow-hidden">
          <Image
            src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZGttZ29obDZxc3FvZ2Jud2xxODVrejhnbHR6c2psMzZnbTA3cWhqOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/HOsHtiVdeypFxOhLAf/giphy.gif"
            alt="Success celebration"
            width={200}
            height={200}
            className="w-full h-32 sm:h-40 object-cover rounded-lg"
          />
        </div>

        {/* Appointment Details */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
          <h2 className="text-lg font-semibold text-blue-900 mb-3 text-center">
            Appointment Details
          </h2>
          <div className="space-y-3">
            {formData.startTime && (
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">Date & Time</p>
                  <p className="text-sm text-blue-700">
                    {formatDateTime(formData.startTime)}
                  </p>
                </div>
              </div>
            )}
            
            {selectedTechnician && (
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">Technician</p>
                  <p className="text-sm text-blue-700">{selectedTechnician.name}</p>
                </div>
              </div>
            )}

            {selectedJobType && (
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">Service</p>
                  <p className="text-sm text-blue-700">{selectedJobType.displayName}</p>
                </div>
              </div>
            )}

            {jobId && (
              <div className="flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900">Confirmation #</p>
                  <p className="text-sm text-blue-700 font-mono">{jobId}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Information Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-amber-800 mb-1">What&apos;s Next?</p>
              <p className="text-sm text-amber-700">
                You will receive appointment reminders via SMS and email. Please ensure you have a stable internet connection for your virtual consultation.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            onClick={handleReturnHome}
            className="w-full sm:flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium text-base transition-colors"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Return to Home
            </span>
          </button>
          
          <button
            onClick={handleStartOver}
            className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 font-medium text-base transition-colors"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Book Another
            </span>
          </button>
        </div>
      </div>
    </FormLayout>
  );
}
