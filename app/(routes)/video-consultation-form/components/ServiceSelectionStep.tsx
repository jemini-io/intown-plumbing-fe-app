'use client';

import FormLayout from '@/components/FormLayout';
import { getServiceTypes } from '@/app/actions/getConfig';
import { QuoteSkill, ServiceToJobTypeMapping } from '@/lib/config/types';
import { useEffect, useState } from 'react';
import { useFormStore } from '../useFormStore';

export default function ServiceStep() {
  const [isLoadingJobTypes, setIsLoadingJobTypes] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    availableJobTypes,
    selectedJobType,
    selectedSkill,
    details,
    setAvailableJobTypes,
    setSelectedJobType,
    setSelectedSkill,
    setDetails,
    setCurrentStep,
  } = useFormStore();

  useEffect(() => {
    // Reset selectedSkill in store if job type changes
    setSelectedSkill(null);
  }, [selectedJobType, setSelectedSkill]);

  // useEffect to fetch job types
  useEffect(() => {
    const fetchJobTypes = async () => {
      try {
        setIsLoadingJobTypes(true);
        setError(null);
        const jobTypes = await getServiceTypes();
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

  const handleJobTypeClick = (jobType: ServiceToJobTypeMapping) => {
    setSelectedJobType(jobType);
  };

  const handleNextClick = () => {
    if (selectedJobType) {
      if (selectedJobType.skills && selectedJobType.skills.length > 0 && !selectedSkill) return;
      // Save selectedSkill to form store if needed (extend useFormStore if necessary)
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
          <div className="button-row flex items-stretch">
            {availableJobTypes.map(jobType => (
              <div key={jobType.id} className="flex mr-2 mb-2 flex-1">
                <div className="relative flex-1">
                  <button
                    className={`option-button pr-8 flex flex-col items-center justify-center h-full ${selectedJobType?.id === jobType.id ? 'selected' : ''}`}
                    onClick={() => handleJobTypeClick(jobType)}
                    title={jobType.displayName}
                    type="button"
                  >
                    <span className="text-4xl mb-1">{jobType.emoji}</span>
                    <span className="text-sm sm:text-base leading-tight text-center">{jobType.displayName}</span>
                    <span className="text-xs text-gray-500 mt-1 text-center">{jobType.description}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Show quote skills if 'Get A Quote' is selected */}
        {selectedJobType && selectedJobType.skills && selectedJobType.skills.length > 0 && (
          <div className="mt-6 mb-2">
            <div className="mb-2 text-sm font-semibold text-gray-800">Type of Quote</div>
            <div className="flex flex-col gap-3">
              {selectedJobType.skills.map((skill: QuoteSkill) => (
                <label
                  key={skill}
                  className={`
                    flex items-center px-4 py-3 rounded-lg border cursor-pointer transition
                    ${selectedSkill === skill
                      ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-200'
                      : 'border-gray-200 bg-white hover:border-indigo-400'}
                  `}
                >
                  <input
                    type="radio"
                    name="quote-skill"
                    value={skill}
                    checked={selectedSkill === skill}
                    onChange={() => setSelectedSkill(skill)}
                    className="form-radio text-indigo-600 focus:ring-indigo-500 h-5 w-5 mr-3"
                  />
                  <span className="text-base font-medium text-gray-900">{skill.replace('Virtual Quote - ', '')}</span>
                </label>
              ))}
            </div>
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
          disabled={
            !selectedJobType ||
            (selectedJobType.skills && selectedJobType.skills.length > 0 && !selectedSkill) ||
            !details
          }
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