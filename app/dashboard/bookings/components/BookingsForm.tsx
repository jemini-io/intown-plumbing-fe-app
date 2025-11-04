"use client";

import { useEffect, useState, useRef, useTransition } from "react";
import { FormComponentProps } from "@/app/dashboard/components/DashboardCard";
import { addBooking, updateBooking } from "../actions";
import { Booking } from "@/lib/types/booking";
import { ServiceToJobType } from "@/lib/types/serviceToJobType";
import { TechnicianToSkills } from "@/lib/types/technicianToSkills";
import { getAllServiceToJobTypes } from "@/app/dashboard/services/actions";
import { getAllTechnicians } from "@/app/dashboard/technicians/actions";
import { toDatetimeLocalValue } from "@/lib/utils/datetime";

type BookingFormProps = FormComponentProps & {
  existing?: Booking;
};

export function BookingsForm({ existing, onSaved }: BookingFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // UI state for services and technicians
  const [allServices, setAllServices] = useState<ServiceToJobType[]>([]);
  const [allTechnicians, setAllTechnicians] = useState<TechnicianToSkills[]>([]);

  // Load services and technicians
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [services, technicians] = await Promise.all([
          getAllServiceToJobTypes(),
          getAllTechnicians(),
        ]);
        if (!mounted) return;
        setAllServices(services.filter(s => s.enabled));
        setAllTechnicians(technicians.filter(t => t.enabled));
      } catch (err) {
        console.error("Failed to load services or technicians", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // uses util: toDatetimeLocalValue

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
        status: formData.get("status") as string,
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

  const statusOptions = ["pending", "scheduled", "confirmed", "canceled", "completed"];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-center">
        {existing ? "Edit Booking" : "Add New Booking"}
      </h2>
      {message && (
        <div
          className={`mb-4 text-center text-base font-medium transition-all ${
            message.type === "success" ? "text-green-600" : "text-red-600"
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
        {/* Job ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job ID</label>
          <input
            type="text"
            name="jobId"
            defaultValue={existing?.jobId ?? ""}
            className="w-full border rounded p-2"
            required
            placeholder="e.g. job123"
            disabled={!!existing}
          />
        </div>
        {/* Service */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
          {allServices.length === 0 ? (
            <div className="text-sm text-gray-500 py-2">Loading services...</div>
          ) : (
            <select
              name="serviceId"
              defaultValue={existing?.serviceId ?? ""}
              className="w-full border rounded p-2"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Technician</label>
          {allTechnicians.length === 0 ? (
            <div className="text-sm text-gray-500 py-2">Loading technicians...</div>
          ) : (
            <select
              name="technicianId"
              defaultValue={existing?.technicianId ?? ""}
              className="w-full border rounded p-2"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            name="status"
            defaultValue={existing?.status ?? "pending"}
            className="w-full border rounded p-2"
            required
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
        {/* Revenue */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Revenue ($)</label>
          <input
            type="number"
            name="revenue"
            defaultValue={existing?.revenue ?? ""}
            className="w-full border rounded p-2"
            step="0.01"
            min="0"
            placeholder="e.g. 150.00"
          />
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium shadow-md transition disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving..." : existing ? "Update booking" : "Add booking"}
          </button>
        </div>
      </form>
    </div>
  );
}
