'use client';

import { useEffect, useState } from 'react';
import { useFormStore } from '../useFormStore';
import FormLayout from '@/components/FormLayout';

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
    const endTime = new Date(selectedDateObj.getTime() + 60 * 60 * 1000);
    
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
      <FormLayout subtitle="Select Date & Time">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </FormLayout>
    );
  }

  if (error && !selectedDate) {
    return (
      <FormLayout subtitle="Select Date & Time">
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
    <FormLayout subtitle="Select Date & Time">
      <div className="space-y-6">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
            Select Date
          </label>
          <input
            type="date"
            id="date"
            value={selectedDate || ''}
            min={dateConstraints.min}
            max={dateConstraints.max}
            onChange={(e) => handleDateChange(e.target.value)}
            className="mt-1 block w-full px-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          />
          {availableTimeSlots.length > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              Available dates: {dateConstraints.min} to {dateConstraints.max}
            </p>
          )}
        </div>

        {error && selectedDate && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {selectedDate && selectedDateData && selectedDateData.timeSlots.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Time Slots
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {selectedDateData.timeSlots.map((timeSlot) => (
                <button
                  key={timeSlot.time}
                  onClick={() => handleTimeSlotClick(timeSlot)}
                  disabled={timeSlot.technicians.length === 0}
                  className={`p-3 text-sm font-medium rounded-md border ${
                    selectedTimeSlot?.time === timeSlot.time
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : timeSlot.technicians.length === 0
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div>{formatTime(timeSlot.time)}</div>
                  <div className="text-xs mt-1">
                    {timeSlot.technicians.length} tech{timeSlot.technicians.length !== 1 ? 's' : ''} available
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex space-x-4 pt-6">
          <button
            type="button"
            onClick={handleBackClick}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleNextClick}
            disabled={!selectedDate || !selectedTimeSlot || error !== null}
            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </FormLayout>
  );
} 