import React, { useEffect, useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Booking } from "@/lib/types/booking";
import { getAllBookings, deleteBooking } from "../actions";
import { BookingsForm } from "./BookingsForm";
import { DeleteConfirmModal } from "@/app/components/DeleteConfirmModal";

export function BookingsListView() {
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function refresh() {
    const bookings = await getAllBookings();
    setBookings(bookings);
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleAdd() {
    setSelectedBooking(null);
    setModalOpen(true);
  }

  function handleEdit(booking: Booking) {
    setSelectedBooking(booking);
    setModalOpen(true);
  }

  function handleDeleteBooking(booking: Booking) {
    setBookingToDelete(booking);
    setConfirmOpen(true);
  }

  const confirmDelete = () => {
    if (bookingToDelete) {
      setDeleting(true);
      deleteBooking(String(bookingToDelete.id)).then(() => {
        setDeleting(false);
        refresh();
        setConfirmOpen(false);
        setBookingToDelete(null);
      });
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-semibold">Bookings</h2>
        <button
          className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition"
          title="Add new booking"
          onClick={handleAdd}
        >
          <PlusIcon className="h-6 w-6" />
        </button>
      </div>
      <ul className="divide-y divide-gray-200">
        {bookings?.map((booking, idx) => (
          <li key={idx} className="flex items-center justify-between p-2 hover:bg-blue-50">
            <div>
              <span className="font-medium">{booking.status}</span>
              <p className="text-sm text-gray-500">{booking.status}</p>
            </div>
            <div className="flex gap-2">
              <button
                className="text-blue-500 hover:underline font-medium px-1"
                onClick={() => handleEdit(booking)}
              >
                <PencilIcon
                  title={`Edit "${booking.status}" booking`}
                  className="h-4 w-4 inline-block"
                />
              </button>
              <button
                className="text-red-500 hover:underline font-medium px-1"
                onClick={() => handleDeleteBooking?.(booking)}
              >
                <TrashIcon
                  title={`Remove "${booking.status}" booking`}
                  className="h-4 w-4 inline-block"
                />
              </button>
            </div>
          </li>
        ))}
      </ul>
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-[700px] overflow-auto relative" style={{ minWidth: 400, maxHeight: "90vh" }}>
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
            >
              ×
            </button>
            <BookingsForm
              existing={selectedBooking}
              onSaved={async () => {
                setModalOpen(false);
                await refresh();
              }}
            />
          </div>
        </div>
      )}
      {confirmOpen && bookingToDelete && (
        <DeleteConfirmModal
          open={confirmOpen}
          title="Confirm Deletion"
          message={`Are you sure you want to delete the booking "${bookingToDelete.status}"? This action cannot be undone.`}
          onCancel={() => {
            if (!deleting) setConfirmOpen(false);
          }}
          onConfirm={confirmDelete}
          loading={deleting}
        />
      )}
    </>
  );
}
