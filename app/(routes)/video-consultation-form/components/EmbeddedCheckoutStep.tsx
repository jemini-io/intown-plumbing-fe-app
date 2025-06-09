'use client';

import { useState, useEffect, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { useFormStore } from '../useFormStore';
import FormLayout from '@/components/FormLayout';
import { createJobAction } from '@/app/actions/createJobAction';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function EmbeddedCheckoutStep() {
  const [clientSecret, setClientSecret] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { formData, selectedTechnician, selectedJobType, details, setCurrentStep, setJobId } = useFormStore();

  useEffect(() => {
    fetch('/api/create-checkout-session', { method: 'POST' })
      .then(res => res.json())
      .then(data => setClientSecret(data.clientSecret));
  }, []);

  const handleComplete = useCallback(async () => {
    if (!selectedTechnician || !selectedJobType) return;
    
    setIsProcessing(true);
    try {
      // Create the booking after successful payment using server action
      const result = await createJobAction({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        startTime: formData.startTime!,
        endTime: formData.endTime!,
        technicianId: selectedTechnician.id,
        jobTypeId: selectedJobType.serviceTitanId,
        jobSummary: selectedJobType.displayName + " \n " + details,
        street: formData.street,
        unit: formData.unit,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        country: 'US',
      });

      if (!result.success) {
        throw new Error(result.error || 'Unknown error');
      }

      setJobId(result.id!); // Store job ID in zustand
      setCurrentStep('confirmation');
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Payment successful but booking failed. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  }, [formData, selectedTechnician, selectedJobType, setCurrentStep, setJobId]);

  if (isProcessing) {
    return (
      <FormLayout subtitle="Creating Appointment">
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Finalizing your appointment...</p>
        </div>
      </FormLayout>
    );
  }

  if (!clientSecret) {
    return (
      <FormLayout subtitle="Loading Payment">
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        </div>
      </FormLayout>
    );
  }

  return (
    <FormLayout subtitle="Complete Payment">
      <button onClick={() => setCurrentStep('contact')} className="mb-4 text-indigo-600 hover:text-indigo-800">
        ← Back to Contact Info
      </button>
      
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ clientSecret, onComplete: handleComplete }}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </FormLayout>
  );
} 