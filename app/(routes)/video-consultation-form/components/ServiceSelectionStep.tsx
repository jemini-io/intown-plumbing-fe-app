'use client';

import FormLayout from '@/components/FormLayout';
import Icon from '@/components/Icon';
import { getServiceToJobTypes } from '@/lib/appSettings/getConfig';
import { QuoteSkill, ServiceToJobTypeMapping } from '@/lib/config/types';
import { useEffect, useState } from 'react';
import { useFormStore } from '../useFormStore';

export default function ServiceStep() {
  const [isLoadingJobTypes, setIsLoadingJobTypes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState<number | null>(null);

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
        const jobTypes = await getServiceToJobTypes();
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

  const renderIcon = (jobType: ServiceToJobTypeMapping) => {
    if (jobType.icon) {
      return (
        <Icon 
          name={jobType.icon} 
          size={64} 
          color={selectedJobType?.id === jobType.id ? '#FFFFFF' : '#00AEEF'}
          className="transition-colors duration-200"
        />
      );
    }
    // Fallback to emoji for backward compatibility
    return <span className="text-2xl">{jobType.emoji}</span>;
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

  const enabledJobTypes = availableJobTypes.filter(jobType => jobType.enabled);

  return (
    <FormLayout>
      <div className="survey-container space-y-6">
        {enabledJobTypes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 text-sm sm:text-base">No services available at this time.</p>
          </div>
        ) : (
          <div className="button-row flex items-stretch">
            {enabledJobTypes.map(jobType => (
              <div key={jobType.id} className="flex mr-2 mb-2 flex-1">
                <div className="relative flex-1">
                  <button
                    className={`option-button pr-8 flex items-center justify-between h-full w-full ${selectedJobType?.id === jobType.id ? 'selected' : ''}`}
                    onClick={() => handleJobTypeClick(jobType)}
                    title={jobType.displayName}
                    type="button"
                  >
                    {/* Icon - Fixed width */}
                    <div className="flex-shrink-0 w-12 flex justify-center">
                      {renderIcon(jobType)}
                    </div>
                    
                    {/* Title - Growing to fill space */}
                    <div className="flex-1 px-3">
                      <span className="text-md sm:text-lg leading-tight text-center block">{jobType.displayName}</span>
                    </div>
                    
                    {/* Tooltip Question Mark - Fixed width */}
                    <div className="flex-shrink-0 w-8 flex justify-center">
                      <div 
                        className="relative"
                        onMouseEnter={() => setTooltipVisible(jobType.id)}
                        onMouseLeave={() => setTooltipVisible(null)}
                      >
                        <button
                          type="button"
                          className={`w-5 h-5 rounded-full text-xs flex items-center justify-center transition-colors ${
                            selectedJobType?.id === jobType.id 
                              ? 'bg-intown-blue border border-intown-blue text-white hover:bg-intown-blue-dark hover:border-intown-blue-dark'
                              : 'bg-white border border-gray-300 text-gray-300 hover:border-gray-500 hover:text-gray-700'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setTooltipVisible(tooltipVisible === jobType.id ? null : jobType.id);
                          }}
                        >
                          ?
                        </button>
                        
                        {/* Tooltip */}
                        {tooltipVisible === jobType.id && (
                          <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg z-10">
                            <div className="relative">
                              {jobType.description}
                              {/* Tooltip arrow */}
                              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
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
                      ? 'border-intown-blue bg-intown-blue text-white'
                      : 'border-gray-200 bg-white hover:border-indigo-400'}
                  `}
                >
                  <input
                    type="radio"
                    name="quote-skill"
                    value={skill}
                    checked={selectedSkill === skill}
                    onChange={() => setSelectedSkill(skill)}
                    className="form-radio checked:bg-intown-blue checked:border-intown-blue h-5 w-5 mr-3"
                  />
                  <span className={`text-base font-medium ${selectedSkill === skill ? 'text-white' : 'text-gray-900'}`}>{skill.replace('Virtual Quote - ', '')}</span>
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