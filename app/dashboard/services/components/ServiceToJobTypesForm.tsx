"use client";

import { useTransition, useState, useRef } from "react";
import { ServiceToJobType } from "@/lib/types/serviceToJobType";
import { FormComponentProps } from "@/app/dashboard/components/DashboardCard"; // Ajusta el import según tu estructura
import { addService, updateService } from "@/app/dashboard/services/actions";

type ServiceFormProps = FormComponentProps & {
  existing?: ServiceToJobType;
};

export function ServiceToJobTypesForm({ existing, onSaved }: ServiceFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [enabled, setEnabled] = useState<boolean>(existing ? existing.enabled : true);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      const formData = new FormData(formRef.current!);

      const service: ServiceToJobType = {
        serviceTitanId: formData.get("serviceTitanId") as string,
        displayName: formData.get("displayName") as string,
        serviceTitanName: formData.get("serviceTitanName") as string,
        emoji: formData.get("emoji") as string,
        icon: formData.get("icon") as string,
        description: formData.get("description") as string,
        enabled,
      };

      try {
        if (existing) {
          await updateService(existing.serviceTitanId, service);
          setMessage({ type: "success", text: "Service updated successfully!" });
        } else {
          await addService(service);
          setMessage({ type: "success", text: "Service created successfully!" });
          formRef.current?.reset();
          setEnabled(true);
        }
        setTimeout(() => {
          setMessage(null);
          onSaved();
        }, 1500);
      } catch {
        setMessage({ type: "error", text: "Something went wrong. Please try again." });
      }
    });
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-center">
        {existing ? "Edit Service" : "Add New Service"}
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
        {/* Display Name */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
          <input
            type="text"
            name="displayName"
            defaultValue={existing?.displayName ?? ""}
            className="w-full border rounded p-2"
            required
            placeholder="e.g. Plumbing"
          />
        </div>
        {/* ServiceTitan ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ServiceTitan ID</label>
          <input
            type="text"
            name="serviceTitanId"
            defaultValue={existing?.serviceTitanId ?? ""}
            className="w-full border rounded p-2"
            required
            placeholder="e.g. 78123456"
          />
        </div>
        {/* ServiceTitan Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ServiceTitan Name</label>
          <input
            type="text"
            name="serviceTitanName"
            defaultValue={existing?.serviceTitanName ?? ""}
            className="w-full border rounded p-2"
            required
            placeholder="e.g. Plumbing Service Call"
          />
        </div>
        {/* Emoji */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Emoji</label>
          <input
            type="text"
            name="emoji"
            defaultValue={existing?.emoji ?? ""}
            className="w-full border rounded p-2"
            maxLength={2}
            required
            placeholder="e.g. 🔧"
          />
        </div>
        {/* Icon */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
          <input
            type="text"
            name="icon"
            defaultValue={existing?.icon ?? ""}
            className="w-full border rounded p-2"
            required
            placeholder="e.g. wrench"
          />
        </div>
        {/* Enabled pill toggle */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Enabled</span>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled(v => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              enabled ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                enabled ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>
          <input type="hidden" name="enabled" value={enabled ? "true" : "false"} />
        </div>
        {/* Description */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            defaultValue={existing?.description ?? ""}
            className="w-full border rounded p-2"
            rows={5}
            required
            placeholder="e.g. Get your plumbing issues fixed with our expert services."
          />
        </div>
        <div className="col-span-2 flex justify-center mt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-gray-800 to-gray-700 text-white py-2 rounded-md font-medium shadow-md hover:from-gray-900 hover:to-gray-800 transition disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving..." : existing ? "Update service" : "Add service"}
          </button>
        </div>
      </form>
    </div>
  );
}