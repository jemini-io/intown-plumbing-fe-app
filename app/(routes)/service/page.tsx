'use client';

import { useRouter } from 'next/navigation';
import { useFormStore } from '@/app/(routes)/video-consultation-form/useFormStore';
import FormLayout from '@/components/FormLayout';

export default function ServicePage() {
  const router = useRouter();
  const {
    selectedService,
    selectedSubService,
    details,
    setSelectedService,
    setSelectedSubService,
    setDetails,
  } = useFormStore();

  const handleServiceClick = (service: string) => {
    setSelectedService(service);
    setSelectedSubService(null);
  };

  const handleSubServiceClick = (subService: string) => {
    setSelectedSubService(subService);
  };

  const handleNextClick = () => {
    if (selectedService && selectedSubService) {
      router.push('/date');
    }
  };

  return (
    <FormLayout subtitle="What can we do for you?">
      <div className="survey-container">
        <div className="button-row">
          {['Plumbing', 'Water Heaters', 'Water Quality', 'Sewer & Gas', 'Foundation'].map(service => (
            <button
              key={service}
              className={`option-button ${selectedService === service ? 'selected' : ''}`}
              onClick={() => handleServiceClick(service)}
            >
              {service}
            </button>
          ))}
        </div>

        {selectedService === 'Plumbing' && (
          <>
            <h3>What plumbing service are you interested in?</h3>
            <div className="button-row">
              {['Plumbing Repair', 'Drain Cleaning', 'Commercial', 'Other'].map(subService => (
                <button
                  key={subService}
                  className={`option-button ${selectedSubService === subService ? 'selected' : ''}`}
                  onClick={() => handleSubServiceClick(subService)}
                >
                  {subService}
                </button>
              ))}
            </div>
          </>
        )}

        {selectedService === 'Water Heaters' && (
          <>
            <h3>What type of water heater are you interested in?</h3>
            <div className="button-row">
              {['Tank Water Heaters', 'Tankless Water Heaters'].map(subService => (
                <button
                  key={subService}
                  className={`option-button ${selectedSubService === subService ? 'selected' : ''}`}
                  onClick={() => handleSubServiceClick(subService)}
                >
                  {subService}
                </button>
              ))}
            </div>
          </>
        )}

        {selectedService === 'Water Quality' && (
          <>
            <h3>Which water quality service are you looking for?</h3>
            <div className="button-row">
              {['Water Testing', 'Water Filtration', 'Water Softeners', 'Water Conditioners', 'Reverse Osmosis', 'UV Water Filters'].map(subService => (
                <button
                  key={subService}
                  className={`option-button ${selectedSubService === subService ? 'selected' : ''}`}
                  onClick={() => handleSubServiceClick(subService)}
                >
                  {subService}
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
          disabled={!selectedService || !selectedSubService}
        >
          NEXT
        </button>
      </div>
    </FormLayout>
  );
} 