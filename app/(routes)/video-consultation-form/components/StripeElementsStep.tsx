'use client';

import { useState, useEffect, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useFormStore } from '../useFormStore';
import { createJobAction } from '@/app/actions/createJobAction';
import { sendToParent } from '@/lib/utils/postMessage';
import FormLayout from '@/components/FormLayout';
import Image from 'next/image';

// Sparkles animation
function Sparkles() {
  return (
    <div className="effect-container">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="sparkle"
          style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 80}%`,
            animationDelay: `${Math.random() * 0.8}s`,
          }}
        />
      ))}
      <style jsx>{`
        .effect-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: 10;
        }
        .sparkle {
          position: absolute;
          width: 8px;
          height: 8px;
          opacity: 0;
          animation: sparkle 1.2s ease-out forwards;
        }
        .sparkle::before,
        .sparkle::after {
          content: '';
          position: absolute;
          background: #ffd700;
        }
        .sparkle::before {
          width: 100%;
          height: 2px;
          top: 50%;
          left: 0;
          transform: translateY(-50%);
        }
        .sparkle::after {
          width: 2px;
          height: 100%;
          left: 50%;
          top: 0;
          transform: translateX(-50%);
        }
        @keyframes sparkle {
          0% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.5) rotate(180deg); }
          100% { opacity: 0; transform: scale(0) rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Confetti animation
function Confetti() {
  return (
    <div className="effect-container">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="confetti"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.5}s`,
            backgroundColor: ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#aa96da', '#fcbad3'][Math.floor(Math.random() * 7)],
          }}
        />
      ))}
      <style jsx>{`
        .effect-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: 10;
        }
        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          top: 50%;
          opacity: 0;
          animation: confetti-fall 1.5s ease-out forwards;
        }
        .confetti:nth-child(odd) { border-radius: 50%; }
        .confetti:nth-child(even) { border-radius: 2px; transform: rotate(45deg); }
        @keyframes confetti-fall {
          0% { opacity: 1; transform: translateY(0) rotate(0deg) scale(0); }
          10% { transform: translateY(-20px) rotate(45deg) scale(1); }
          100% { opacity: 0; transform: translateY(100px) rotate(720deg) scale(0.5); }
        }
      `}</style>
    </div>
  );
}

// Fireworks animation
function Fireworks() {
  return (
    <div className="effect-container">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="firework"
          style={{
            transform: `rotate(${i * 30}deg)`,
            backgroundColor: ['#ff6b6b', '#4ecdc4', '#ffe66d', '#f38181', '#aa96da'][i % 5],
          }}
        />
      ))}
      <style jsx>{`
        .effect-container {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: 10;
        }
        .firework {
          position: absolute;
          width: 4px;
          height: 20px;
          top: 50%;
          left: 50%;
          transform-origin: center center;
          opacity: 0;
          border-radius: 2px;
          animation: firework-burst 1s ease-out forwards;
        }
        @keyframes firework-burst {
          0% { opacity: 1; transform: rotate(var(--r, 0deg)) translateY(0) scale(0); }
          50% { opacity: 1; transform: rotate(var(--r, 0deg)) translateY(-60px) scale(1); }
          100% { opacity: 0; transform: rotate(var(--r, 0deg)) translateY(-80px) scale(0.5); }
        }
        .firework:nth-child(1) { --r: 0deg; }
        .firework:nth-child(2) { --r: 30deg; }
        .firework:nth-child(3) { --r: 60deg; }
        .firework:nth-child(4) { --r: 90deg; }
        .firework:nth-child(5) { --r: 120deg; }
        .firework:nth-child(6) { --r: 150deg; }
        .firework:nth-child(7) { --r: 180deg; }
        .firework:nth-child(8) { --r: 210deg; }
        .firework:nth-child(9) { --r: 240deg; }
        .firework:nth-child(10) { --r: 270deg; }
        .firework:nth-child(11) { --r: 300deg; }
        .firework:nth-child(12) { --r: 330deg; }
      `}</style>
    </div>
  );
}

// Coins animation
function Coins() {
  return (
    <div className="effect-container">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="coin"
          style={{
            left: `${10 + Math.random() * 80}%`,
            animationDelay: `${Math.random() * 0.5}s`,
          }}
        >
          $
        </div>
      ))}
      <style jsx>{`
        .effect-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: 10;
        }
        .coin {
          position: absolute;
          top: -20px;
          font-size: 20px;
          color: #ffd700;
          text-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
          animation: coin-fall 1.5s ease-in forwards;
        }
        @keyframes coin-fall {
          0% { opacity: 1; transform: translateY(0) rotateY(0deg); }
          100% { opacity: 0; transform: translateY(150px) rotateY(720deg); }
        }
      `}</style>
    </div>
  );
}

// Hearts animation
function Hearts() {
  return (
    <div className="effect-container">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="heart"
          style={{
            left: `${10 + Math.random() * 80}%`,
            animationDelay: `${Math.random() * 0.6}s`,
            fontSize: `${14 + Math.random() * 10}px`,
          }}
        >
          ❤️
        </div>
      ))}
      <style jsx>{`
        .effect-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: 10;
        }
        .heart {
          position: absolute;
          bottom: 0;
          animation: heart-float 1.5s ease-out forwards;
        }
        @keyframes heart-float {
          0% { opacity: 1; transform: translateY(0) scale(0); }
          50% { opacity: 1; transform: translateY(-50px) scale(1.2); }
          100% { opacity: 0; transform: translateY(-100px) scale(0.8); }
        }
      `}</style>
    </div>
  );
}

// Stars burst animation
function StarsBurst() {
  return (
    <div className="effect-container">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="star"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.4}s`,
          }}
        >
          ⭐
        </div>
      ))}
      <style jsx>{`
        .effect-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: 10;
        }
        .star {
          position: absolute;
          font-size: 16px;
          animation: star-pop 1s ease-out forwards;
        }
        @keyframes star-pop {
          0% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.5) rotate(180deg); }
          100% { opacity: 0; transform: scale(0.5) rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Bubbles animation
function Bubbles() {
  return (
    <div className="effect-container">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="bubble"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.5}s`,
            width: `${8 + Math.random() * 12}px`,
            height: `${8 + Math.random() * 12}px`,
          }}
        />
      ))}
      <style jsx>{`
        .effect-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: 10;
        }
        .bubble {
          position: absolute;
          bottom: 0;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8), rgba(100,200,255,0.4));
          border: 1px solid rgba(100,200,255,0.5);
          animation: bubble-rise 1.5s ease-out forwards;
        }
        @keyframes bubble-rise {
          0% { opacity: 0; transform: translateY(0) scale(0); }
          20% { opacity: 1; transform: translateY(-10px) scale(1); }
          100% { opacity: 0; transform: translateY(-120px) scale(0.6); }
        }
      `}</style>
    </div>
  );
}

