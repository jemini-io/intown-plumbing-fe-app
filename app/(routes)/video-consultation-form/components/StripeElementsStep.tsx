'use client';

import { useState, useEffect, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useFormStore } from '../useFormStore';
import { createJobAction } from '@/app/actions/createJobAction';
import { sendToParent } from '@/lib/utils/postMessage';
import FormLayout from '@/components/FormLayout';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type PromoCodeResult = {
  valid: boolean;
  originalPrice?: number;
  discountAmount?: number;
  finalPrice?: number;
  error?: string;
  promoCode?: {
    id: string;
    code: string;
    type: 'PERCENT' | 'AMOUNT';
    value: number;
    description?: string | null;
    image?: {
      id: string;
      url: string;
      publicId: string;
    } | null;
  };
};

function PaymentForm({ price, finalPrice }: { price: number; finalPrice: number }) {
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
    } catch {
      setError('Payment failed! Please try again.');
      setIsProcessing(false);
      return;
    }

    try {
      // Payment successful, create booking
      const result = await createJobAction({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        startTime: formData.startTime!,
        endTime: formData.endTime!,
        technicianId: Number(selectedTechnician.id),
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
        finalPrice: finalPrice, // Pass the discounted price
      });
      if (!result.success) throw new Error(result.error || 'Unknown error');
      setJobId(result.id!.toString());
      setCurrentStep('confirmation');
      sendToParent({ type: 'payment_success', data: { jobId: result.id } });
    } catch {
      setError(
        "Payment successful but booking failed. Please contact support at (469) 936-4227."
      );
      sendToParent({ type: 'payment_error', data: { error: 'Booking failed' } });
    } finally {
      setIsProcessing(false);
    }
  }, [stripe, elements, formData, selectedTechnician, selectedJobType, details, setCurrentStep, setJobId, finalPrice]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-sm text-red-700">{error}</p></div>}
      <button type="submit" disabled={!stripe || isProcessing} className="next-button w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium">
        {isProcessing ? 'Processing...' : `Pay Now ${price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`}
      </button>
    </form>
  );
}

// Free booking form (when promo code gives 100% discount)
function FreeBookingForm({ onSuccess }: { onSuccess: () => void }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { formData, selectedTechnician, selectedJobType, details, setCurrentStep, setJobId } = useFormStore();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTechnician || !selectedJobType) {
      setError('Please select a technician and job type.');
      return;
    }
    setIsProcessing(true);
    setError(null);

    try {
      const result = await createJobAction({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        startTime: formData.startTime!,
        endTime: formData.endTime!,
        technicianId: Number(selectedTechnician.id),
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
        finalPrice: 0, // Free booking
      });
      if (!result.success) throw new Error(result.error || 'Unknown error');
      setJobId(result.id!.toString());
      setCurrentStep('confirmation');
      sendToParent({ type: 'booking_success', data: { jobId: result.id } });
      onSuccess();
    } catch {
      setError(
        "Booking failed. Please contact support at (469) 936-4227."
      );
      sendToParent({ type: 'booking_error', data: { error: 'Booking failed' } });
    } finally {
      setIsProcessing(false);
    }
  }, [formData, selectedTechnician, selectedJobType, details, setCurrentStep, setJobId, onSuccess]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-700 font-medium">
          🎉 Your promo code has been applied! No payment required.
        </p>
      </div>
      {error && <div className="bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-sm text-red-700">{error}</p></div>}
      <button 
        type="submit" 
        disabled={isProcessing} 
        className="next-button w-full px-6 py-3 bg-[#C8D96F] hover:bg-[#b8c95f] text-gray-800 rounded-lg font-medium transition-colors"
      >
        {isProcessing ? 'Processing...' : 'Complete Booking'}
      </button>
    </form>
  );
}

