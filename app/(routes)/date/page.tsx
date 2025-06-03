'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFormStore } from '@/app/(routes)/video-consultation-form/useFormStore';
import FormLayout from '@/components/FormLayout';

export default function DatePage() {
  const router = useRouter();
  const {
    availableTimeSlots,
    selectedDate,
    isLoading,
    setAvailableTimeSlots,
    setSelectedDate,
    setIsLoading,
    setFormData,
  } = useFormStore();


  useEffect(() => {
    const fetchTimeSlots = async () => {
      try {
        // TODO: rename this because it's not getting bookings, it's getting time slots
        const response = await fetch('/api/book');
        const data = await response.json();
        setAvailableTimeSlots(data);
        if (data.length > 0) {
          setSelectedDate(data[0].date);
        }
      } catch (error) {
        console.error('Error fetching time slots:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeSlots();
  }, [setAvailableTimeSlots, setSelectedDate, setIsLoading]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (time: string) => {
    if (!selectedDate) return;

    const [year, month, day] = selectedDate.split('-').map(Number);
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date(year, month - 1, day, hours, minutes);

    const startTime = date;
    const endTime = new Date(date.getTime() + 30 * 60000);

    setFormData({
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    });
    router.push('/contact');
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
    }).format(date) + ' CT';
  };

  if (!availableTimeSlots || availableTimeSlots.length === 0) {
    return <div>No available time slots</div>
  }

  return (
    <FormLayout subtitle="Select Appointment Date and Time">
      {isLoading ? (
        <div className="flex justify-center items-center">
          <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          <div className="flex overflow-x-auto space-x-4">
            {availableTimeSlots?.map((slot, index) => {
              const [year, month, day] = slot.date.split('-').map(Number);
              const localDate = new Date(year, month - 1, day);

              return (
                <button
                  key={index}
                  onClick={() => handleDateSelect(slot.date)}
                  className={`px-4 py-2 border rounded-md ${selectedDate === slot.date ? 'bg-intown-blue text-white' : 'bg-white text-gray-700'}`}
                >
                  {localDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                </button>
              );
            })}
          </div>

          {selectedDate && (
            <div className="mt-4 space-y-2">
              {availableTimeSlots.find(slot => slot.date === selectedDate)?.timeSlots.map((time, index) => (
                <button
                  key={index}
                  onClick={() => handleTimeSelect(time)}
                  className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {formatTime(new Date(`${selectedDate}T${time}:00`))}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </FormLayout>
  );
} 