// Ribbons animation
function Ribbons() {
  return (
    <div className="effect-container">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="ribbon"
          style={{
            left: `${10 + i * 12}%`,
            animationDelay: `${i * 0.1}s`,
            backgroundColor: ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#f38181', '#aa96da', '#fcbad3', '#45b7d1'][i],
          }}
        />
      ))}
      <style jsx>{`
        .effect-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: 10;
        }
        .ribbon {
          position: absolute;
          top: -20px;
          width: 8px;
          height: 40px;
          border-radius: 4px;
          animation: ribbon-fall 1.5s ease-in forwards;
        }
        @keyframes ribbon-fall {
          0% { opacity: 1; transform: translateY(0) rotate(0deg); }
          100% { opacity: 0; transform: translateY(150px) rotate(720deg); }
        }
      `}</style>
    </div>
  );
}

// Explosion animation
function Explosion() {
  return (
    <div className="effect-container">
      {[...Array(16)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            '--angle': `${i * 22.5}deg`,
            backgroundColor: ['#ff6b6b', '#4ecdc4', '#ffe66d', '#f38181'][i % 4],
          } as React.CSSProperties}
        />
      ))}
      <style jsx>{`
        .effect-container {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: 10;
        }
        .particle {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          animation: explode 1s ease-out forwards;
        }
        @keyframes explode {
          0% { opacity: 1; transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(0); }
          30% { opacity: 1; transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-40px) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-80px) scale(0.3); }
        }
      `}</style>
    </div>
  );
}