export default function StripeElementsStep() {
  const [clientSecret, setClientSecret] = useState('');
  const [productDetails, setProductDetails] = useState<{ stripePrice: number } | null>(null);
  const { formData, setCurrentStep } = useFormStore();
  
  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [promoResult, setPromoResult] = useState<PromoCodeResult | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Calculate final price
  const originalPrice = productDetails?.stripePrice ?? 0;
  const finalPrice = promoResult?.valid ? (promoResult.finalPrice ?? originalPrice) : originalPrice;
  const isFreeBooking = promoResult?.valid && finalPrice === 0;

  useEffect(() => {
    if (!formData.name || !formData.email || !formData.phone || !formData.startTime || !formData.endTime) return;
    
    // Don't fetch payment intent if we have a free booking
    if (isFreeBooking) return;
    
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
      .then(data => {
        setClientSecret(data.clientSecret);
        setProductDetails(data.productDetails);
      })
      .catch(() => setCurrentStep('contact'));
  }, [formData, setCurrentStep, isFreeBooking]);

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoError('Please enter a promo code');
      return;
    }

    setIsValidatingPromo(true);
    setPromoError(null);

    try {
      const response = await fetch('/api/validate-promo-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode }),
      });

      const result: PromoCodeResult = await response.json();

      if (result.valid) {
        setPromoResult(result);
        setPromoError(null);
        // Update productDetails with original price if not set
        if (!productDetails && result.originalPrice) {
          setProductDetails({ stripePrice: result.originalPrice });
        }
        
        // Recreate payment intent with discounted price if not free
        if (result.finalPrice !== undefined && result.finalPrice > 0 && formData.name && formData.email && formData.phone && formData.startTime && formData.endTime) {
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
            body: JSON.stringify({ metadata, amount: result.finalPrice })
          })
            .then(res => res.json())
            .then(data => {
              setClientSecret(data.clientSecret);
              setProductDetails(data.productDetails);
            })
            .catch((err) => {
              console.error('Error recreating payment intent:', err);
            });
        }
      } else {
        setPromoResult(null);
        setPromoError('Invalid');
      }
    } catch {
      setPromoError('Invalid');
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleRemovePromoCode = () => {
    setPromoCode('');
    setPromoResult(null);
    setPromoError(null);
  };


  // Show loading state while fetching payment intent (but not for free bookings)
  if (!isFreeBooking && !clientSecret) {
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
      {/* Price Display */}
      <div className="mb-6 text-center">
        {promoResult?.valid ? (
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg text-gray-500 line-through">
              {originalPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </span>
            <span className="text-lg font-bold text-green-600">
              {finalPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </span>
          </div>
        ) : (
          <div>
            <span className="text-lg font-semibold text-gray-800">Total: </span>
            <span className="text-lg font-bold">{originalPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
          </div>
        )}
      </div>

      {/* Payment Form or Free Booking Form */}
      {isFreeBooking ? (
        <FreeBookingForm onSuccess={() => {}} />
      ) : (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentForm price={finalPrice} finalPrice={finalPrice} />
        </Elements>
      )}

      {/* Promo Code Section */}
      <div className="mt-6 mb-6 p-4 bg-white rounded-lg border border-gray-200 relative overflow-hidden">
        {promoResult?.valid ? (
          <div>
            <div className="flex flex-col items-center gap-1">
              {promoResult.promoCode?.description && (
                <p className="text-xl font-bold text-gray-800 text-center">{promoResult.promoCode.description}</p>
              )}
              <p className="text-sm">
                <span className="font-bold text-green-600">APPLIED!</span>
                {promoResult.discountAmount && (
                  <span className="text-green-600 ml-2">
                    You save {promoResult.discountAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </span>
                )}
              </p>
            </div>
            <div className="flex justify-end mt-1">
              <button
                type="button"
                onClick={handleRemovePromoCode}
                className="text-xs text-red-600 hover:text-red-700 font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter Promo Code
          </label>
        )}
        {!promoResult?.valid && (
          <>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Enter code"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                disabled={isValidatingPromo}
              />
              <button
                type="button"
                onClick={handleApplyPromoCode}
                disabled={isValidatingPromo || !promoCode.trim()}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  promoCode.trim() && !isValidatingPromo
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-red-400 text-white cursor-not-allowed opacity-60'
                }`}
              >
                {isValidatingPromo ? 'Checking...' : 'Apply'}
              </button>
            </div>
          </>
        )}
        {promoError && !promoResult?.valid && (
          <p className="mt-2 text-sm text-red-600">{promoError}</p>
        )}
      </div>
    </FormLayout>
  );
}
