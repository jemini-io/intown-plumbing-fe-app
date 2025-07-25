'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFormStore } from './useFormStore';
import ServiceStep from './components/ServiceSelectionStep';
import DateStep from './components/AppointmentDateStep';
import ContactStep from './components/ContactStep';
import StripeElementsStep from './components/StripeElementsStep';
import ConfirmationStep from './components/ConfirmationStep';
import IframeLayout from '@/components/IframeLayout';
import posthog from 'posthog-js';

function VideoConsultationFormContent() {
  const searchParams = useSearchParams();
  const { currentStep, setCurrentStep } = useFormStore();
  const isInIframe = typeof window !== 'undefined' && window.parent !== window;

  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'true') {
      setCurrentStep('confirmation');
    }
  }, [searchParams, setCurrentStep]);

  const renderStep = () => {
    switch (currentStep) {
      case 'service':
        posthog.capture("form_step_completed", { step: "page_loaded" });
        return <ServiceStep />;
      case 'date':
        posthog.capture("form_step_completed", { step: "service_selected" });
        return <DateStep />;
      case 'contact':
        posthog.capture("form_step_completed", { step: "date_selected" });
        return <ContactStep />;
      case 'checkout':
        posthog.capture("form_step_completed", { step: "contact_info_entered" });
        return <StripeElementsStep />;
      case 'confirmation':
        posthog.capture("form_step_completed", { step: "payment_completed" });
        return <ConfirmationStep />;
      default:
        return <ServiceStep />;
    }
  };

  const content = (
    <div className="">
      {renderStep()}
    </div>
  );

  return isInIframe ? <IframeLayout>{content}</IframeLayout> : content;
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