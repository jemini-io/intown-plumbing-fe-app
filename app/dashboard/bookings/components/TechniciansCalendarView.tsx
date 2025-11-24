"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import Image from "next/image";
import { Booking, BookingStatus } from "@/lib/types/booking";
import { TechnicianToSkills } from "@/lib/types/technicianToSkills";
import { getAllBookings, updateBooking } from "../actions";
import { getAllTechnicians } from "@/app/dashboard/technicians/actions";
import { PlusIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { SpinnerOverlay } from "@/app/dashboard/components/Spinner";

// CSS to hide scrollbars
const hideScrollbarStyle = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

interface TechniciansCalendarViewProps {
  onBookingClick?: (booking: Booking) => void;
  onAddBooking?: (date: Date, timeSlot: string, technicianId: string) => void;
  onBookingUpdate?: () => void;
}

// Generate time slots from 7:30 AM to 11:30 PM in 15-minute intervals
function generateTimeSlots(): { time: string; isNonWorkingHours: boolean }[] {
  const slots: { time: string; isNonWorkingHours: boolean }[] = [];
  
  // Working hours: 7:30 AM to 11:30 PM (every 5 minutes)
  let hour = 7;
  let minute = 30;
  
  while (hour < 23 || (hour === 23 && minute <= 30)) {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const timeStr = `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
    slots.push({ time: timeStr, isNonWorkingHours: false });

    minute += 5;
    if (minute >= 60) {
      minute = 0;
      hour++;
    }
  }

  // Non-working hours: 11:35 PM to 7:25 AM (every 5 minutes, opacado)
  hour = 23;
  minute = 35; // Start from 11:35 PM
  
  // Continue until we reach 7:30 AM (we'll stop before 7:30 since that's the start of working hours)
  while (true) {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const timeStr = `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
    slots.push({ time: timeStr, isNonWorkingHours: true });

    // Stop before 7:30 AM (which is the start of working hours)
    if (hour === 7 && minute >= 25) {
      break;
    }

    minute += 5;
    if (minute >= 60) {
      minute = 0;
      hour++;
      if (hour >= 24) {
        hour = 0; // Wrap to midnight
      }
    }
  }

  return slots;
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
function getBookingColor(booking: Booking): string {
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
    const bookingDate = booking.scheduledFor instanceof Date 
      ? booking.scheduledFor 
      : new Date(booking.scheduledFor as string);
    return bookingDate.toDateString() === dayStr;
  });
}

// Calculate booking duration in minutes
function calculateBookingDuration(booking: Booking): number {
  const serviceName = booking.service?.displayName?.toLowerCase() || "";
  
  if (serviceName.includes("emergency")) {
    return 30;
  }
  if (serviceName.includes("quote")) {
    return 35;
  }
  if (serviceName.includes("diy")) {
    return 90;
  }

  return 30; // Default 30 minutes
}

