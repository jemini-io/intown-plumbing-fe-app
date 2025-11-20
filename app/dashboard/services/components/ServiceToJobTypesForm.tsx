"use client";

import { useEffect, useState, useRef, useTransition } from "react";
import { ServiceToJobType } from "@/lib/types/serviceToJobType";
import { Skill } from "@/lib/types/skill";
import { FormComponentProps } from "@/app/dashboard/components/DashboardCard"; // Ajusta el import según tu estructura
import { addService, updateService } from "@/app/dashboard/services/actions";
import { getAllSkills } from "@/app/dashboard/skills/actions";

type ServiceFormProps = FormComponentProps & {
  existing?: ServiceToJobType;
};

export function ServiceToJobTypesForm({ existing, onSaved }: ServiceFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [enabled, setEnabled] = useState<boolean>(existing ? existing.enabled : true);

  // Skills UI state
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);

  useEffect(() => {
    setEnabled(existing ? existing.enabled : true);
  }, [existing]);

  // Load skills and initialize selected ones when editing
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const skills = await getAllSkills();
        if (!mounted) return;
        setAllSkills(skills);
        // If editing, initialize selected ids from existing.skills (existing.skills is Skill[] per types)
        if (existing?.skills) {
          setSelectedSkillIds(existing.skills.map(s => s.id));
        } else {
          setSelectedSkillIds([]);
        }
      } catch (err) {
        // Silently fail or show feedback if you prefer
        console.error("Failed to load skills", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [existing]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      const formData = new FormData(formRef.current!);

      const service = {
        serviceTitanId: Number(formData.get("serviceTitanId") as string),
        displayName: formData.get("displayName") as string,
        serviceTitanName: formData.get("serviceTitanName") as string,
        emoji: formData.get("emoji") as string,
        icon: formData.get("icon") as string,
        description: formData.get("description") as string,
        enabled,
        skillIds: selectedSkillIds,
      };

      try {
        if (existing) {
          await updateService(existing.id, service);
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
        }, 800);
      } catch (err) {
        console.error(err);
        setMessage({ type: "error", text: "Something went wrong. Please try again." });
      }
    });
  }

  const toggleSkillSelection = (skillId: string) => {
    setSelectedSkillIds(prev =>
      prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
    );
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-center dark:text-white">
        {existing ? "Edit Service" : "Add New Service"}
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
        {/* Display Name */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
          <input
            type="text"
            name="displayName"
            defaultValue={existing?.displayName ?? ""}
            className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2"
            required
            placeholder="e.g. Plumbing"
          />
        </div>
        {/* ServiceTitan ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ServiceTitan ID</label>
          <input
            type="text"
            name="serviceTitanId"
            defaultValue={existing?.serviceTitanId ?? ""}
            className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2"
            required
            placeholder="e.g. 78123456"
          />
        </div>
        {/* ServiceTitan Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ServiceTitan Name</label>
          <input
            type="text"
            name="serviceTitanName"
            defaultValue={existing?.serviceTitanName ?? ""}
            className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2"
            required
            placeholder="e.g. Plumbing Service Call"
          />
        </div>
        {/* Emoji */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Emoji</label>
          <input
            type="text"
            name="emoji"
            defaultValue={existing?.emoji ?? ""}
            className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2"
            maxLength={2}
            required
            placeholder="e.g. 🔧"
          />
        </div>
        {/* Icon */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icon</label>
          <input
            type="text"
            name="icon"
            defaultValue={existing?.icon ?? ""}
            className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2"
            required
            placeholder="e.g. wrench"
          />
        </div>
        {/* Enabled pill toggle */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enabled</span>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled(v => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              enabled ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white dark:bg-gray-200 shadow transition ${
                enabled ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        {/* Description */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea
            name="description"
            defaultValue={existing?.description ?? ""}
            className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2"
            rows={5}
            required
            placeholder="e.g. Get your plumbing issues fixed with our expert services."
          />
        </div>

        {/* Associated Skills */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Associated Skills</label>

          {allSkills.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">Loading skills...</div>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto border dark:border-gray-600 dark:bg-gray-700 rounded p-2">
              {allSkills.map(skill => (
                <label key={skill.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={skill.id}
                    checked={selectedSkillIds.includes(skill.id)}
                    onChange={() => toggleSkillSelection(skill.id)}
                    className="h-4 w-4 rounded dark:bg-gray-600 dark:border-gray-500"
                  />
                  <span className="text-sm dark:text-white">{skill.name}</span>
                </label>
              ))}
            </div>
          )}
          {/* hidden field so formData contains selection too (comma separated) */}
          <input type="hidden" name="skillIds" value={selectedSkillIds.join(",")} />
        </div>

        <div className="col-span-2 flex justify-center mt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 dark:bg-white hover:bg-blue-700 dark:hover:bg-gray-200 text-white dark:text-gray-900 py-2 rounded-md font-medium shadow-md transition disabled:bg-blue-300 dark:disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving..." : existing ? "Update service" : "Add service"}
          </button>
        </div>
      </form>
    </div>
  );
}