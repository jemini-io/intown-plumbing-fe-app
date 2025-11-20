"use client";

import { useState, useRef, useTransition } from "react";
import { FormComponentProps } from "@/app/dashboard/components/DashboardCard";
import { addBooking, updateBooking } from "../actions";
import { Booking } from "@/lib/types/booking";
import { useCustomersDropdown, useServicesDropdown, useTechniciansDropdown } from "../hooks/useDropdownData";
import { toDatetimeLocalValue } from "@/lib/utils/datetime";
import { BookingStatus } from "@/lib/types/booking";

type BookingFormProps = FormComponentProps & {
  existing?: Booking;
};

export function BookingsForm({ existing, onSaved }: BookingFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  // Load dropdown data via hooks
  const { data: allCustomers, isLoading: loadingCustomers } = useCustomersDropdown();
  const { data: allServices, isLoading: loadingServices } = useServicesDropdown();
  const { data: allTechnicians, isLoading: loadingTechnicians } = useTechniciansDropdown();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      const formData = new FormData(formRef.current!);

      const bookingData = {
        customerId: formData.get("customerId") as string,
        jobId: existing?.jobId || (formData.get("jobId") as string),
        serviceId: formData.get("serviceId") as string,
        technicianId: formData.get("technicianId") as string,
        scheduledFor: new Date(formData.get("scheduledFor") as string),
        status: formData.get("status") as BookingStatus,
        revenue: Number(formData.get("revenue") || 0),
        notes: formData.get("notes") as string,
      };

      try {
        if (existing) {
          await updateBooking(existing.id, bookingData);
          setMessage({ type: "success", text: "Booking updated successfully!" });
        } else {
          await addBooking(bookingData);
          setMessage({ type: "success", text: "Booking created successfully!" });
          formRef.current?.reset();
        }

        setMessage(null);
        onSaved();
      } catch (err) {
        console.error(err);
        setMessage({ type: "error", text: "Something went wrong. Please try again." });
      }
    });
  }

  const statusOptions: BookingStatus[] = ["PENDING", "SCHEDULED", "CANCELED", "COMPLETED"];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-center dark:text-white">
        {existing ? "Edit Booking" : "Add New Booking"}
      </h2>
      {message && (
        <div
          className={`mb-4 text-center text-base font-medium transition-all ${
            message.type === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-4 items-start"
      >
        {/* Scheduled For */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scheduled For</label>
          <input
            type="datetime-local"
            name="scheduledFor"
            defaultValue={
              existing?.scheduledFor
                ? toDatetimeLocalValue(existing.scheduledFor)
                : ""
            }
            className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2"
            required
          />
        </div>
        {/* Customer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer</label>
          {loadingCustomers ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 py-2">Loading customers...</div>
          ) : (
            <select
              name="customerId"
              defaultValue={existing?.customerId ?? ""}
              className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2"
              required
            >
              <option value="">Select a customer</option>
              {allCustomers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          )}
        </div>
        {/* Job ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job ID</label>
          <input
            type="text"
            name="jobId"
            defaultValue={existing?.jobId ?? ""}
            className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2 disabled:bg-gray-100 dark:disabled:bg-gray-800"
            required
            placeholder="e.g. job123"
            disabled={!!existing}
          />
        </div>
        {/* Service */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service</label>
          {loadingServices ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 py-2">Loading services...</div>
          ) : (
            <select
              name="serviceId"
              defaultValue={existing?.serviceId ?? ""}
              className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2"
              required
            >
              <option value="">Select a service</option>
              {allServices.map(service => (
                <option key={service.id} value={service.id}>
                  {service.displayName}
                </option>
              ))}
            </select>
          )}
        </div>
        {/* Technician */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Technician</label>
          {loadingTechnicians ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 py-2">Loading technicians...</div>
          ) : (
            <select
              name="technicianId"
              defaultValue={existing?.technicianId ?? ""}
              className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2"
              required
            >
              <option value="">Select a technician</option>
              {allTechnicians.map(technician => (
                <option key={technician.id} value={technician.id}>
                  {technician.technicianName}
                </option>
              ))}
            </select>
          )}
        </div>
        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select
            name="status"
            defaultValue={existing?.status ?? "PENDING"}
            className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2"
            required
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        {/* Revenue */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Revenue ($)</label>
          <input
            type="number"
            name="revenue"
            defaultValue={existing?.revenue ?? ""}
            className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2"
            step="0.01"
            min="0"
            placeholder="e.g. 150.00"
          />
        </div>
        {/* Notes */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
          <textarea
            name="notes"
            defaultValue={existing?.notes ?? ""}
            className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2"
            rows={3}
            placeholder="Additional notes (optional)"
          />
        </div>
        <div className="col-span-2 flex justify-center mt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 dark:bg-white hover:bg-blue-700 dark:hover:bg-gray-200 text-white dark:text-gray-900 py-2 rounded-md font-medium shadow-md transition disabled:bg-blue-300 dark:disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving..." : existing ? "Update booking" : "Add booking"}
          </button>
        </div>
      </form>
    </div>
  );
}