export function TechniciansCalendarView({ onBookingClick, onAddBooking }: TechniciansCalendarViewProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [technicians, setTechnicians] = useState<TechnicianToSkills[]>([]);
  const [loading, setLoading] = useState(true);
  const [dayOffset, setDayOffset] = useState(0); // 0 = today, 1 = tomorrow, -1 = yesterday
  const [hoveredCell, setHoveredCell] = useState<string | null>(null); // Track which cell is hovered (format: "technicianId-slot")
  const [draggedBooking, setDraggedBooking] = useState<Booking | null>(null);
  const [dragOverCell, setDragOverCell] = useState<string | null>(null);
  const [lastBookingState, setLastBookingState] = useState<{ bookingId: string; previousScheduledFor: Date; previousTechnicianId: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);
  const calendarBodyRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const [showTopScroll, setShowTopScroll] = useState(false);
  const [showBottomScroll, setShowBottomScroll] = useState(false);
  const [autoScrollInterval, setAutoScrollInterval] = useState<NodeJS.Timeout | null>(null);
  const [autoScrollVerticalInterval, setAutoScrollVerticalInterval] = useState<NodeJS.Timeout | null>(null);
  const [highlightedTimeSlot, setHighlightedTimeSlot] = useState<string | null>(null);
  const [highlightedTechnicianId, setHighlightedTechnicianId] = useState<string | null>(null);
  const [hoveredDateTime, setHoveredDateTime] = useState<{ date: Date; time: string; technicianId?: string; technicianName?: string } | null>(null);
  const [targetDateTime, setTargetDateTime] = useState<Date | null>(null);
  const [targetTechnicianId, setTargetTechnicianId] = useState<string | null>(null);

  const timeSlots = useMemo(() => generateTimeSlots(), []);

  // Cleanup auto-scroll on unmount
  useEffect(() => {
    return () => {
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
      }
      if (autoScrollVerticalInterval) {
        clearInterval(autoScrollVerticalInterval);
      }
    };
  }, [autoScrollInterval, autoScrollVerticalInterval]);

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const handleScrollUp = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ top: -300, behavior: 'smooth' });
    }
  };

  const handleScrollDown = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ top: 300, behavior: 'smooth' });
    }
  };

  // Get current day with offset
  const selectedDate = useMemo(() => {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + dayOffset);
    targetDate.setHours(0, 0, 0, 0);
    return targetDate;
  }, [dayOffset]);

  const goToPreviousDay = () => setDayOffset(prev => prev - 1);
  const goToNextDay = () => setDayOffset(prev => prev + 1);
  const goToToday = () => setDayOffset(0);

  // Navigate to a specific date
  const goToDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    setDayOffset(diffDays);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(e.target.value);
    if (!isNaN(selectedDate.getTime())) {
      goToDate(selectedDate);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [allBookings, allTechnicians] = await Promise.all([
          getAllBookings(),
          getAllTechnicians(),
        ]);
        setBookings(allBookings);
        setTechnicians(allTechnicians);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Handle booking drag and drop
  const handleDragStart = (e: React.DragEvent, booking: Booking) => {
    setDraggedBooking(booking);
    setHighlightedTimeSlot(null);
    setHighlightedTechnicianId(null);
    setHoveredDateTime(null);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", booking.id);
  };

  const handleDragEnd = () => {
    // Clean up drag state if drop didn't happen (e.g., dropped outside valid area)
    // Only clean up if we're not currently updating (which means drop was successful)
    if (!isUpdating) {
      setDraggedBooking(null);
      setDragOverCell(null);
      setHighlightedTimeSlot(null);
      setHighlightedTechnicianId(null);
      setHoveredDateTime(null);
    }
  };

  const handleDragOver = (e: React.DragEvent, technicianId: string, slot: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const cellKey = `${technicianId}-${slot}`;
    setDragOverCell(cellKey);
    
    // Auto-scroll logic
    if (scrollContainerRef.current && draggedBooking) {
      const scrollContainer = scrollContainerRef.current;
      const containerRect = scrollContainer.getBoundingClientRect();
      const scrollThreshold = 100; // Distance from edge to trigger scroll
      const scrollSpeed = 10; // Pixels to scroll per interval
      
      // Horizontal auto-scroll
      const mouseX = e.clientX;
      const distanceFromLeft = mouseX - containerRect.left;
      const distanceFromRight = containerRect.right - mouseX;
      
      // Clear existing interval
      if (autoScrollInterval) {
        clearInterval(autoScrollInterval);
        setAutoScrollInterval(null);
      }
      
      if (distanceFromLeft < scrollThreshold && scrollContainer.scrollLeft > 0) {
        // Scroll left
        const interval = setInterval(() => {
          if (scrollContainer.scrollLeft > 0) {
            scrollContainer.scrollLeft -= scrollSpeed;
          } else {
            clearInterval(interval);
            setAutoScrollInterval(null);
          }
        }, 16); // ~60fps
        setAutoScrollInterval(interval);
      } else if (distanceFromRight < scrollThreshold && scrollContainer.scrollLeft < scrollContainer.scrollWidth - scrollContainer.clientWidth) {
        // Scroll right
        const interval = setInterval(() => {
          if (scrollContainer.scrollLeft < scrollContainer.scrollWidth - scrollContainer.clientWidth) {
            scrollContainer.scrollLeft += scrollSpeed;
          } else {
            clearInterval(interval);
            setAutoScrollInterval(null);
          }
        }, 16);
        setAutoScrollInterval(interval);
      }
      
      // Vertical auto-scroll - now using scrollContainerRef since both scrolls are in the same container
      if (scrollContainerRef.current) {
        const scrollContainer = scrollContainerRef.current;
        const containerRect = scrollContainer.getBoundingClientRect();
        const mouseY = e.clientY;
        const distanceFromTop = mouseY - containerRect.top;
        const distanceFromBottom = containerRect.bottom - mouseY;
        
        // Check if mouse is in scroll zone
        const shouldScrollUp = distanceFromTop < scrollThreshold && scrollContainer.scrollTop > 0;
        const shouldScrollDown = distanceFromBottom < scrollThreshold && scrollContainer.scrollTop < scrollContainer.scrollHeight - scrollContainer.clientHeight;
        
        // Clear existing vertical scroll interval if mouse is no longer in scroll zone
        if (autoScrollVerticalInterval && !shouldScrollUp && !shouldScrollDown) {
          clearInterval(autoScrollVerticalInterval);
          setAutoScrollVerticalInterval(null);
        }
        
        // Only start new interval if mouse is in scroll zone AND no interval is already running
        if (shouldScrollUp && !autoScrollVerticalInterval) {
          // Scroll up
          const interval = setInterval(() => {
            if (!scrollContainerRef.current || !draggedBooking) {
              clearInterval(interval);
              setAutoScrollVerticalInterval(null);
              return;
            }
            
            // Stop if reached top
            if (scrollContainerRef.current.scrollTop <= 0) {
              clearInterval(interval);
              setAutoScrollVerticalInterval(null);
              return;
            }
            
            scrollContainerRef.current.scrollTop -= scrollSpeed;
          }, 16);
          setAutoScrollVerticalInterval(interval);
        } else if (shouldScrollDown && !autoScrollVerticalInterval) {
          // Scroll down
          const interval = setInterval(() => {
            if (!scrollContainerRef.current || !draggedBooking) {
              clearInterval(interval);
              setAutoScrollVerticalInterval(null);
              return;
            }
            
            // Stop if reached bottom
            const scrollBottom = scrollContainerRef.current.scrollHeight - scrollContainerRef.current.scrollTop - scrollContainerRef.current.clientHeight;
            if (scrollBottom <= 1) {
              clearInterval(interval);
              setAutoScrollVerticalInterval(null);
              return;
            }
            
            scrollContainerRef.current.scrollTop += scrollSpeed;
          }, 16);
          setAutoScrollVerticalInterval(interval);
        }
      }
    }
    
    // Calculate which time slot is being hovered based on Y position
    if (scrollContainerRef.current && draggedBooking) {
      const scrollContainerRect = scrollContainerRef.current.getBoundingClientRect();
      // Calculate Y position relative to scroll container (header is outside, so no need to account for it)
      const dragY = e.clientY - scrollContainerRect.top + scrollContainerRef.current.scrollTop;
      const slotHeight = 64;
      const slotIndex = Math.max(0, Math.floor(dragY / slotHeight));
      const actualSlotIndex = Math.min(slotIndex, timeSlots.length - 1);
      const targetSlot = timeSlots[actualSlotIndex].time;
      setHighlightedTimeSlot(targetSlot);
      
      // Calculate the exact date and time for the hovered cell
      const slotMinutes = timeToMinutes(targetSlot);
      const slotHour = Math.floor(slotMinutes / 60);
      const slotMin = slotMinutes % 60;
      const hoverDate = new Date(selectedDate);
      hoverDate.setHours(slotHour, slotMin, 0, 0);
      
      // Get technician info
      const targetTechnician = technicians.find(t => t.id === technicianId);
      const technicianName = targetTechnician?.technicianName;
      
      setHighlightedTechnicianId(technicianId);
      setHoveredDateTime({
        date: hoverDate,
        time: targetSlot,
        technicianId: technicianId,
        technicianName: technicianName,
      });
    }
  };

  const handleDragLeave = () => {
    setDragOverCell(null);
    setHighlightedTimeSlot(null);
    setHighlightedTechnicianId(null);
    setHoveredDateTime(null);
    // Clear auto-scroll intervals
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
      setAutoScrollInterval(null);
    }
    if (autoScrollVerticalInterval) {
      clearInterval(autoScrollVerticalInterval);
      setAutoScrollVerticalInterval(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, technicianId: string) => {
    e.preventDefault();
    setDragOverCell(null);
    setHighlightedTimeSlot(null);
    setHighlightedTechnicianId(null);
    setHoveredDateTime(null);
    
    if (!draggedBooking || !scrollContainerRef.current) return;

    // Calculate the Y position relative to the scroll container (header is outside, so no need to account for it)
    const scrollContainerRect = scrollContainerRef.current.getBoundingClientRect();
    const dropY = e.clientY - scrollContainerRect.top + scrollContainerRef.current.scrollTop;
    
    // Calculate which slot corresponds to this Y position
    // Each slot is 64px high (5-minute intervals), and slots start at 0
    const slotHeight = 64;
    const slotIndex = Math.max(0, Math.floor(dropY / slotHeight));
    
    // Ensure we don't go beyond available slots
    const actualSlotIndex = Math.min(slotIndex, timeSlots.length - 1);
    const targetSlot = timeSlots[actualSlotIndex].time;
    
    const slotMinutes = timeToMinutes(targetSlot);
    const slotHour = Math.floor(slotMinutes / 60);
    const slotMin = slotMinutes % 60;

    // Create new date with the selected day and time
    const newDate = new Date(selectedDate);
    newDate.setHours(slotHour, slotMin, 0, 0);

    // Save the previous state for undo
    let previousScheduledFor: Date;
    if (draggedBooking.scheduledFor instanceof Date) {
      previousScheduledFor = new Date(draggedBooking.scheduledFor);
    } else {
      previousScheduledFor = new Date(draggedBooking.scheduledFor as string);
    }
    const previousTechnicianId = draggedBooking.technicianId || "";

    // Check if the booking is being dropped in the same place
    // Compare dates (ignoring milliseconds) and technician
    const newDateTime = newDate.getTime();
    const previousDateTime = previousScheduledFor.getTime();
    const timeDifference = Math.abs(newDateTime - previousDateTime);
    const sameTime = timeDifference < 60000; // Within 1 minute (allowing for rounding to nearest 5-minute slot)
    const sameTechnician = technicianId === previousTechnicianId;
    
    // If dropped in the same place, just clean up the state without updating
    if (sameTime && sameTechnician) {
      setDraggedBooking(null);
      setDragOverCell(null);
      setHighlightedTimeSlot(null);
      setHighlightedTechnicianId(null);
      setHoveredDateTime(null);
      setIsUpdating(false);
      setTargetDateTime(null);
      setTargetTechnicianId(null);
      return;
    }

    // Save target date/time and technician for spinner message
    setTargetDateTime(newDate);
    setTargetTechnicianId(technicianId);
    setIsUpdating(true);
    setIsUndoing(false);
    try {
      // Update the booking with new scheduledFor and technicianId
      await updateBooking(draggedBooking.id, {
        customerId: draggedBooking.customerId,
        jobId: draggedBooking.jobId,
        serviceId: draggedBooking.serviceId,
        technicianId: technicianId, // Update technician when dropped
        scheduledFor: newDate,
        status: draggedBooking.status,
        revenue: draggedBooking.revenue || 0,
        notes: draggedBooking.notes || "",
      });

      // Reload bookings and technicians first
      const [allBookings, allTechnicians] = await Promise.all([
        getAllBookings(),
        getAllTechnicians(),
      ]);
      setBookings(allBookings);
      setTechnicians(allTechnicians);

      // Save state for undo AFTER the booking has been moved and reloaded
      setLastBookingState({
        bookingId: draggedBooking.id,
        previousScheduledFor,
        previousTechnicianId,
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
    }
  };

  const handleUndo = async (booking: Booking) => {
    if (!lastBookingState || lastBookingState.bookingId !== booking.id) return;

    // Save target date/time and technician for spinner message (the previous position)
    setTargetDateTime(lastBookingState.previousScheduledFor);
    setTargetTechnicianId(lastBookingState.previousTechnicianId);
    setIsUpdating(true);
    setIsUndoing(true);
    try {
      // Revert to previous scheduledFor and technicianId
      await updateBooking(booking.id, {
        customerId: booking.customerId,
        jobId: booking.jobId,
        serviceId: booking.serviceId,
        technicianId: lastBookingState.previousTechnicianId,
        scheduledFor: lastBookingState.previousScheduledFor,
        status: booking.status,
        revenue: booking.revenue || 0,
        notes: booking.notes || "",
      });

      // Reload bookings and technicians
      const [allBookings, allTechnicians] = await Promise.all([
        getAllBookings(),
        getAllTechnicians(),
      ]);
      setBookings(allBookings);
      setTechnicians(allTechnicians);
      // Don't call onBookingUpdate to avoid page reload that would reset the undo toast
    } catch (error) {
      console.error("Error reverting booking:", error);
    } finally {
      setLastBookingState(null);
      setIsUpdating(false);
      setIsUndoing(false);
      setTargetDateTime(null);
      setTargetTechnicianId(null);
    }
  };

  // Get bookings for selected day
  const dayBookings = useMemo(() => {
    return getBookingsForDay(bookings, selectedDate);
  }, [bookings, selectedDate]);

  // Get all enabled technicians (not just those with bookings)
  const techniciansWithBookings = useMemo(() => {
    return technicians
      .filter(tech => tech.enabled)
      .sort((a, b) => a.technicianName.localeCompare(b.technicianName));
  }, [technicians]);

  // Check if scroll is needed and update button visibility
  useEffect(() => {
    const checkScroll = () => {
      // Check horizontal scroll
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const hasHorizontalScroll = container.scrollWidth > container.clientWidth;
        // Show left button if there's scrollable content and we're not at the start
        setShowLeftScroll(hasHorizontalScroll && container.scrollLeft > 0.5);
        // Show right button if there's scrollable content and we're not at the end
        const scrollRight = container.scrollWidth - container.scrollLeft - container.clientWidth;
        setShowRightScroll(hasHorizontalScroll && scrollRight > 0.5);
      }
      
      // Check vertical scroll - now using scrollContainerRef
      if (scrollContainerRef.current) {
        const scrollContainer = scrollContainerRef.current;
        const hasVerticalScroll = scrollContainer.scrollHeight > scrollContainer.clientHeight;
        const scrollBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop - scrollContainer.clientHeight;
        
        setShowTopScroll(hasVerticalScroll && scrollContainer.scrollTop > 0.5);
        setShowBottomScroll(hasVerticalScroll && scrollBottom > 0.5);
      }
    };

    // Initial check with a small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      checkScroll();
    }, 100);
    
    // Check periodically and on scroll/resize
    const interval = setInterval(checkScroll, 100);
    const scrollContainer = scrollContainerRef.current;
    
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', checkScroll);
    }
    window.addEventListener('resize', checkScroll);
    
    return () => {
      clearTimeout(timeoutId);
      clearInterval(interval);
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', checkScroll);
      }
      window.removeEventListener('resize', checkScroll);
    };
  }, [techniciansWithBookings.length, timeSlots.length]);

  // Group bookings by technician
  const bookingsByTechnician = useMemo(() => {
    const grouped: Record<string, Booking[]> = {};
    techniciansWithBookings.forEach(tech => {
      grouped[tech.id] = dayBookings.filter(booking => booking.technicianId === tech.id);
    });
    return grouped;
  }, [dayBookings, techniciansWithBookings]);

  // Count bookings by status for each technician
  const bookingsByStatusByTechnician = useMemo(() => {
    const counts: Record<string, Record<string, number>> = {};
    techniciansWithBookings.forEach(tech => {
      const techBookings = bookingsByTechnician[tech.id] || [];
      const statusCounts: Record<string, number> = {
        PENDING: 0,
        SCHEDULED: 0,
        CANCELED: 0,
        COMPLETED: 0,
      };
      techBookings.forEach((booking) => {
        if (statusCounts[booking.status] !== undefined) {
          statusCounts[booking.status]++;
        }
      });
      counts[tech.id] = statusCounts;
    });
    return counts;
  }, [bookingsByTechnician, techniciansWithBookings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500 dark:text-gray-400">Loading calendar...</div>
      </div>
    );
  }

  const firstSlotMinutes = timeToMinutes(timeSlots[0].time);
  const slotHeight = 64; // Height of each 5-minute slot in pixels
  const totalHeight = timeSlots.length * slotHeight;

  return (
    <>
      <style>{hideScrollbarStyle}</style>
      <div className="w-full relative">
      {/* Day Navigation */}
      <div className="flex items-center justify-between mb-4">
        {/* Empty space on left to center the navigation group */}
        <div className="flex-1"></div>
        
        {/* Day Navigation with Previous/Next buttons around day - Centered */}
        <div className="flex items-center gap-3">
          <button
            onClick={goToPreviousDay}
            className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition text-gray-700 dark:text-gray-300"
            aria-label="Previous day"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[200px] text-center">
            {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </span>
          
          <button
            onClick={goToNextDay}
            className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition text-gray-700 dark:text-gray-300"
            aria-label="Next day"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {/* Date Picker and Today button - Right side */}
        <div className="flex-1 flex items-center justify-end gap-3">
          {/* Date Picker for Day Selection */}
          <div className="flex items-center gap-2">
            <label htmlFor="day-selector" className="text-xs text-gray-600 dark:text-gray-400">
              Go to:
            </label>
            <input
              id="day-selector"
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={handleDateChange}
              className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <button
            onClick={goToToday}
            className="text-xs px-3 py-1 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"
          >
            Today
          </button>
        </div>
      </div>

      {/* Scrollable Calendar Container */}
      <div className="w-full relative border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {/* Scroll buttons - Outside scroll container but inside main container */}
        {showLeftScroll && (
          <button
            onClick={handleScrollLeft}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="Scroll left"
            style={{ top: 'calc(50px + 50%)' }}
          >
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {showRightScroll && (
          <button
            onClick={handleScrollRight}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="Scroll right"
            style={{ top: 'calc(50px + 50%)' }}
          >
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        {showTopScroll && (
          <button
            onClick={handleScrollUp}
            className="absolute left-1/2 -translate-x-1/2 z-30 w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="Scroll up"
            style={{ top: 'calc(50px + 10px)' }}
          >
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        )}
        {showBottomScroll && (
          <button
            onClick={handleScrollDown}
            className="absolute left-1/2 -translate-x-1/2 bottom-4 z-30 w-10 h-10 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-lg flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            aria-label="Scroll down"
          >
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}

        {/* Scrollable Container - Contains both header and body */}
        <div 
          ref={scrollContainerRef} 
          className="overflow-x-auto overflow-y-auto hide-scrollbar"
          style={{ maxHeight: 'calc(100vh - 300px)' }}
        >
          <div className="min-w-max relative">
            {/* Header Row - Sticky at top, moves horizontally with scroll */}
            <div 
              className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 sticky top-0 z-20"
              style={{ 
                display: 'grid',
                gridTemplateColumns: `80px repeat(${techniciansWithBookings.length}, minmax(250px, 1fr))`
              }}
            >
              <div 
                className="p-2 font-semibold text-gray-700 dark:text-gray-200 border-r border-gray-200 dark:border-gray-600 text-sm bg-gray-100 dark:bg-gray-700" 
                style={{ position: 'sticky', left: 0, top: 0, zIndex: 50 }}
              >
                Time
              </div>
              {techniciansWithBookings.map((technician) => {
                const statusCounts = bookingsByStatusByTechnician[technician.id] || {
                  PENDING: 0,
                  SCHEDULED: 0,
                  CANCELED: 0,
                  COMPLETED: 0,
                };
                
                const isHighlighted = highlightedTechnicianId === technician.id && (draggedBooking || hoveredCell);
                
                return (
                  <div
                    key={technician.id}
                    className={`p-2 font-semibold text-center border-r border-gray-200 dark:border-gray-600 last:border-r-0 transition-colors ${
                      isHighlighted
                        ? "bg-white dark:bg-gray-600/50 text-gray-900 dark:text-gray-100"
                        : "text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {/* Technician Image */}
                      {technician.image?.url ? (
                        <Image
                          src={technician.image.url}
                          alt={technician.technicianName}
                          width={24}
                          height={24}
                          className="rounded-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <UserCircleIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                      )}
                      <span>{technician.technicianName}</span>
                      {/* Status badges - Immediately after technician name */}
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
                  </div>
                );
              })}
            </div>

            {/* Calendar Body */}
            <div 
              ref={calendarBodyRef}
              className="relative"
              style={{ 
                height: `${totalHeight}px`,
                minWidth: 'max-content'
              }}
            >
                {/* Time Slots Rows - Grid structure */}
                <div className="divide-y divide-gray-200 dark:divide-gray-700" style={{ height: `${totalHeight}px` }}>
                {timeSlots.map((slotData, index) => {
                  const slot = slotData.time;
                  const isNonWorking = slotData.isNonWorkingHours;
                  return (
                    <div
                      key={`${slot}-${index}`}
                      className={`grid ${isNonWorking ? 'opacity-40' : ''}`}
                      style={{ 
                        height: `${slotHeight}px`,
                        gridTemplateColumns: `80px repeat(${techniciansWithBookings.length}, minmax(250px, 1fr))` 
                      }}
                    >
                      {/* Time Column */}
                      <div 
                        className={`p-1 text-xs border-r border-gray-200 dark:border-gray-700 flex items-center transition-colors h-full ${
                          highlightedTimeSlot === slot && (draggedBooking || hoveredCell)
                            ? "bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-gray-100 font-semibold"
                            : "text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800"
                        }`}
                        style={{ 
                          position: 'sticky', 
                          left: 0, 
                          zIndex: 10
                        }}
                      >
                        {slot}
                      </div>

                      {/* Technician Columns - Empty cells for grid structure */}
                      {techniciansWithBookings.map((technician) => {
                        const cellKey = `${technician.id}-${slot}`;
                        const isHovered = hoveredCell === cellKey;
                        const slotMinutes = timeToMinutes(slot);
                        const slotHour = Math.floor(slotMinutes / 60);
                        const slotMin = slotMinutes % 60;
                        
                        // Create date for this slot
                        const slotDate = new Date(selectedDate);
                        slotDate.setHours(slotHour, slotMin, 0, 0);
                        
                        const handleAddClick = (e: React.MouseEvent) => {
                          e.stopPropagation();
                          onAddBooking?.(slotDate, slot, technician.id);
                        };
                        
                        const isDragOver = dragOverCell === cellKey;
                        
                        return (
                          <div
                            key={`${technician.id}-${slot}`}
                            className={`border-r border-gray-200 dark:border-gray-700 last:border-r-0 relative group h-full transition-colors ${
                              isDragOver 
                                ? "bg-blue-100 dark:bg-blue-900/30" 
                                : isHovered 
                                  ? "bg-gray-50 dark:bg-gray-700" 
                                  : ""
                            }`}
                            onMouseEnter={() => {
                              setHoveredCell(cellKey);
                              setHighlightedTimeSlot(slot);
                              setHighlightedTechnicianId(technician.id);
                            }}
                            onMouseLeave={() => {
                              setHoveredCell(null);
                              setHighlightedTimeSlot(null);
                              setHighlightedTechnicianId(null);
                            }}
                            onDragOver={(e) => handleDragOver(e, technician.id, slot)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, technician.id)}
                          >
                            {isHovered && onAddBooking && !draggedBooking && !isNonWorking && (
                              <button
                                onClick={handleAddClick}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity bg-white dark:bg-gray-700 rounded-full p-1.5 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 z-20"
                                title={`Add booking for ${technician.technicianName} at ${slot}`}
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
              {techniciansWithBookings.map((technician, techIndex) => {
                const techBookings = bookingsByTechnician[technician.id] || [];

                return (
                  <div
                    key={technician.id}
                    className="absolute top-0 pointer-events-none"
                    style={{
                      // Time column is 80px (sticky), then each tech column is (100% - 80px) / numTechnicians
                      // Position relative to calendarBodyRef, accounting for the sticky Time column
                      // Use max() to ensure bookings never overlap the sticky Time column (80px)
                      left: `max(80px, calc(80px + ${techIndex} * (100% - 80px) / ${techniciansWithBookings.length}))`,
                      width: `calc((100% - 80px) / ${techniciansWithBookings.length})`,
                      height: `${totalHeight}px`,
                      zIndex: 5 // Below the sticky Time column (z-index 10)
                    }}
                  >
                    {techBookings.map((booking) => {
                      let bookingDate: Date;
                      if (booking.scheduledFor instanceof Date) {
                        bookingDate = new Date(booking.scheduledFor);
                      } else {
                        bookingDate = new Date(booking.scheduledFor as string);
                      }
                      
                      // Calculate minutes from midnight
                      const bookingHours = bookingDate.getHours();
                      const bookingMinutes = bookingDate.getMinutes();
                      const bookingStartMinutes = bookingHours * 60 + bookingMinutes;
                      
                      // Calculate booking duration
                      const durationMinutes = calculateBookingDuration(booking);
                      
                      // The visible range is from firstSlotMinutes (7:30 AM = 450) to the end of all slots
                      // Since we have working hours (7:30 AM to 11:30 PM) and non-working hours (11:35 PM to 7:25 AM),
                      // we need to check if the booking overlaps with any part of the visible range
                      const totalSlotsMinutes = timeSlots.length * 5; // Total minutes covered by all slots
                      const lastVisibleMinutes = firstSlotMinutes + totalSlotsMinutes; // End of visible range
                      
                      // Calculate booking end time
                      const bookingEndMinutes = bookingStartMinutes + durationMinutes;
                      
                      // A booking is visible if it overlaps with the visible range
                      // Overlap means: booking starts before range ends AND booking ends after range starts
                      if (bookingEndMinutes <= firstSlotMinutes || bookingStartMinutes >= lastVisibleMinutes) {
                        return null;
                      }

                      // Calculate position: clamp booking start to visible range
                      const visibleStartMinutes = Math.max(bookingStartMinutes, firstSlotMinutes);
                      const minutesFromFirstSlot = visibleStartMinutes - firstSlotMinutes;
                      
                      // Calculate visible duration: clamp booking end to visible range
                      const visibleEndMinutes = Math.min(bookingEndMinutes, lastVisibleMinutes);
                      const visibleDuration = visibleEndMinutes - visibleStartMinutes;
                      
                      // Ensure we have a valid position
                      if (minutesFromFirstSlot < 0 || visibleDuration <= 0) {
                        return null;
                      }
                      
                      // Calculate position: each 5-minute interval = 1 slot, each slot is slotHeight pixels
                      const top = (minutesFromFirstSlot / 5) * slotHeight;
                      const height = Math.max((visibleDuration / 5) * slotHeight, 55); // Minimum 55px height
                      
                      const serviceName = booking.service?.displayName || "Service";
                      const customerName = booking.customer?.name || "Unknown";
                      
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
                          title={`${serviceName} - Customer: ${customerName} - ${displayTime} (${durationMinutes} min). Drag to move.`}
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
                          <div className="flex items-center gap-1.5 text-xs opacity-90 truncate">
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
        </div>
      {isUpdating && (
        <SpinnerOverlay 
          message={
            isUndoing && targetDateTime
              ? (() => {
                  const timeStr = targetDateTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
                  const targetTech = technicians.find(t => t.id === targetTechnicianId);
                  return targetTech
                    ? `Returning booking to ${timeStr} with technician ${targetTech.technicianName}`
                    : `Returning booking to ${timeStr}`;
                })()
              : targetDateTime
              ? (() => {
                  const timeStr = targetDateTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
                  const targetTech = technicians.find(t => t.id === targetTechnicianId);
                  return targetTech
                    ? `Moving booking to ${timeStr} with technician ${targetTech.technicianName}`
                    : `Moving booking to ${timeStr}`;
                })()
              : isUndoing
              ? "Undoing movement of booking..."
              : "Moving booking..."
          } 
        />
      )}
      {/* Time/Technician tooltip during drag */}
      {draggedBooking && hoveredDateTime && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gray-900 dark:bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg border border-gray-700">
          <div className="text-sm font-semibold">
            {hoveredDateTime.time}
          </div>
          {hoveredDateTime.technicianName && (
            <div className="text-xs text-gray-300 mt-1">
              Technician {hoveredDateTime.technicianName}
            </div>
          )}
        </div>
      )}
    </>
  );
}

