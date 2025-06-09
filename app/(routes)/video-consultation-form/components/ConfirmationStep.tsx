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
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        <div className="bg-green-50 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <h1 className="text-2xl font-medium text-green-800 pb-6 text-center">
                Your Virtual Consultation Confirmed!
              </h1>
              <div className="mb-4">
                <img 
                  src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZGttZ29obDZxc3FvZ2Jud2xxODVrejhnbHR6c2psMzZnbTA3cWhqOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/HOsHtiVdeypFxOhLAf/giphy.gif"
                  alt="Success celebration"
                  className="w-full rounded-lg"
                />
              </div>
              <div className="mt-2 text-sm text-green-700">
                <div className="mt-2 space-y-1">
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
