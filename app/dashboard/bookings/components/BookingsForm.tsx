"use client";

import { useTransition, useState, useRef } from "react";
import { FormComponentProps } from "@/app/dashboard/components/DashboardCard";
import { updateBooking } from "@/app/dashboard/bookings/actions";
import { Booking } from "@/lib/types/booking";

type BookingFormProps = FormComponentProps & {
  existing?: Booking;
};

export function BookingsForm({ existing, onSaved }: BookingFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      const formData = new FormData(formRef.current!);

      const booking: Booking = {
        id: existing?.id ?? "",
        customerId: formData.get("customerId") as string,
        serviceId: formData.get("serviceId") as string,
        technicianId: formData.get("technicianId") as string,
        scheduledFor: formData.get("scheduledFor") as string,
        status: formData.get("status") as string,
        notes: formData.get("notes") as string,
      };

      try {
        if (existing) {
          await updateBooking(existing.id, booking);
          setMessage({ type: "success", text: "Booking updated successfully!" });
          setTimeout(() => {
            setMessage(null);
            onSaved();
          }, 1500);
        }
      } catch (err) {
        setMessage({ type: "error", text: "BOOKING(add/update): Something went wrong. Please try again." });
      }
    });
  }

  function toDatetimeLocalValue(date: Date | string) {
    const d = typeof date === "string" ? new Date(date) : date;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return (
      d.getFullYear() +
      '-' +
      pad(d.getMonth() + 1) +
      '-' +
      pad(d.getDate()) +
      'T' +
      pad(d.getHours()) +
      ':' +
      pad(d.getMinutes())
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-center">
        {existing ? "Edit Booking" : "Add New Booking"}
      </h2>
      {message && (
        <div className={`mb-4 text-center text-base font-medium transition-all
          ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
          {message.text}
        </div>
      )}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-4 items-start"
      >
        {/* Customer ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer ID</label>
          <input
            type="text"
            name="customerId"
            defaultValue={existing?.customerId ?? ""}
            className="w-full border rounded p-2"
            required
            placeholder="e.g. customer123"
          />
        </div>
        {/* Service ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Service ID</label>
          <input
            type="text"
            name="serviceId"
            defaultValue={existing?.serviceId ?? ""}
            className="w-full border rounded p-2"
            required
            placeholder="e.g. service123"
          />
        </div>
        {/* Technician ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Technician ID</label>
          <input
            type="text"
            name="technicianId"
            defaultValue={existing?.technicianId ?? ""}
            className="w-full border rounded p-2"
            placeholder="e.g. technician123"
          />
        </div>
        {/* Scheduled For */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled For</label>
          <input
            type="datetime-local"
            name="scheduledFor"
            defaultValue={
              existing?.scheduledFor
                ? toDatetimeLocalValue(existing.scheduledFor)
                : ""
            }
            className="w-full border rounded p-2"
            required
          />
        </div>
        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            name="status"
            defaultValue={existing?.status ?? "pending"}
            className="w-full border rounded p-2"
            required
          >
            <option value="pending">Pending</option>
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>
        {/* Notes */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            name="notes"
            defaultValue={existing?.notes ?? ""}
            className="w-full border rounded p-2"
            rows={3}
            placeholder="Additional notes (optional)"
          />
        </div>
        <div className="col-span-2 flex justify-center mt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-gray-800 to-gray-700 text-white py-2 rounded-md font-medium shadow-md hover:from-gray-900 hover:to-gray-800 transition disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving..." : existing ? "Update Booking" : "Add Booking"}
          </button>
        </div>
      </form>
    </div>
  );
}