'use client';

import { useEffect, useState } from 'react';
import { useFormStore } from '../useFormStore';
import FormLayout from '@/components/FormLayout';
import { THIRTY_MINUTES } from '@/lib/utils/constants';

export default function DateStep() {
  const {
    availableTimeSlots,
    selectedDate,
    selectedTimeSlot,
    selectedTechnician,
    isLoading,
    formData,
    setAvailableTimeSlots,
    setSelectedDate,
    setSelectedTimeSlot,
    setSelectedTechnician,
    setIsLoading,
    setFormData,
    setCurrentStep,
  } = useFormStore();

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/appointments');
        if (!response.ok) {
          throw new Error('Failed to fetch time slots');
        }
        const data = await response.json();
        setAvailableTimeSlots(data);
      } catch (error) {
        console.error('Error fetching time slots:', error);
        setError('Failed to load available time slots. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeSlots();
  }, [setAvailableTimeSlots, setIsLoading]);

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null);
    setSelectedTechnician(null);
    
    // Check if selected date has available time slots
    const selectedDateData = availableTimeSlots.find(slot => slot.date === date);
    if (!selectedDateData || selectedDateData.timeSlots.length === 0) {
      setError('No time slots available for the selected date. Please choose another date.');
    } else {
      setError(null);
    }
  };

  const handleTimeSlotClick = (timeSlot: any) => {
    if (timeSlot.technicians.length === 0) return;
    
    // Randomly select a technician
    const randomIndex = Math.floor(Math.random() * timeSlot.technicians.length);
    const selectedTech = timeSlot.technicians[randomIndex];
    
    setSelectedTimeSlot(timeSlot);
    setSelectedTechnician(selectedTech);
    
    // Set start and end times
    const selectedDateObj = new Date(selectedDate + 'T' + timeSlot.time);
    const endTime = new Date(selectedDateObj.getTime() + THIRTY_MINUTES);
    
    setFormData({
      startTime: selectedDateObj.toISOString(),
      endTime: endTime.toISOString(),
    });
  };

  const handleNextClick = () => {
    if (selectedDate && selectedTimeSlot && selectedTechnician) {
      setCurrentStep('contact');
    }
  };

  const handleBackClick = () => {
    setCurrentStep('service');
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date) + ' CT';
  };

  // Get min and max dates from available time slots
  const getDateConstraints = () => {
    if (availableTimeSlots.length === 0) {
      return { min: '', max: '' };
    }
    
    const dates = availableTimeSlots.map(slot => slot.date).sort();
    return {
      min: dates[0],
      max: dates[dates.length - 1]
    };
  };

  const dateConstraints = getDateConstraints();
  const selectedDateData = availableTimeSlots.find(slot => slot.date === selectedDate);

  if (isLoading) {
    return (
      <FormLayout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </FormLayout>
    );
  }

  if (error && !selectedDate) {
    return (
      <FormLayout>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </FormLayout>
    );
  }

  return (
    <FormLayout>
      <div className="space-y-6">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-3">
            Select Date
          </label>
          <input
            type="date"
            id="date"
            value={selectedDate || ''}
            min={dateConstraints.min}
            max={dateConstraints.max}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
          {availableTimeSlots.length > 0 && (
            <p className="mt-2 text-xs text-gray-500">
              Available dates: {dateConstraints.min} to {dateConstraints.max}
            </p>
          )}
        </div>

        {error && selectedDate && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                <svg className="h-5 w-5 text-amber-600 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800 mb-1">No Times Available</p>
                <p className="text-sm text-amber-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {selectedDate && selectedDateData && selectedDateData.timeSlots.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Available Time Slots
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedDateData.timeSlots.map((timeSlot) => (
                <button
                  key={timeSlot.time}
                  onClick={() => handleTimeSlotClick(timeSlot)}
                  disabled={timeSlot.technicians.length === 0}
                  className={`p-4 text-sm font-medium rounded-lg border-2 transition-all ${
                    selectedTimeSlot?.time === timeSlot.time
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : timeSlot.technicians.length === 0
                      ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-gray-900 border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold">{formatTime(timeSlot.time)}</div>
                    <div className="text-xs mt-1 opacity-75">
                      {timeSlot.technicians.length === 0 
                        ? 'Unavailable' 
                        : `${timeSlot.technicians.length} tech${timeSlot.technicians.length > 1 ? 's' : ''} available`
                      }
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedTimeSlot && selectedTechnician && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-3">
                <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900 mb-1">Appointment Selected</p>
                <p className="text-sm text-green-700">
                  {formatTime(selectedTimeSlot.time)} with {selectedTechnician.name}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
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
            onClick={handleNextClick}
            disabled={!selectedDate || !selectedTimeSlot || !selectedTechnician}
            className="w-full sm:flex-1 px-6 py-3 border border-transparent rounded-lg text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className="flex items-center justify-center gap-2">
              Continue
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </FormLayout>
  );
} 