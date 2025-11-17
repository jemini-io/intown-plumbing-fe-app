"use client";

import { useEffect, useState, useRef, useTransition } from "react";
import { Skill } from "@/lib/types/skill";
import { ServiceToJobType } from "@/lib/types/serviceToJobType";
import { TechnicianToSkills } from "@/lib/types/technicianToSkills";
import { FormComponentProps } from "@/app/dashboard/components/DashboardCard";
import { addSkill, updateSkill } from "../actions";
import { getAllServices } from "@/app/dashboard/services/actions";
import { getAllTechnicians } from "@/app/dashboard/technicians/actions";

type SkillFormProps = FormComponentProps & {
  existing?: Skill;
};

export function SkillForm({ existing, onSaved }: SkillFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [enabled, setEnabled] = useState<boolean>(existing ? existing.enabled : true);

  // UI state for services
  const [allServices, setAllServices] = useState<ServiceToJobType[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  // UI state for technicians
  const [allTechnicians, setAllTechnicians] = useState<TechnicianToSkills[]>([]);
  const [selectedTechnicianIds, setSelectedTechnicianIds] = useState<string[]>([]);

  useEffect(() => {
    setEnabled(existing ? existing.enabled : true);
  }, [existing]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const services = await getAllServices();
        if (!mounted) return;
        setAllServices(services);
        if (existing?.serviceToJobTypes) {
          setSelectedServiceIds(existing.serviceToJobTypes.map(s => s.id));
        }
      } catch (err) {
        console.error("Failed to load services", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [existing]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const technicians = await getAllTechnicians();
        if (!mounted) return;
        setAllTechnicians(technicians);
        if (existing?.technicians) {
          setSelectedTechnicianIds(existing.technicians.map(t => t.id));
        }
      } catch (err) {
        console.error("Failed to load technicians", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [existing]);

  const toggleServiceSelection = (serviceId: string) => {
    setSelectedServiceIds(prev =>
      prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]
    );
  };

  const toggleTechnicianSelection = (technicianId: string) => {
    setSelectedTechnicianIds(prev =>
      prev.includes(technicianId) ? prev.filter(id => id !== technicianId) : [...prev, technicianId]
    );
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      const formData = new FormData(formRef.current!);

      const skill = {
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        enabled,
      };

      try {
        // let skillId: string;
        if (existing) {
          await updateSkill(existing.id, {
            ...skill,
            serviceIds: selectedServiceIds,
            technicianIds: selectedTechnicianIds,
          });
          // skillId = existing.id;
          setMessage({ type: "success", text: "Skill updated successfully!" });
        } else {
          // const created = await addSkill({
          await addSkill({
            ...skill,
            serviceIds: selectedServiceIds,
            technicianIds: selectedTechnicianIds,
          });
          // skillId = created.id;
          setMessage({ type: "success", text: "Skill created successfully!" });
          formRef.current?.reset();
          setEnabled(true);
        }

        setTimeout(() => {
          setMessage(null);
          onSaved();
        }, 800);
      } catch (err) {
        console.error("SkillForm error:", err);
        setMessage({ type: "error", text: "Something went wrong. Please try again." });
      }
    });
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-center">
        {existing ? "Edit Skill" : "Add New Skill"}
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
        {/* Name */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            name="name"
            defaultValue={existing?.name ?? ""}
            className="w-full border rounded p-2"
            required
            placeholder="e.g. Water Heater"
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
        </div>
        {/* Description */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            defaultValue={existing?.description ?? ""}
            className="w-full border rounded p-2"
            rows={4}
            required
            placeholder="e.g. Skill description"
          />
        </div>
        {/* Associated Services */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Associated Services</label>
          {allServices.length === 0 ? (
            <div className="text-sm text-gray-500">Loading services...</div>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto border rounded p-2">
              {allServices.map(service => (
                <label key={service.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={service.id}
                    checked={selectedServiceIds.includes(service.id)}
                    onChange={() => toggleServiceSelection(service.id)}
                    className="h-4 w-4 rounded"
                  />
                  <span className="text-sm">{service.displayName}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        {/* Associated Technicians */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Associated Technicians</label>
          {allTechnicians.length === 0 ? (
            <div className="text-sm text-gray-500">Loading technicians...</div>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto border rounded p-2">
              {allTechnicians.map(tech => (
                <label key={tech.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={tech.id}
                    checked={selectedTechnicianIds.includes(tech.id)}
                    onChange={() => toggleTechnicianSelection(tech.id)}
                    className="h-4 w-4 rounded"
                  />
                  <span className="text-sm">{tech.technicianName}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="col-span-2 flex justify-center mt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium shadow-md transition disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving..." : existing ? "Update skill" : "Add skill"}
          </button>
        </div>
      </form>
    </div>
  );
}