'use client';

import { useEffect, useState } from 'react';
import { useFormStore } from '../useFormStore';
import FormLayout from '@/components/FormLayout';
import { getJobTypesByBusinessUnit } from '@/app/api/booking/job-types/getJobTypes';
import { SERVICE_TO_JOB_TYPES_MAPPING } from '@/lib/utils/constants';

export default function ServiceStep() {
  const [isLoadingJobTypes, setIsLoadingJobTypes] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    availableJobTypes,
    selectedJobType,
    details,
    setAvailableJobTypes,
    setSelectedJobType,
    setDetails,
    setCurrentStep,
  } = useFormStore();

  // useEffect to fetch job types
  useEffect(() => {
    const fetchJobTypes = async () => {
      try {
        setIsLoadingJobTypes(true);
        setError(null);
        // const jobTypes = await getJobTypesByBusinessUnit();
        const jobTypes = SERVICE_TO_JOB_TYPES_MAPPING;
        setAvailableJobTypes(jobTypes);
        console.log('Fetched job types:', jobTypes);
      } catch (error) {
        console.error('Error fetching job types:', error);
        setError('Failed to load available services. Please try again.');
      } finally {
        setIsLoadingJobTypes(false);
      }
    };
    fetchJobTypes();
  }, [setAvailableJobTypes]);

  const handleJobTypeClick = (jobType: any) => {
    setSelectedJobType(jobType);
  };

  const handleNextClick = () => {
    if (selectedJobType) {
      setCurrentStep('date');
    }
  };

  if (isLoadingJobTypes) {
    return (
      <FormLayout>
        <div className="flex flex-col items-center justify-center py-8 sm:py-12">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-center text-gray-600 text-sm sm:text-base">Loading available services...</p>
        </div>
      </FormLayout>
    );
  }

  if (error) {
    return (
      <FormLayout>
        <div className="text-center py-8 sm:py-12">
          <div className="mb-4">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-600 mb-6 text-sm sm:text-base">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm sm:text-base transition-colors"
          >
            Try Again
          </button>
        </div>
      </FormLayout>
    );
  }

  return (
    <FormLayout>
      <div className="survey-container space-y-6">
        {availableJobTypes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 text-sm sm:text-base">No services available at this time.</p>
          </div>
        ) : (
          <div className="button-row">
            {availableJobTypes.map(jobType => (
              <button
                key={jobType.id}
                className={`option-button ${selectedJobType?.id === jobType.id ? 'selected' : ''}`}
                onClick={() => handleJobTypeClick(jobType)}
                title={jobType.displayName}
              >
                <span className="text-sm sm:text-base leading-tight">{jobType.displayName}</span>
              </button>
            ))}
          </div>
        )}

        <div className="space-y-3">
          <label htmlFor="details" className="block text-sm font-medium text-gray-700">
            What can we help you with?
          </label>
          <textarea
            id="details"
            className="details-textarea"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Enter additional details here..."
            rows={4}
          />
        </div>

        <button 
          className="next-button" 
          onClick={handleNextClick}
          disabled={!selectedJobType}
        >
          <span>Next</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </FormLayout>
  );
} 