// Party poppers animation
function PartyPoppers() {
  return (
    <div className="effect-container">
      {[...Array(25)].map((_, i) => (
        <div
          key={i}
          className="popper"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 0.3}s`,
          }}
        >
          🎉
        </div>
      ))}
      <style jsx>{`
        .effect-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: 10;
        }
        .popper {
          position: absolute;
          top: 50%;
          font-size: 18px;
          animation: popper-burst 1.2s ease-out forwards;
        }
        @keyframes popper-burst {
          0% { opacity: 1; transform: translateY(0) scale(0) rotate(0deg); }
          50% { opacity: 1; transform: translateY(-30px) scale(1.2) rotate(180deg); }
          100% { opacity: 0; transform: translateY(50px) scale(0.5) rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Thumbs up animation
function ThumbsUp() {
  return (
    <div className="effect-container">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="thumb"
          style={{
            left: `${15 + Math.random() * 70}%`,
            animationDelay: `${Math.random() * 0.4}s`,
            fontSize: `${16 + Math.random() * 8}px`,
          }}
        >
          👍
        </div>
      ))}
      <style jsx>{`
        .effect-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          z-index: 10;
        }
        .thumb {
          position: absolute;
          bottom: 20%;
          animation: thumb-pop 1.2s ease-out forwards;
        }
        @keyframes thumb-pop {
          0% { opacity: 0; transform: scale(0) rotate(-20deg); }
          40% { opacity: 1; transform: scale(1.3) rotate(10deg); }
          70% { opacity: 1; transform: scale(1) rotate(0deg); }
          100% { opacity: 0; transform: scale(0.8) translateY(-30px); }
        }
      `}</style>
    </div>
  );
}

// Random celebration effect selector
function CelebrationEffect() {
  const effects = [Sparkles, Confetti, Fireworks, Coins, Hearts, StarsBurst, Bubbles, Ribbons, Explosion, PartyPoppers, ThumbsUp];
  const [EffectComponent] = useState(() => effects[Math.floor(Math.random() * effects.length)]);
  return <EffectComponent />;
}

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
  const [promoPreview, setPromoPreview] = useState<PromoCodeResult['promoCode'] | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

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
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
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
        setPromoError(result.error || 'Invalid promo code');
      }
    } catch {
      setPromoError('Failed to validate promo code. Please try again.');
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleRemovePromoCode = () => {
    setPromoCode('');
    setPromoResult(null);
    setPromoError(null);
    setPromoPreview(null);
    setPreviewError(null);
  };

  // Load promo code preview when typing
  useEffect(() => {
    if (!promoCode.trim() || promoResult?.valid) {
      setPromoPreview(null);
      setPreviewError(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoadingPreview(true);
      setPreviewError(null);
      try {
        const response = await fetch('/api/validate-promo-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: promoCode }),
        });
        const result: PromoCodeResult = await response.json();
        if (result.valid && result.promoCode) {
          setPromoPreview(result.promoCode);
          setPreviewError(null);
        } else {
          setPromoPreview(null);
          // If error message exists, it means the code was found but has restrictions
          if (result.error && result.error !== 'Invalid promo code') {
            setPreviewError(result.error);
          } else {
            setPreviewError(null);
          }
        }
      } catch {
        setPromoPreview(null);
        setPreviewError(null);
      } finally {
        setIsLoadingPreview(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [promoCode, promoResult?.valid]);

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

      {/* Promo Code Section */}
      <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 relative overflow-hidden">
        {showConfetti && <CelebrationEffect />}
        {promoResult?.valid ? (
          <div>
            <div className="flex flex-col items-center gap-1">
              {promoResult.promoCode?.description && (
                <p className="text-xl font-bold text-gray-800 text-center">{promoResult.promoCode.description}</p>
              )}
              {promoResult.promoCode?.image?.url && (
                <Image
                  src={promoResult.promoCode.image.url}
                  alt={promoResult.promoCode.code}
                  width={160}
                  height={110}
                  className="rounded-lg object-cover"
                />
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
                disabled={isValidatingPromo || !promoCode.trim() || !promoPreview || isLoadingPreview}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  promoCode.trim() && promoPreview && !isLoadingPreview
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-red-400 text-white cursor-not-allowed opacity-60'
                }`}
              >
                {isValidatingPromo ? 'Checking...' : 'Apply'}
              </button>
            </div>
            {/* Promo preview while typing */}
            {isLoadingPreview && (
              <div className="mt-3 text-sm text-gray-500 text-center">Loading...</div>
            )}
            {previewError && !isLoadingPreview && (
              <p className="mt-2 text-sm text-orange-600">{previewError}</p>
            )}
            {promoPreview && !isLoadingPreview && (
              <div className="mt-3 flex items-center gap-3">
                {promoPreview.image?.url && (
                  <Image
                    src={promoPreview.image.url}
                    alt={promoPreview.code}
                    width={100}
                    height={70}
                    className="rounded-lg object-cover flex-shrink-0"
                  />
                )}
                {promoPreview.description && (
                  <p className="text-sm text-gray-600">{promoPreview.description}</p>
                )}
              </div>
            )}
          </>
        )}
        {promoError && !promoResult?.valid && (
          <p className="mt-2 text-sm text-red-600">{promoError}</p>
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
    </FormLayout>
  );
}
