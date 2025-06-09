"use client";

import { useFormStore } from "../useFormStore";

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
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    });
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Booking Confirmed!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Virtual Service scheduled successfully!</p>
                {jobId && <p>Job ID: {jobId}</p>}
                <div className="mt-2 space-y-1">
                  <p>
                    <strong>Name:</strong> {formData.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {formData.email}
                  </p>
                  <p>
                    <strong>Phone:</strong> {formData.phone}
                  </p>
                  {formData.startTime && (
                    <p>
                      <strong>Appointment:</strong>{" "}
                      {formatDateTime(formData.startTime)}
                    </p>
                  )}
                  {selectedTechnician && (
                    <p>
                      <strong>Technician:</strong> {selectedTechnician.name}
                    </p>
                  )}
                  {selectedJobType && (
                    <p>
                      <strong>Service:</strong> {selectedJobType.displayName}
                    </p>
                  )}
                </div>
                <p className="mt-2">
                  You will receive notifications via SMS and email.
                </p>
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
      </div>
    </main>
  );
}
