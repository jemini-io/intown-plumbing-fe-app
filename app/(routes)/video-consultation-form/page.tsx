'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFormStore } from './useFormStore';
import ServiceStep from './components/ServiceSelectionStep';
import DateStep from './components/AppointmentDateStep';
import ContactStep from './components/ContactStep';
import EmbeddedCheckoutStep from './components/EmbeddedCheckoutStep';
import ConfirmationStep from './components/ConfirmationStep';

function VideoConsultationFormContent() {
  const searchParams = useSearchParams();
  const { currentStep, setCurrentStep } = useFormStore();

  useEffect(() => {
    // Handle Stripe redirect from confirmation
    const success = searchParams.get('success');
    if (success === 'true') {
      setCurrentStep('confirmation');
    }
  }, [searchParams, setCurrentStep]);

  const renderStep = () => {
    switch (currentStep) {
      case 'service':
        return <ServiceStep />;
      case 'date':
        return <DateStep />;
      case 'contact':
        return <ContactStep />;
      case 'checkout':
        return <EmbeddedCheckoutStep />;
      case 'confirmation':
        return <ConfirmationStep />;
      default:
        return <ServiceStep />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderStep()}
    </div>
  );
}

export default function VideoConsultationForm() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <VideoConsultationFormContent />
    </Suspense>
  );
} 