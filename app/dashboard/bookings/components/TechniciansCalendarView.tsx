"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { Booking } from "@/lib/types/booking";
import { TechnicianToSkills } from "@/lib/types/technicianToSkills";
import { getAllBookings } from "../actions";
import { getAllTechnicians } from "@/app/dashboard/technicians/actions";
import { PlusIcon, UserCircleIcon } from "@heroicons/react/24/outline";

interface TechniciansCalendarViewProps {
  onBookingClick?: (booking: Booking) => void;
  onAddBooking?: (date: Date, timeSlot: string, technicianId: string) => void;
}

// Generate time slots from 7:30 AM to 7:30 PM in 15-minute intervals
function generateTimeSlots(): string[] {
  const slots: string[] = [];
  let hour = 7;
  let minute = 30;

  // Continue until 7:30 PM (19:30)
  while (hour < 19 || (hour === 19 && minute <= 30)) {
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

  const timeSlots = useMemo(() => generateTimeSlots(), []);

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

  // Get bookings for selected day
  const dayBookings = useMemo(() => {
    return getBookingsForDay(bookings, selectedDate);
  }, [bookings, selectedDate]);

  // Get technicians that have bookings on the selected day
  const techniciansWithBookings = useMemo(() => {
    const technicianIds = new Set(
      dayBookings
        .map(booking => booking.technicianId)
        .filter(id => id)
    );
    
    return technicians
      .filter(tech => technicianIds.has(tech.id))
      .sort((a, b) => a.technicianName.localeCompare(b.technicianName));
  }, [dayBookings, technicians]);

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

  const firstSlotMinutes = timeToMinutes(timeSlots[0]);
  const slotHeight = 48; // Height of each 15-minute slot in pixels (increased from 35px)
  const totalHeight = timeSlots.length * slotHeight;

  return (
    <div className="w-full">
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
      <div className="w-full overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Calendar Grid */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            {/* Header Row */}
            <div className={`grid bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600`} style={{ gridTemplateColumns: `80px repeat(${techniciansWithBookings.length}, 1fr)` }}>
              <div className="p-2 font-semibold text-gray-700 dark:text-gray-200 border-r border-gray-200 dark:border-gray-600 text-sm">
                Time
              </div>
              {techniciansWithBookings.map((technician) => {
                const statusCounts = bookingsByStatusByTechnician[technician.id] || {
                  PENDING: 0,
                  SCHEDULED: 0,
                  CANCELED: 0,
                  COMPLETED: 0,
                };
                
                return (
                  <div
                    key={technician.id}
                    className="p-2 font-semibold text-gray-700 dark:text-gray-200 text-center border-r border-gray-200 dark:border-gray-600 last:border-r-0"
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
              className="relative"
              style={{ height: `${totalHeight}px` }}
            >
              {/* Time Slots Rows - Grid structure */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700" style={{ height: `${totalHeight}px` }}>
                {timeSlots.map((slot) => {
                  return (
                    <div
                      key={slot}
                      className={`grid h-[48px] hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
                      style={{ gridTemplateColumns: `80px repeat(${techniciansWithBookings.length}, 1fr)` }}
                    >
                      {/* Time Column */}
                      <div className="p-2 text-sm text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 flex items-center bg-white dark:bg-gray-800">
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
                        
                        return (
                          <div
                            key={`${technician.id}-${slot}`}
                            className="border-r border-gray-200 dark:border-gray-700 last:border-r-0 relative group"
                            style={{ height: '48px' }}
                            onMouseEnter={() => setHoveredCell(cellKey)}
                            onMouseLeave={() => setHoveredCell(null)}
                          >
                            {isHovered && onAddBooking && (
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
                      // Time column is 80px, then each tech column is (100% - 80px) / numTechnicians
                      left: `calc(80px + ${techIndex} * (100% - 80px) / ${techniciansWithBookings.length})`,
                      width: `calc((100% - 80px) / ${techniciansWithBookings.length})`,
                      height: `${totalHeight}px`,
                    }}
                  >
                    {techBookings.map((booking) => {
                      let bookingDate: Date;
                      if (booking.scheduledFor instanceof Date) {
                        bookingDate = booking.scheduledFor;
                      } else {
                        bookingDate = new Date(booking.scheduledFor as string);
                      }
                      
                      const bookingStartMinutes = bookingDate.getHours() * 60 + bookingDate.getMinutes();
                      
                      // Only show bookings within the visible time range
                      const lastSlotMinutes = timeToMinutes(timeSlots[timeSlots.length - 1]) + 15;
                      if (bookingStartMinutes < firstSlotMinutes || bookingStartMinutes >= lastSlotMinutes) {
                        return null;
                      }

                      const minutesFromFirstSlot = bookingStartMinutes - firstSlotMinutes;
                      
                      if (minutesFromFirstSlot < 0) {
                        return null;
                      }
                      
                      const top = (minutesFromFirstSlot / 15) * slotHeight;
                      const durationMinutes = calculateBookingDuration(booking);
                      const height = Math.max((durationMinutes / 15) * slotHeight, 55); // Minimum 55px height
                      
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
                          onClick={() => onBookingClick?.(booking)}
                          className={`${getBookingColor(booking)} rounded p-2 text-xs cursor-pointer hover:opacity-80 transition-opacity pointer-events-auto`}
                          style={{
                            position: 'absolute',
                            top: `${top}px`,
                            left: '4px',
                            right: '4px',
                            height: `${Math.max(height, 55)}px`,
                            minHeight: '55px',
                            zIndex: 10,
                          }}
                          title={`${serviceName} - Customer: ${customerName} - ${displayTime} (${durationMinutes} min)`}
                        >
                          <div className="font-semibold truncate">{displayTime}</div>
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
  );
}

