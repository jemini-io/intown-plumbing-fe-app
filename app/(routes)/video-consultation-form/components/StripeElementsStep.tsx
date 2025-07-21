'use client';

import { useState, useEffect, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useFormStore } from '../useFormStore';
import { createJobAction } from '@/app/actions/createJobAction';
import { sendToParent } from '@/lib/utils/postMessage';
import FormLayout from '@/components/FormLayout';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { formData, selectedTechnician, selectedJobType, details, setCurrentStep, setJobId } = useFormStore();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    if (!selectedTechnician || !selectedJobType) {
      setError('Please select a technician and job type.');
      return;
    }
    setIsProcessing(true);
    setError(null);
    try {
      const { error: confirmError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/video-consultation-form?success=true`,
        },
        redirect: 'if_required',
      });
      if (confirmError) {
        setError(confirmError.message || 'Payment failed');
        sendToParent({ type: 'payment_error', data: { error: confirmError.message } });
        return;
      }
      // Payment successful, create booking
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
      if (!result.success) throw new Error(result.error || 'Unknown error');
      setJobId(result.id!.toString());
      setCurrentStep('confirmation');
      sendToParent({ type: 'payment_success', data: { jobId: result.id } });
    } catch {
      setError('Payment successful but booking failed. Please contact support.');
      sendToParent({ type: 'payment_error', data: { error: 'Booking failed' } });
    } finally {
      setIsProcessing(false);
    }
  }, [stripe, elements, formData, selectedTechnician, selectedJobType, details, setCurrentStep, setJobId]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-sm text-red-700">{error}</p></div>}
      <button type="submit" disabled={!stripe || isProcessing} className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}

export default function StripeElementsStep() {
  const [clientSecret, setClientSecret] = useState('');
  const { formData, setCurrentStep } = useFormStore();

  useEffect(() => {
    if (!formData.name || !formData.email || !formData.phone || !formData.startTime || !formData.endTime) return;
    const metadata = {
      email: formData.email,
      end_time: formData.endTime,
      name: formData.name,
      phone: formData.phone,
      start_time: formData.startTime,
      type: "emergency_consultation"
    };
    fetch('/api/create-payment-intent', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metadata })
    })
      .then(res => res.json())
      .then(data => setClientSecret(data.clientSecret))
      .catch(() => setCurrentStep('contact'));
  }, [formData, setCurrentStep]);

  if (!clientSecret) {
    return (
      <div className="text-center py-12">
        <div className="flex flex-col items-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-200 border-t-blue-600 rounded-full mb-4"></div>
          <p className="text-sm text-gray-600">Preparing secure payment...</p>
        </div>
      </div>
    );
  }

  return (
    <FormLayout>
      <Elements stripe={stripePromise} options={{ clientSecret }}>
        <PaymentForm />
      </Elements>
    </FormLayout>
  );
} 