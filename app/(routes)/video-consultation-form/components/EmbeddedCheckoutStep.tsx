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
    if (!formData.name || !formData.email || !formData.phone || !formData.startTime || !formData.endTime) {
      // Don't create checkout session until we have all required data
      return;
    }

    const metadata = {
      email: formData.email,
      end_time: formData.endTime,
      name: formData.name,
      phone: formData.phone,
      start_time: formData.startTime,
      type: "emergency_consultation"
    };

    fetch('/api/create-checkout-session', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ metadata })
    })
      .then(res => res.json())
      .then(data => setClientSecret(data.clientSecret));
  }, [formData]);

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
        jobSummary: `Category Selection: "${selectedJobType.displayName}"\nDetails:\n${details}`,
        street: formData.street,
        unit: formData.unit,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        country: 'US',
        billToStreet: formData.billToStreet,
        billToUnit: formData.billToUnit,
        billToCity: formData.billToCity,
        billToState: formData.billToState,
        billToZip: formData.billToZip,
        billToCountry: 'US',
        billToSameAsService: formData.billToSameAsService,
      });

      if (!result.success) {
        throw new Error(result.error || 'Unknown error');
      }

      setJobId(result.id!.toString()); // Store job ID in zustand
      setCurrentStep('confirmation');
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Payment successful but booking failed. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  }, [formData, selectedTechnician, selectedJobType, details, setCurrentStep, setJobId]);

  if (isProcessing) {
    return (
      <FormLayout>
        <div className="text-center py-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin h-16 w-16 border-4 border-blue-200 border-t-blue-600 rounded-full mb-6"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Payment</h3>
            <p className="text-sm text-gray-600">Finalizing your appointment...</p>
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 w-full max-w-sm">
              <p className="text-xs text-blue-700 text-center">
                Please don&apos;t close this window while we process your request.
              </p>
            </div>
          </div>
        </div>
      </FormLayout>
    );
  }

  if (!clientSecret) {
    return (
      <FormLayout>
        <div className="text-center py-12">
          <div className="flex flex-col items-center">
            <div className="animate-spin h-12 w-12 border-4 border-blue-200 border-t-blue-600 rounded-full mb-4"></div>
            <p className="text-sm text-gray-600">Preparing secure payment...</p>
          </div>
        </div>
      </FormLayout>
    );
  }

  return (
    <FormLayout>
      <div className="space-y-6">
        <div className="flex justify-start">
          <button 
            onClick={() => setCurrentStep('contact')} 
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Contact Info
          </button>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900 mb-1">Secure Payment</p>
              <p className="text-sm text-green-700">
                Your payment information is protected by industry-standard encryption.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{ clientSecret, onComplete: handleComplete }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </div>
    </FormLayout>
  );
} 