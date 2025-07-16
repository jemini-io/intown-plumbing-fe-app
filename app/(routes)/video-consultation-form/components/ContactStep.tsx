'use client';

import { useState, useEffect } from 'react';
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';
import { useFormStore } from '../useFormStore';
import FormLayout from '@/components/FormLayout';

const states = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"
];

export default function ContactStep() {
  const [phoneError, setPhoneError] = useState('');
  const [displayPhone, setDisplayPhone] = useState('');
  const { formData, selectedTechnician, selectedJobType, setFormData, setCurrentStep } = useFormStore();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Initialize display phone when component mounts
  useEffect(() => {
    setDisplayPhone(formData.phone);
  }, [formData.phone]);

  // Sync Bill To Address with Service Address when checkbox is checked
  useEffect(() => {
    if (formData.billToSameAsService) {
      setFormData({
        billToStreet: formData.street,
        billToUnit: formData.unit,
        billToCity: formData.city,
        billToState: formData.state,
        billToZip: formData.zip,
      });
    }
  }, [formData.billToSameAsService, formData.street, formData.unit, formData.city, formData.state, formData.zip, formData.country, setFormData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    
    // Store the raw input in form data
    setFormData({ phone: value });
    setPhoneError('');
    
    // Try to format for display
    try {
      if (value && isValidPhoneNumber(value, 'US')) {
        const phoneNumber = parsePhoneNumber(value, 'US');
        const formatted = phoneNumber.formatNational(); // (555) 123-4567 format
        setDisplayPhone(formatted);
      } else {
        setDisplayPhone(value);
      }
    } catch {
      setDisplayPhone(value);
    }
  };

  const handlePhoneBlur = () => {
    // When user finishes typing, format the display
    try {
      if (formData.phone && isValidPhoneNumber(formData.phone, 'US')) {
        const phoneNumber = parsePhoneNumber(formData.phone, 'US');
        const formatted = phoneNumber.formatNational();
        setDisplayPhone(formatted);
      }
    } catch {
      // Keep original if formatting fails
    }
  };

  const formatPhoneForSubmission = (phone: string): string => {
    try {
      const phoneNumber = parsePhoneNumber(phone, 'US');
      return phoneNumber.format('E.164'); // Returns +15551234567 format
    } catch {
      return phone; // Fallback to original if parsing fails
    }
  };

  const formatTime = (date: Date) => {
    if (isNaN(date.getTime())) {
      console.error('Invalid Date:', date);
      return 'Invalid Date';
    }

    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  };

  const formatSelectedTime = () => {
    if (!formData.startTime || !formData.endTime) return '';
    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    const date = new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(start);
    const technicianName = selectedTechnician ? ` with ${selectedTechnician.name}` : '';
    const serviceName = selectedJobType ? `${selectedJobType.displayName}` : '';
    return (
      <div className="text-sm text-blue-700 leading-relaxed">
        <p>Time: {date} {formatTime(start)} - {formatTime(end)}</p>
        <p>Service: {serviceName}</p>
        <p>Technician: {technicianName}</p>
      </div>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone number
    if (!formData.phone || !isValidPhoneNumber(formData.phone, 'US')) {
      setPhoneError('Please enter a valid US phone number');
      return;
    }

    if (!selectedTechnician || !selectedJobType || !formData.name || !formData.email) {
      alert('Please fill in all required fields.');
      return;
    }

    // Format phone number for submission (E.164 format)
    const formattedPhone = formatPhoneForSubmission(formData.phone);
    setFormData({ phone: formattedPhone });
    
    setCurrentStep('checkout');
  };

  const handleBackClick = () => {
    setCurrentStep('date');
  };

  return (
    <FormLayout>
      <div className="space-y-6">
        {/* Appointment Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <svg className="h-5 w-5 text-blue-600 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 mb-2">Your Appointment</p>
              <p className="text-sm text-blue-700 leading-relaxed">
                {formatSelectedTime()}
              </p>
            </div>
          </div>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Personal Information</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className={`w-full px-4 py-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    phoneError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="(555) 123-4567"
                  value={displayPhone}
                  onChange={handlePhoneChange}
                  onBlur={handlePhoneBlur}
                />
                {phoneError && (
                  <p className="mt-1 text-sm text-red-600">{phoneError}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Service Address</h3>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  id="street"
                  name="street"
                  type="text"
                  required
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="123 Main Street"
                  value={formData.street}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">
                  Unit/Apartment
                </label>
                <input
                  id="unit"
                  name="unit"
                  type="text"
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Apt 2B (optional)"
                  value={formData.unit}
                  onChange={handleChange}
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    required
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    id="state"
                    name="state"
                    required
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
                    value={formData.state}
                    onChange={handleChange}
                  >
                    <option value="">Select State</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="sm:w-1/2">
                <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code *
                </label>
                <input
                  id="zip"
                  name="zip"
                  type="text"
                  pattern="\d{5}"
                  required
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="12345"
                  value={formData.zip}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Bill To Address Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">Bill To Address</h3>
            <div>
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  name="billToSameAsService"
                  checked={formData.billToSameAsService ?? true}
                  onChange={e => setFormData({ billToSameAsService: e.target.checked })}
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
                <span className="ml-2 text-sm text-gray-700">Same as Service Address</span>
              </label>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="billToStreet" className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  id="billToStreet"
                  name="billToStreet"
                  type="text"
                  required
                  disabled={formData.billToSameAsService}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="123 Main Street"
                  value={formData.billToStreet}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label htmlFor="billToUnit" className="block text-sm font-medium text-gray-700 mb-2">
                  Unit/Apartment
                </label>
                <input
                  id="billToUnit"
                  name="billToUnit"
                  type="text"
                  disabled={formData.billToSameAsService}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Apt 2B (optional)"
                  value={formData.billToUnit}
                  onChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="billToCity" className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    id="billToCity"
                    name="billToCity"
                    type="text"
                    required
                    disabled={formData.billToSameAsService}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="City"
                    value={formData.billToCity}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label htmlFor="billToState" className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    id="billToState"
                    name="billToState"
                    required
                    disabled={formData.billToSameAsService}
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
                    value={formData.billToState}
                    onChange={handleChange}
                  >
                    <option value="">Select State</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="sm:w-1/2">
                <label htmlFor="billToZip" className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code *
                </label>
                <input
                  id="billToZip"
                  name="billToZip"
                  type="text"
                  pattern="\d{5}"
                  required
                  disabled={formData.billToSameAsService}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="12345"
                  value={formData.billToZip}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="button"
              onClick={handleBackClick}
              className="w-full sm:w-auto px-6 py-3 border-2 border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </span>
            </button>
            
            <button
              type="submit"
              className="w-full sm:flex-1 px-6 py-3 border border-transparent rounded-lg text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span className="flex items-center justify-center gap-2">
                  Continue to Payment
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
            </button>
          </div>
        </form>
      </div>
    </FormLayout>
  );
} 