'use client';

import { getAvailableAppointmentsAction } from '@/app/actions/getAvailableAppointments';
import type { TimeSlot } from '@/app/api/appointments/getAppointments';
import FormLayout from '@/components/FormLayout';
import { THIRTY_MINUTES } from '@/lib/utils/constants';
import { useEffect, useState } from 'react';
import { useFormStore } from '../useFormStore';

export default function DateStep() {
  const {
    availableTimeSlots,
    selectedDate,
    selectedTimeSlot,
    selectedTechnician,
    isLoading,
    selectedJobType,
    selectedSkill,
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
        setError(null);
        
        const result = await getAvailableAppointmentsAction(selectedJobType, selectedSkill);
        
        if (!result.success) {
          throw new Error(result.error);
        }
        
        setAvailableTimeSlots(result.data || []);
        
        // Auto-select the first available date
        const availableDate = result.data?.find((slot) => {
          const slotDate = new Date(slot.timeSlots[0].time)
          const now = new Date();
          return slotDate >= now && slot.timeSlots.length > 0;
        });
        
        if (availableDate) {
          setSelectedDate(availableDate.date);
        }
      } catch (error) {
        console.error('Error fetching time slots:', error);
        setError('Failed to load available time slots. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (selectedJobType) {
      fetchTimeSlots();
    }
  }, [setAvailableTimeSlots, setIsLoading, setSelectedDate, selectedJobType, selectedSkill]);

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

  const handleTimeSlotClick = (timeSlot: TimeSlot) => {
    if (timeSlot.technicians.length === 0) return;
    
    // Randomly select a technician
    const randomIndex = Math.floor(Math.random() * timeSlot.technicians.length);
    const selectedTech = timeSlot.technicians[randomIndex];
    
    setSelectedTimeSlot(timeSlot);
    setSelectedTechnician(selectedTech);
    
    // Set start and end times
    const selectedDateObj = new Date(timeSlot.time);
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

  // Just show time in local time
  const formatTime = (time: string) => {
    const date = new Date(time);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  // Generate calendar dates starting from today
  const generateCalendarDates = () => {
    const dates = [];
    const today = new Date();
    const availableDates = availableTimeSlots.map(slot => slot.date);
    
    // Generate next 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toLocaleDateString('en-US', { timeZone: 'America/Chicago' });
      
      // Check if this date has available slots
      const hasSlots = availableDates.includes(dateString);
      const slotsData = availableTimeSlots.find(slot => slot.date === dateString);
      
      // Filter out past time slots for today
      let availableSlots = slotsData?.timeSlots || [];
      if (dateString === today.toLocaleDateString('en-US', { timeZone: 'America/Chicago' })) {
        const now = new Date();
        availableSlots = availableSlots.filter(slot => {
          const slotTime = new Date(slot.time);
          return slotTime > now;
        });
      }
      
      const hasAvailableSlots = hasSlots && availableSlots.length > 0;
      
      dates.push({
        date: dateString,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        monthName: date.toLocaleDateString('en-US', { month: 'long' }),
        isAvailable: hasAvailableSlots,
        isSelected: dateString === selectedDate
      });
    }
    
    return dates;
  };

  const calendarDates = generateCalendarDates();
  const selectedDateData = availableTimeSlots.find(slot => slot.date === selectedDate);
  const selectedDateInfo = calendarDates.find(d => d.date === selectedDate);

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
        {/* Month Header */}
        <div className="text-center">
          <h3 className="text-2xl font-light text-gray-600 mb-6">
            {selectedDateInfo ? selectedDateInfo.monthName : new Date().toLocaleDateString('en-US', { month: 'long' })}
          </h3>
        </div>

        {/* Horizontal Scrollable Calendar */}
        <div className="relative">
          {/* Left Arrow */}
          <button 
            onClick={() => {
              const container = document.querySelector('.date-scroll-container');
              container?.scrollBy({ left: -200, behavior: 'smooth' });
            }}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-gray-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {/* Right Arrow */}
          <button 
            onClick={() => {
              const container = document.querySelector('.date-scroll-container');
              container?.scrollBy({ left: 200, behavior: 'smooth' });
            }}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-gray-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div 
            className="date-scroll-container flex overflow-x-auto gap-4 pb-4 px-10 scrollbar-hide" 
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <style jsx>{`
              .scrollbar-hide::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {calendarDates.map((dateInfo) => (
              <button
                key={dateInfo.date}
                onClick={() => dateInfo.isAvailable ? handleDateChange(dateInfo.date) : null}
                disabled={!dateInfo.isAvailable}
                className={`flex-shrink-0 min-w-[64px] w-16 h-20 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                  dateInfo.isSelected
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : dateInfo.isAvailable
                    ? 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                    : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span className="text-xs font-medium mb-1">
                  {dateInfo.dayName}
                </span>
                <span className="text-lg font-semibold">
                  {dateInfo.dayNumber}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Date Info */}
        {selectedDate && selectedDateInfo && (
          <div className="text-center py-2">
            <p className="text-lg font-medium text-gray-700">
              Select time for {selectedDateInfo.dayName}, {selectedDateInfo.monthName} {selectedDateInfo.dayNumber}
            </p>
          </div>
        )}

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedDateData.timeSlots.filter(slot => {
                // Filter out past time slots for today
                if (selectedDate === new Date().toISOString().split('T')[0]) {
                  const [hours, minutes] = slot.time.split(':');
                  const slotTime = new Date();
                  slotTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                  return slotTime > new Date();
                }
                return true;
              }).map((timeSlot) => (
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
                  </div>
                </button>
              ))}
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