'use client';

import { useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFormStore, FormStep } from './useFormStore';
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

  const previousStepRef = useRef<FormStep | null>(null);
  const isHandlingPopStateRef = useRef(false);

  // Handle query param success -> jump straight to confirmation
  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'true') {
      setCurrentStep('confirmation');
    }
  }, [searchParams, setCurrentStep]);

  // Initialize browser history handling once
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Ensure the current entry has a step state
    window.history.replaceState(
      { ...(window.history.state || {}), step: currentStep },
      '',
      window.location.href,
    );

    const handlePopState = (event: PopStateEvent) => {
      const stepFromState = (event.state && event.state.step) as FormStep | undefined;

      if (!stepFromState) {
        // No step in state – let the browser handle normal navigation (leaving the form)
        return;
      }

      isHandlingPopStateRef.current = true;
      setCurrentStep(stepFromState);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setCurrentStep]);

  // Push a new history entry whenever the step changes via in-form navigation
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Skip pushing when we're reacting to a browser back/forward
    if (isHandlingPopStateRef.current) {
      isHandlingPopStateRef.current = false;
      previousStepRef.current = currentStep;
      return;
    }

    if (!previousStepRef.current) {
      previousStepRef.current = currentStep;
      window.history.replaceState(
        { ...(window.history.state || {}), step: currentStep },
        '',
        window.location.href,
      );
      return;
    }

    if (currentStep !== previousStepRef.current) {
      window.history.pushState(
        { ...(window.history.state || {}), step: currentStep },
        '',
        window.location.href,
      );
      previousStepRef.current = currentStep;
    }
  }, [currentStep]);

  const renderStep = () => {
    switch (currentStep) {
      case 'service':
        posthog.capture('form_step_completed', { step: 'page_loaded' });
        return <ServiceStep />;
      case 'date':
        posthog.capture('form_step_completed', { step: 'service_selected' });
        return <DateStep />;
      case 'contact':
        posthog.capture('form_step_completed', { step: 'date_selected' });
        return <ContactStep />;
      case 'checkout':
        posthog.capture('form_step_completed', { step: 'contact_info_entered' });
        return <StripeElementsStep />;
      case 'confirmation':
        posthog.capture('form_step_completed', { step: 'payment_completed' });
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
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      }
    >
      <VideoConsultationFormContent />
    </Suspense>
  );
}