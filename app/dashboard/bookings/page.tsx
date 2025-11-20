"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "../components/DashboardLayout";
import { BookingsListView } from "./components/BookingsListView";
import { BookingsForm } from "./components/BookingsForm";
import { BookingsFormDataProvider, useBookingsFormData } from "./contexts/BookingsFormDataContext";

function BookingsPageContent() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking] = useState(undefined);
  const formData = useBookingsFormData();

  const openModal = useCallback(() => setShowModal(true), []);
  const closeModal = useCallback(() => setShowModal(false), []);

  useEffect(() => {
    // Prefetch dropdown data so the modal opens instantly
    formData?.load?.();
  }, [formData]);

  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold dark:text-white">Bookings</h1>
          <button
            onClick={openModal}
            className="bg-blue-600 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded font-semibold shadow hover:bg-blue-700 dark:hover:bg-gray-200 transition flex items-center gap-2"
          >
            Add Booking
          </button>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-gray-700/50 p-6">
          <BookingsListView 
            showHeader={false}
            canEdit={isAdmin} 
            canDelete={isAdmin}
            limit={10}
          />
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
                onSaved={() => {
                  closeModal();
                  window.location.reload();
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