"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "../components/DashboardLayout";
import { BookingsListView } from "./components/BookingsListView";
import { BookingsForm } from "./components/BookingsForm";

export default function BookingsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking] = useState(undefined);

  const openModal = useCallback(() => setShowModal(true), []);
  const closeModal = useCallback(() => setShowModal(false), []);

  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Bookings</h1>
          <button
            onClick={openModal}
            className="bg-blue-600 text-white px-4 py-2 rounded font-semibold shadow hover:bg-blue-700 transition flex items-center gap-2"
          >
            Add Booking
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <BookingsListView 
            showHeader={false}
            canEdit={isAdmin} 
            canDelete={isAdmin}
            limit={10}
          />
        </div>
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 w-[700px] overflow-auto relative" style={{ minWidth: 400, maxHeight: "90vh" }}>
              <button
                onClick={closeModal}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
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