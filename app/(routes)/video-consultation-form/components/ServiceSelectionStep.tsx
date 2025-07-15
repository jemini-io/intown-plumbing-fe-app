'use client';

import { useEffect, useState, useRef } from 'react';
import { useFormStore } from '../useFormStore';
import FormLayout from '@/components/FormLayout';
import { SERVICE_TO_JOB_TYPES_MAPPING } from '@/lib/utils/constants';

export default function ServiceStep() {
  const [isLoadingJobTypes, setIsLoadingJobTypes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredJobTypeId, setHoveredJobTypeId] = useState<number | null>(null);
  const [openTooltipId, setOpenTooltipId] = useState<number | null>(null);
  const tooltipTimeout = useRef<NodeJS.Timeout | null>(null);

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

  // Helper to handle touch/tap for tooltips
  const handleTooltipToggle = (jobTypeId: number) => {
    setOpenTooltipId(prev => (prev === jobTypeId ? null : jobTypeId));
  };

  // Helper to close tooltip on blur (keyboard)
  const handleTooltipBlur = () => {
    tooltipTimeout.current = setTimeout(() => setOpenTooltipId(null), 100);
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
              <div key={jobType.id} className="inline-block mr-2 mb-2">
                <div className="relative">
                  <button
                    className={`option-button pr-8 ${selectedJobType?.id === jobType.id ? 'selected' : ''}`}
                    onClick={() => handleJobTypeClick(jobType)}
                    title={jobType.displayName}
                    type="button"
                  >
                    <span className="text-xl mr-2">{jobType.emoji}</span>
                    <span className="text-sm sm:text-base leading-tight">{jobType.displayName}</span>
                    {/* Help icon absolutely positioned in top-right */}
                    <button
                      type="button"
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 focus:bg-opacity-100 border border-gray-200 text-gray-400 hover:text-indigo-600 focus:text-indigo-600 outline-none"
                      style={{ zIndex: 2 }}
                      tabIndex={0}
                      aria-label={`Help: ${jobType.description}`}
                      onMouseEnter={() => setOpenTooltipId(jobType.id)}
                      onMouseLeave={() => setOpenTooltipId(null)}
                      onFocus={() => setOpenTooltipId(jobType.id)}
                      onBlur={handleTooltipBlur}
                      onTouchStart={e => {
                        e.stopPropagation();
                        handleTooltipToggle(jobType.id);
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" strokeWidth="2" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-1m0-4a1 1 0 1 1 2 0c0 1-2 1-2 3" />
                      </svg>
                    </button>
                    {/* Tooltip */}
                    {openTooltipId === jobType.id && (
                      <div className="absolute z-20 top-8 right-0 w-56 p-2 bg-white border border-gray-300 rounded shadow-lg text-xs text-gray-700 whitespace-normal"
                        role="tooltip"
                        aria-live="polite"
                      >
                        {jobType.description}
                      </div>
                    )}
                  </button>
                </div>
              </div>
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