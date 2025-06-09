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
      <FormLayout subtitle="What can we do for you?">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
        <p className="text-center text-gray-600 mt-4">Loading available services...</p>
      </FormLayout>
    );
  }

  if (error) {
    return (
      <FormLayout subtitle="What can we do for you?">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </FormLayout>
    );
  }

  return (
    <FormLayout subtitle="What can we do for you?">
      <div className="survey-container">
        {availableJobTypes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No services available at this time.</p>
          </div>
        ) : (
          <>
            <div className="button-row">
              {availableJobTypes.map(jobType => (
                <button
                  key={jobType.id}
                  className={`option-button ${selectedJobType?.id === jobType.id ? 'selected' : ''}`}
                  onClick={() => handleJobTypeClick(jobType)}
                  title={jobType.displayName}
                >
                  {jobType.displayName}
                </button>
              ))}
            </div>
          </>
        )}

        <h3>Do you have any more details to share?</h3>
        <textarea
          className="details-textarea"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Enter additional details here..."
        />

        <button 
          className="next-button" 
          onClick={handleNextClick}
          disabled={!selectedJobType}
        >
          NEXT
        </button>
      </div>
    </FormLayout>
  );
} 