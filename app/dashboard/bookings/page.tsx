"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "../components/DashboardLayout";
import { BookingsListView } from "./components/BookingsListView";
import { BookingsCalendarView } from "./components/BookingsCalendarView";
import { TechniciansCalendarView } from "./components/TechniciansCalendarView";
import { BookingsForm } from "./components/BookingsForm";
import { BookingsFormDataProvider, useBookingsFormData } from "./contexts/BookingsFormDataContext";
import { Booking } from "@/lib/types/booking";
import Link from "next/link";

type ViewType = "technicians" | "calendar" | "table";

function BookingsPageContent() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | undefined>(undefined);
  const [initialScheduledFor, setInitialScheduledFor] = useState<Date | undefined>(undefined);
  const [initialTechnicianId, setInitialTechnicianId] = useState<string | undefined>(undefined);
  const [activeView, setActiveView] = useState<ViewType>("calendar");
  const formData = useBookingsFormData();

  const closeModal = useCallback(() => {
    setShowModal(false);
    setSelectedBooking(undefined);
    setInitialScheduledFor(undefined);
    setInitialTechnicianId(undefined);
  }, []);

  useEffect(() => {
    // Prefetch dropdown data so the modal opens instantly
    formData?.load?.();
  }, [formData]);

  const handleBookingClick = useCallback((booking: Booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  }, []);

  const handleAddBooking = useCallback((date: Date, timeSlot: string, technicianId?: string) => {
    // Set the initial date/time and technician without creating a booking object
    setSelectedBooking(undefined);
    setInitialScheduledFor(date);
    setInitialTechnicianId(technicianId);
    setShowModal(true);
  }, []);

  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const handleBookingUpdate = useCallback(() => {
    // Trigger a refresh of the calendar views by updating the refresh trigger
    // This will cause the useEffect hooks in the calendar components to re-run
    // without losing the current view state (weekOffset, dayOffset, etc.)
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold dark:text-white">Schedule</h1>
            <Link
              href="/dashboard/bookings"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              SHOW ALL
            </Link>
          </div>
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView("technicians")}
              className={`px-4 py-2 rounded-md font-medium transition ${
                activeView === "technicians"
                  ? "bg-gray-800 dark:bg-gray-700 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              Technicians
            </button>
            <button
              onClick={() => setActiveView("calendar")}
              className={`px-4 py-2 rounded-md font-medium transition ${
                activeView === "calendar"
                  ? "bg-gray-800 dark:bg-gray-700 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              Calendar
            </button>
            <button
              onClick={() => setActiveView("table")}
              className={`px-4 py-2 rounded-md font-medium transition ${
                activeView === "table"
                  ? "bg-gray-800 dark:bg-gray-700 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              Table
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/50 p-6">
          {activeView === "calendar" && (
            <BookingsCalendarView 
              refreshTrigger={refreshTrigger}
              onBookingClick={handleBookingClick}
              onAddBooking={handleAddBooking}
              onBookingUpdate={handleBookingUpdate}
            />
          )}
          {activeView === "table" && (
            <BookingsListView 
              showHeader={false}
              canEdit={isAdmin} 
              canDelete={isAdmin}
              limit={undefined}
            />
          )}
          {activeView === "technicians" && (
            <TechniciansCalendarView 
              refreshTrigger={refreshTrigger}
              onBookingClick={handleBookingClick}
              onAddBooking={handleAddBooking}
              onBookingUpdate={handleBookingUpdate}
            />
          )}
        </div>
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 w-[700px] overflow-auto relative" style={{ minWidth: 400, maxHeight: "90vh" }}>
              <button
                onClick={closeModal}
                className="absolute top-2 right-2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl font-bold"
              >
                ×
              </button>
              <BookingsForm
                existing={selectedBooking}
                initialScheduledFor={initialScheduledFor}
                initialTechnicianId={initialTechnicianId}
                onSaved={() => {
                  closeModal();
                  // Trigger refresh of calendar views without reloading the page
                  // This preserves the current view and date selection
                  handleBookingUpdate();
                }}
              />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function BookingsPage() {
  return (
    <BookingsFormDataProvider>
      <BookingsPageContent />
    </BookingsFormDataProvider>
  );
}