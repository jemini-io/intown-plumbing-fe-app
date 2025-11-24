"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import Image from "next/image";
import { Booking, BookingStatus } from "@/lib/types/booking";
import { getAllBookings, updateBooking } from "../actions";
import { PlusIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { SpinnerOverlay } from "@/app/dashboard/components/Spinner";

interface BookingsCalendarViewProps {
  refreshTrigger?: number;
  onBookingClick?: (booking: Booking) => void;
  onAddBooking?: (date: Date, timeSlot: string) => void;
  onBookingUpdate?: () => void;
}

// Generate time slots from 7:30 AM to 11:30 PM in 15-minute intervals
function generateTimeSlots(): string[] {
  const slots: string[] = [];
  let hour = 7;
  let minute = 30;

  // Continue until 11:30 PM (23:30)
  while (hour < 23 || (hour === 23 && minute <= 30)) {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const timeStr = `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
    slots.push(timeStr);

    minute += 15;
    if (minute >= 60) {
      minute = 0;
      hour++;
    }
  }

  return slots;
}


// Get date for a specific day of a given week (Monday = 0, Tuesday = 1, etc.)
function getDateForDay(dayIndex: number, weekOffset: number = 0): Date {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Adjust to get Monday
  const targetDate = new Date(today);
  // Add week offset (0 = current week, 1 = next week, -1 = previous week)
  targetDate.setDate(today.getDate() + mondayOffset + dayIndex + (weekOffset * 7));
  return targetDate;
}

// Convert time string to minutes since midnight for comparison
function timeToMinutes(timeStr: string): number {
  const [time, period] = timeStr.split(" ");
  const [hours, minutes] = time.split(":").map(Number);
  let totalMinutes = hours * 60 + minutes;
  
  // Handle 12:00 AM (midnight) and 12:00 PM (noon)
  if (period === "PM" && hours !== 12) {
    totalMinutes += 12 * 60; // Add 12 hours for PM times (except 12:00 PM)
  } else if (period === "AM" && hours === 12) {
    totalMinutes = minutes; // 12:00 AM is midnight (0 hours)
  }
  // 12:00 PM stays as 12 * 60 = 720 minutes (noon)
  
  return totalMinutes;
}

// Get color for booking based on status
// Colors remain the same in both light and dark mode
function getBookingColor(booking: Booking): string {
  // Priority: status determines the color
  switch (booking.status) {
    case "SCHEDULED":
      return "bg-blue-200 text-blue-900";
    case "PENDING":
      return "bg-yellow-200 text-yellow-900";
    case "CANCELED":
      return "bg-red-200 text-red-900";
    case "COMPLETED":
      return "bg-green-200 text-green-900";
    default:
      return "bg-purple-200 text-purple-900";
  }
}

// Get status badge color classes
// Text color matches the booking box text color for contrast
function getStatusBadgeColor(status: BookingStatus): string {
  switch (status) {
    case "COMPLETED":
      return "bg-green-100 dark:bg-green-900/30 text-green-900";
    case "SCHEDULED":
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-900";
    case "PENDING":
      return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900";
    case "CANCELED":
      return "bg-red-100 dark:bg-red-900/30 text-red-900";
    default:
      return "bg-gray-100 dark:bg-gray-700 text-gray-900";
  }
}

// Get bookings for a specific day
function getBookingsForDay(bookings: Booking[], dayDate: Date): Booking[] {
  const dayStr = dayDate.toDateString();
  return bookings.filter((booking) => {
    // Handle both Date objects and string dates
    const bookingDate = booking.scheduledFor instanceof Date 
      ? booking.scheduledFor 
      : new Date(booking.scheduledFor as string);
    
    // Check if the booking is on the same day
    const bookingDayStr = bookingDate.toDateString();
    return bookingDayStr === dayStr;
  });
}


// Calculate booking duration in minutes (default 30, but can be longer if there's a pattern)
function calculateBookingDuration(booking: Booking): number {
  const serviceName = booking.service?.displayName?.toLowerCase() || "";
  
  // Some services might have different default durations
  if (serviceName.includes("emergency")) {
    return 30; // 30 minutes
  }
  if (serviceName.includes("quote")) {
    return 35; // 35 minutes (like in the image: 8:45-9:20)
  }
  if (serviceName.includes("diy")) {
    return 90; // 90 minutes (like in the image: 8:30-10:00)
  }

  return 30; // Default 30 minutes
}

export function BookingsCalendarView({ refreshTrigger, onBookingClick, onAddBooking }: BookingsCalendarViewProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, 1 = next week, -1 = previous week
  const [hoveredCell, setHoveredCell] = useState<string | null>(null); // Track which cell is hovered (format: "day-slot")
  const [draggedBooking, setDraggedBooking] = useState<Booking | null>(null);
  const [dragOverCell, setDragOverCell] = useState<string | null>(null);
  const [lastBookingState, setLastBookingState] = useState<{ bookingId: string; previousScheduledFor: Date } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);
  const calendarBodyRef = useRef<HTMLDivElement>(null);
  const [highlightedTimeSlot, setHighlightedTimeSlot] = useState<string | null>(null);
  const [highlightedDayDate, setHighlightedDayDate] = useState<Date | null>(null);
  const [hoveredDateTime, setHoveredDateTime] = useState<{ date: Date; time: string } | null>(null);
  const [targetDateTime, setTargetDateTime] = useState<Date | null>(null);

  const timeSlots = useMemo(() => generateTimeSlots(), []);
  const weekDays = useMemo(() => {
    return [
      { name: "Monday", date: getDateForDay(0, weekOffset) },
      { name: "Tuesday", date: getDateForDay(1, weekOffset) },
      { name: "Wednesday", date: getDateForDay(2, weekOffset) },
      { name: "Thursday", date: getDateForDay(3, weekOffset) },
      { name: "Friday", date: getDateForDay(4, weekOffset) },
    ];
  }, [weekOffset]);

  const goToPreviousWeek = () => setWeekOffset(prev => prev - 1);
  const goToNextWeek = () => setWeekOffset(prev => prev + 1);
  const goToCurrentWeek = () => setWeekOffset(0);

  // Calculate week offset from a specific date
  const goToWeek = (date: Date) => {
    const today = new Date();
    const targetDate = new Date(date);
    
    // Get Monday of target week
    const targetDay = targetDate.getDay();
    const targetMondayOffset = targetDay === 0 ? -6 : 1 - targetDay;
    const targetMonday = new Date(targetDate);
    targetMonday.setDate(targetDate.getDate() + targetMondayOffset);
    
    // Get Monday of current week
    const currentDay = today.getDay();
    const currentMondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const currentMonday = new Date(today);
    currentMonday.setDate(today.getDate() + currentMondayOffset);
    
    // Calculate difference in weeks
    const diffTime = targetMonday.getTime() - currentMonday.getTime();
    const diffWeeks = Math.round(diffTime / (7 * 24 * 60 * 60 * 1000));
    
    setWeekOffset(diffWeeks);
  };

  // Handle date input change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(e.target.value);
    if (!isNaN(selectedDate.getTime())) {
      goToWeek(selectedDate);
    }
  };

  // Get week range for display
  const weekRange = useMemo(() => {
    const monday = weekDays[0].date;
    const friday = weekDays[4].date;
    return {
      start: monday.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      end: friday.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      mondayDate: monday, // For date input
    };
  }, [weekDays]);

  useEffect(() => {
    async function loadBookings() {
      try {
        const allBookings = await getAllBookings();
        setBookings(allBookings);
      } catch (error) {
        console.error("Error loading bookings:", error);
      } finally {
        setLoading(false);
      }
    }
    loadBookings();
  }, [refreshTrigger]);

  // Handle booking drag and drop
  const handleDragStart = (e: React.DragEvent, booking: Booking) => {
    setDraggedBooking(booking);
    setHighlightedTimeSlot(null);
    setHighlightedDayDate(null);
    setHoveredDateTime(null);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", booking.id);
  };

  const handleDragEnd = () => {
    // Clean up drag state if drop didn't happen or was cancelled
    // Only clean up if we're not currently updating (which means drop was successful)
    if (!isUpdating) {
      setDraggedBooking(null);
      setDragOverCell(null);
      setHighlightedTimeSlot(null);
      setHighlightedDayDate(null);
      setHoveredDateTime(null);
    }
  };

  const handleDragOver = (e: React.DragEvent, dayDate: Date, slot: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const cellKey = `${dayDate.toDateString()}-${slot}`;
    setDragOverCell(cellKey);
    
    // Calculate which time slot is being hovered based on Y position
    if (calendarBodyRef.current && draggedBooking) {
      const calendarBodyRect = calendarBodyRef.current.getBoundingClientRect();
      const dragY = e.clientY - calendarBodyRect.top;
      const slotHeight = 48;
      const slotIndex = Math.max(0, Math.floor(dragY / slotHeight));
      const actualSlotIndex = Math.min(slotIndex, timeSlots.length - 1);
      const targetSlot = timeSlots[actualSlotIndex];
      setHighlightedTimeSlot(targetSlot);
      
      // Calculate the exact date and time for the hovered cell
      const slotMinutes = timeToMinutes(targetSlot);
      const slotHour = Math.floor(slotMinutes / 60);
      const slotMin = slotMinutes % 60;
      const hoverDate = new Date(dayDate);
      hoverDate.setHours(slotHour, slotMin, 0, 0);
      
      setHighlightedDayDate(dayDate);
      setHoveredDateTime({
        date: hoverDate,
        time: targetSlot,
      });
    }
  };

  const handleDragLeave = () => {
    setDragOverCell(null);
    setHighlightedTimeSlot(null);
    setHighlightedDayDate(null);
    setHoveredDateTime(null);
  };

  const handleDrop = async (e: React.DragEvent, dayDate: Date) => {
    e.preventDefault();
    setDragOverCell(null);
    setHighlightedTimeSlot(null);
    setHighlightedDayDate(null);
    setHoveredDateTime(null);
    
    if (!draggedBooking || !calendarBodyRef.current) return;

    // Calculate the Y position relative to the calendar body
    const calendarBodyRect = calendarBodyRef.current.getBoundingClientRect();
    const dropY = e.clientY - calendarBodyRect.top;
    
    // Calculate which slot corresponds to this Y position
    // Each slot is 48px high, and slots start at 0
    const slotHeight = 48;
    const slotIndex = Math.max(0, Math.floor(dropY / slotHeight));
    
    // Ensure we don't go beyond available slots
    const actualSlotIndex = Math.min(slotIndex, timeSlots.length - 1);
    const targetSlot = timeSlots[actualSlotIndex];
    
    const slotMinutes = timeToMinutes(targetSlot);
    const slotHour = Math.floor(slotMinutes / 60);
    const slotMin = slotMinutes % 60;

    // Create new date with the dropped day and time
    const newDate = new Date(dayDate);
    newDate.setHours(slotHour, slotMin, 0, 0);

    // Save the previous state for undo
    let previousScheduledFor: Date;
    if (draggedBooking.scheduledFor instanceof Date) {
      previousScheduledFor = new Date(draggedBooking.scheduledFor);
    } else {
      previousScheduledFor = new Date(draggedBooking.scheduledFor as string);
    }

    // Check if the booking was dropped in the exact same spot
    const isSameTime = newDate.getTime() === previousScheduledFor.getTime();

    if (isSameTime) {
      // If dropped in the same spot, just clean up drag state and return
      setDraggedBooking(null);
      setDragOverCell(null);
      setHighlightedTimeSlot(null);
      setHighlightedDayDate(null);
      setHoveredDateTime(null);
      setIsUpdating(false);
      setTargetDateTime(null);
      return;
    }

    // Save target date/time for spinner message
    setTargetDateTime(newDate);
    setIsUpdating(true);
    setIsUndoing(false);
    try {
      // Update the booking with new scheduledFor
      await updateBooking(draggedBooking.id, {
        customerId: draggedBooking.customerId,
        jobId: draggedBooking.jobId,
        serviceId: draggedBooking.serviceId,
        technicianId: draggedBooking.technicianId,
        scheduledFor: newDate,
        status: draggedBooking.status,
        revenue: draggedBooking.revenue || 0,
        notes: draggedBooking.notes || "",
      });

      // Reload bookings first
      const allBookings = await getAllBookings();
      setBookings(allBookings);

      // Save state for undo AFTER the booking has been moved and reloaded
      setLastBookingState({
        bookingId: draggedBooking.id,
        previousScheduledFor,
      });

      // Auto-clear undo state after 15 seconds
      setTimeout(() => {
        setLastBookingState(null);
      }, 15000);

      // Don't call onBookingUpdate to avoid page reload that would reset the undo toast
    } catch (error) {
      console.error("Error updating booking:", error);
    } finally {
      setDraggedBooking(null);
      setIsUpdating(false);
      setTargetDateTime(null);
    }
  };

  const handleUndo = async (booking: Booking) => {
    if (!lastBookingState || lastBookingState.bookingId !== booking.id) return;

    // Save target date/time for spinner message (the previous position)
    setTargetDateTime(lastBookingState.previousScheduledFor);
    setIsUpdating(true);
    setIsUndoing(true);
    try {
      // Revert to previous scheduledFor
      await updateBooking(booking.id, {
        customerId: booking.customerId,
        jobId: booking.jobId,
        serviceId: booking.serviceId,
        technicianId: booking.technicianId,
        scheduledFor: lastBookingState.previousScheduledFor,
        status: booking.status,
        revenue: booking.revenue || 0,
        notes: booking.notes || "",
      });

      // Reload bookings
      const allBookings = await getAllBookings();
      setBookings(allBookings);
      // Don't call onBookingUpdate to avoid page reload that would reset the undo toast
    } catch (error) {
      console.error("Error reverting booking:", error);
    } finally {
      setLastBookingState(null);
      setIsUpdating(false);
      setIsUndoing(false);
      setTargetDateTime(null);
    }
  };

  // Group bookings by day
  const bookingsByDay = useMemo(() => {
    const grouped: Record<string, Booking[]> = {};
    weekDays.forEach((day) => {
      const dayBookings = getBookingsForDay(bookings, day.date);
      grouped[day.date.toDateString()] = dayBookings;
    });
    return grouped;
  }, [bookings, weekDays]);

  // Count bookings by status for each day
  const bookingsByStatusByDay = useMemo(() => {
    const counts: Record<string, Record<BookingStatus, number>> = {};
    weekDays.forEach((day) => {
      const dayBookings = bookingsByDay[day.date.toDateString()] || [];
      const statusCounts: Record<BookingStatus, number> = {
        PENDING: 0,
        SCHEDULED: 0,
        CANCELED: 0,
        COMPLETED: 0,
      };
      dayBookings.forEach((booking) => {
        if (statusCounts[booking.status] !== undefined) {
          statusCounts[booking.status]++;
        }
      });
      counts[day.date.toDateString()] = statusCounts;
    });
    return counts;
  }, [bookingsByDay, weekDays]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500 dark:text-gray-400">Loading calendar...</div>
      </div>
    );
  }

  // Count bookings for the week and by status
  const weekBookingsCount = weekDays.reduce((count, day) => {
    const dayBookings = bookingsByDay[day.date.toDateString()] || [];
    return count + dayBookings.length;
  }, 0);
  
  // Count bookings by status for the week
  const weekStatusCounts = weekDays.reduce((counts, day) => {
    const statusCounts = bookingsByStatusByDay[day.date.toDateString()] || {
      PENDING: 0,
      SCHEDULED: 0,
      CANCELED: 0,
      COMPLETED: 0,
    };
    counts.PENDING += statusCounts.PENDING;
    counts.SCHEDULED += statusCounts.SCHEDULED;
    counts.CANCELED += statusCounts.CANCELED;
    counts.COMPLETED += statusCounts.COMPLETED;
    return counts;
  }, {
    PENDING: 0,
    SCHEDULED: 0,
    CANCELED: 0,
    COMPLETED: 0,
  });

  return (
    <div className="w-full relative">
      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-4">
        {/* Bookings summary on left */}
        <div className="flex-1 flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Bookings for the week:
          </span>
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            {weekBookingsCount}
          </span>
          {weekStatusCounts.SCHEDULED > 0 && (
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-200 text-blue-900 text-xs font-semibold" title={`${weekStatusCounts.SCHEDULED} scheduled`}>
              {weekStatusCounts.SCHEDULED}
            </span>
          )}
          {weekStatusCounts.PENDING > 0 && (
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-yellow-200 text-yellow-900 text-xs font-semibold" title={`${weekStatusCounts.PENDING} pending`}>
              {weekStatusCounts.PENDING}
            </span>
          )}
          {weekStatusCounts.CANCELED > 0 && (
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-200 text-red-900 text-xs font-semibold" title={`${weekStatusCounts.CANCELED} canceled`}>
              {weekStatusCounts.CANCELED}
            </span>
          )}
          {weekStatusCounts.COMPLETED > 0 && (
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-200 text-green-900 text-xs font-semibold" title={`${weekStatusCounts.COMPLETED} completed`}>
              {weekStatusCounts.COMPLETED}
            </span>
          )}
        </div>
        
        {/* Week Navigation with Previous/Next buttons around week range - Centered */}
        <div className="flex items-center gap-3">
          <button
            onClick={goToPreviousWeek}
            className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition text-gray-700 dark:text-gray-300"
            aria-label="Previous week"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[200px] text-center">
            {weekRange.start} - {weekRange.end}
          </span>
          
          <button
            onClick={goToNextWeek}
            className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition text-gray-700 dark:text-gray-300"
            aria-label="Next week"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* Date Picker and Today button - Right side */}
        <div className="flex-1 flex items-center justify-end gap-3">
          {/* Date Picker for Week Selection */}
          <div className="flex items-center gap-2">
            <label htmlFor="week-selector" className="text-xs text-gray-600 dark:text-gray-400">
              Go to:
            </label>
            <input
              id="week-selector"
              type="date"
              value={weekRange.mondayDate.toISOString().split('T')[0]}
              onChange={handleDateChange}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <button
            onClick={goToCurrentWeek}
            className="text-xs px-3 py-1 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"
          >
            Current week
          </button>
        </div>
      </div>

      {/* Scrollable Calendar Container */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Calendar Grid */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {/* Header Row */}
          <div className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr] bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <div className="p-2 font-semibold text-gray-700 dark:text-gray-200 border-r border-gray-200 dark:border-gray-600 text-sm">
              Time
            </div>
            {weekDays.map((day) => {
              const statusCounts = bookingsByStatusByDay[day.date.toDateString()] || {
                PENDING: 0,
                SCHEDULED: 0,
                CANCELED: 0,
                COMPLETED: 0,
              };
              
              const isHighlighted = highlightedDayDate && day.date.toDateString() === highlightedDayDate.toDateString() && (draggedBooking || hoveredCell?.includes(day.date.toDateString()));
              
              return (
                <div
                  key={day.name}
                  className={`p-2 font-semibold border-r border-gray-200 dark:border-gray-600 last:border-r-0 text-center transition-colors ${
                    isHighlighted
                      ? "bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
                      : "text-gray-700 dark:text-gray-200"
                  }`}
                >
                  {/* Day name and badges on same line */}
                  <div className="flex items-center justify-center gap-2">
                    <span>{day.name}</span>
                    {/* Status badges - Immediately after day name */}
                    <div className="flex items-center gap-1">
                      {statusCounts.SCHEDULED > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-200 text-blue-900 text-xs font-semibold" title={`${statusCounts.SCHEDULED} scheduled`}>
                          {statusCounts.SCHEDULED}
                        </span>
                      )}
                      {statusCounts.PENDING > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-yellow-200 text-yellow-900 text-xs font-semibold" title={`${statusCounts.PENDING} pending`}>
                          {statusCounts.PENDING}
                        </span>
                      )}
                      {statusCounts.CANCELED > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-200 text-red-900 text-xs font-semibold" title={`${statusCounts.CANCELED} canceled`}>
                          {statusCounts.CANCELED}
                        </span>
                      )}
                      {statusCounts.COMPLETED > 0 && (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-200 text-green-900 text-xs font-semibold" title={`${statusCounts.COMPLETED} completed`}>
                          {statusCounts.COMPLETED}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Date below */}
                  <div className="text-xs font-normal text-gray-500 dark:text-gray-300 mt-0.5">
                    {day.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Calendar Body - Using absolute positioning for bookings */}
          <div 
            ref={calendarBodyRef}
            className="relative"
            style={{ height: `${timeSlots.length * 48}px` }}
          >
            {/* Time Slots Rows - Grid structure */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700" style={{ height: `${timeSlots.length * 48}px` }}>
              {timeSlots.map((slot) => {
                return (
                  <div
                    key={slot}
                    className="grid grid-cols-[80px_1fr_1fr_1fr_1fr_1fr] h-[48px] transition-colors"
                  >
                    {/* Time Column - Sticky when scrolling */}
                    <div className={`p-2 text-sm border-r border-gray-200 dark:border-gray-700 flex items-center transition-colors ${
                      highlightedTimeSlot === slot && (draggedBooking || hoveredCell?.includes(slot))
                        ? "bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 font-semibold"
                        : "text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800"
                    }`}>
                      {slot}
                    </div>

                    {/* Day Columns - Empty cells for grid structure, positioned relative for bookings */}
                    {weekDays.map((day) => {
                      const cellKey = `${day.date.toDateString()}-${slot}`;
                      const isHovered = hoveredCell === cellKey;
                      const slotMinutes = timeToMinutes(slot);
                      const slotHour = Math.floor(slotMinutes / 60);
                      const slotMin = slotMinutes % 60;
                      
                      // Create date for this slot
                      const slotDate = new Date(day.date);
                      slotDate.setHours(slotHour, slotMin, 0, 0);
                      
                      const handleAddClick = (e: React.MouseEvent) => {
                        e.stopPropagation();
                        onAddBooking?.(slotDate, slot);
                      };
                      
                      const isDragOver = dragOverCell === cellKey;
                      
                      return (
                        <div
                          key={`${day.name}-${slot}`}
                          className={`border-r border-gray-200 dark:border-gray-700 last:border-r-0 relative group transition-colors ${
                            isDragOver 
                              ? "bg-blue-100 dark:bg-blue-900/30" 
                              : isHovered 
                                ? "bg-gray-50 dark:bg-gray-700" 
                                : ""
                          }`}
                          style={{ height: '48px' }}
                          onMouseEnter={() => {
                            setHoveredCell(cellKey);
                            setHighlightedTimeSlot(slot);
                            setHighlightedDayDate(day.date);
                          }}
                          onMouseLeave={() => {
                            setHoveredCell(null);
                            if (!draggedBooking) {
                              setHighlightedTimeSlot(null);
                              setHighlightedDayDate(null);
                            }
                          }}
                          onDragOver={(e) => handleDragOver(e, day.date, slot)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, day.date)}
                        >
                          {isHovered && onAddBooking && !draggedBooking && (
                            <button
                              onClick={handleAddClick}
                              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity bg-white dark:bg-gray-700 rounded-full p-1.5 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 z-20"
                              title={`Add booking at ${slot}`}
                            >
                              <PlusIcon className="h-4 w-4 text-gray-500 dark:text-gray-300" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Bookings Overlay - Positioned absolutely over the grid */}
            {weekDays.map((day, dayIndex) => {
              const dayBookings = bookingsByDay[day.date.toDateString()] || [];
              const firstSlotMinutes = timeToMinutes(timeSlots[0]);
              const slotHeight = 48; // Height of each 15-minute slot in pixels (increased from 35px)
              const totalHeight = timeSlots.length * slotHeight;

              // Get unique bookings (avoid duplicates by ID)
              const uniqueBookings = Array.from(
                new Map(dayBookings.map(b => [b.id, b])).values()
              );

              return (
                <div
                  key={day.name}
                  className="absolute top-0 pointer-events-none"
                  style={{
                    // Time column is 80px, then each day column is (100% - 80px) / 5
                    left: `calc(80px + ${dayIndex} * (100% - 80px) / 5)`,
                    width: `calc((100% - 80px) / 5)`,
                    height: `${totalHeight}px`,
                  }}
                >
                  {uniqueBookings.map((booking) => {
                    // Handle date conversion - ensure we get local time, not UTC
                    let bookingDate: Date;
                    if (booking.scheduledFor instanceof Date) {
                      bookingDate = booking.scheduledFor;
                    } else {
                      bookingDate = new Date(booking.scheduledFor as string);
                    }
                    
                    // Get exact time in minutes since midnight (using local time)
                    // Use getHours() and getMinutes() which return local time
                    const bookingStartMinutes = bookingDate.getHours() * 60 + bookingDate.getMinutes();
                    
                    // Only show bookings within the visible time range
                    const lastSlotMinutes = timeToMinutes(timeSlots[timeSlots.length - 1]) + 15;
                    if (bookingStartMinutes < firstSlotMinutes || bookingStartMinutes >= lastSlotMinutes) {
                      return null;
                    }

                    // Calculate position using the exact booking time and slotHeight (30px for 15-minute intervals)
                    // The position is calculated based on the exact minutes difference from the first slot
                    // Each 15-minute interval = 1 slot = 30px height
                    const minutesFromFirstSlot = bookingStartMinutes - firstSlotMinutes;
                    
                    // Ensure we have a valid position (non-negative)
                    if (minutesFromFirstSlot < 0) {
                      return null;
                    }
                    
                    // Calculate top position: each 15 minutes = 48px
                    // The top position should align with the slot that contains this booking's start time
                    const top = (minutesFromFirstSlot / 15) * slotHeight;
                    
                    // Calculate height based on duration
                    const durationMinutes = calculateBookingDuration(booking);
                    const height = Math.max((durationMinutes / 15) * slotHeight, 55); // Minimum 55px height
                    
                    const serviceName = booking.service?.displayName || "Service";
                    const technicianName = booking.technician?.technicianName || "Unassigned";
                    const customerName = booking.customer?.name || "Unknown";
                    
                    // Format time for display (e.g., "9:30 AM")
                    const displayTime = bookingDate.toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    });

                    return (
                      <div
                        key={booking.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, booking)}
                        onDragEnd={handleDragEnd}
                        onClick={() => onBookingClick?.(booking)}
                        className={`${getBookingColor(booking)} rounded p-2 text-xs cursor-move hover:opacity-80 transition-opacity pointer-events-auto relative ${draggedBooking?.id === booking.id ? "opacity-50" : ""}`}
                        style={{
                          position: 'absolute',
                          top: `${top}px`,
                          left: '4px',
                          right: '4px',
                          height: `${Math.max(height, 55)}px`,
                          minHeight: '55px',
                          zIndex: 10,
                        }}
                        title={`${serviceName} - Customer: ${customerName} - Technician: ${technicianName} - ${displayTime} (${durationMinutes} min). Drag to move.`}
                      >
                        {/* Status badge and revenue in top right corner */}
                        <div className="absolute top-1 right-1 flex flex-col items-end gap-0.5">
                          <div className={`px-1.5 py-0.5 rounded text-xs font-semibold ${getStatusBadgeColor(booking.status)}`}>
                            {booking.status}
                          </div>
                          {booking.revenue > 0 && (
                            <div className="text-xs font-medium opacity-75">
                              ${booking.revenue.toFixed(2)}
                            </div>
                          )}
                        </div>
                        <div className="font-semibold truncate pr-12">{displayTime}</div>
                        <div className="font-semibold truncate mb-1">{serviceName}</div>
                        <div className="flex items-center gap-1.5 text-xs opacity-90 truncate mb-0.5">
                          {booking.customer?.image?.url ? (
                            <Image
                              src={booking.customer.image.url}
                              alt={customerName}
                              width={16}
                              height={16}
                              className="rounded-full object-cover flex-shrink-0"
                              unoptimized
                            />
                          ) : (
                            <UserCircleIcon className="h-4 w-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                          )}
                          <span>{customerName} (customer)</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs opacity-75 truncate">
                          {booking.technician?.image?.url ? (
                            <Image
                              src={booking.technician.image.url}
                              alt={technicianName}
                              width={16}
                              height={16}
                              className="rounded-full object-cover flex-shrink-0"
                              unoptimized
                            />
                          ) : (
                            <UserCircleIcon className="h-4 w-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                          )}
                          <span>{technicianName} (technician)</span>
                        </div>
                        {/* Undo button in bottom right corner if this booking was just moved */}
                        {lastBookingState && lastBookingState.bookingId === booking.id && (
                          <div className="absolute bottom-1 right-1 z-20">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUndo(booking);
                              }}
                              className="bg-gray-700 dark:bg-gray-600 text-white text-xs font-semibold px-2 py-1 rounded shadow-md hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                              title="Undo move"
                            >
                              Undo
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
          </div>
        </div>
      </div>
      {isUpdating && (
        <SpinnerOverlay 
          message={
            isUndoing && targetDateTime
              ? `Returning booking to ${targetDateTime.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })} at ${targetDateTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`
              : targetDateTime
              ? `Moving booking to ${targetDateTime.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })} at ${targetDateTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}`
              : isUndoing
              ? "Undoing movement of booking..."
              : "Moving booking..."
          } 
        />
      )}
      {/* Date/Time tooltip during drag */}
      {draggedBooking && hoveredDateTime && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gray-900 dark:bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg border border-gray-700">
          <div className="text-sm font-semibold">
            {hoveredDateTime.date.toLocaleDateString("en-US", { 
              weekday: "long", 
              month: "long", 
              day: "numeric", 
              year: "numeric" 
            })}
          </div>
          <div className="text-xs text-gray-300 mt-1">
            {hoveredDateTime.time}
          </div>
        </div>
      )}
    </div>
  );
}

