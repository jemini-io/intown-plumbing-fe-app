"use client";

import { useTransition, useState, useRef } from "react";
import { TechnicianToSkillsType } from "@/lib/types/technicianToSkillsType";
import { FormComponentProps } from "@/app/dashboard/components/DashboardCard"; // Ajusta el import según tu estructura
import { addTechnician, updateTechnician } from "@/app/dashboard/technicians/actions";

type TechnicianFormProps = FormComponentProps & {
  existing?: TechnicianToSkillsType;
};

export function TechnicianToSkillsForm({ existing, onSaved }: TechnicianFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Tag input state
  const [skills, setSkills] = useState<string[]>(existing?.skills ?? []);
  const [skillInput, setSkillInput] = useState("");

  function handleAddSkill(e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement>) {
    if (
      (e as React.KeyboardEvent).key === "Enter" ||
      (e as React.MouseEvent).type === "click"
    ) {
      e.preventDefault();
      const value = skillInput.trim();
      if (value && !skills.includes(value)) {
        setSkills([...skills, value]);
        setSkillInput("");
      }
    }
  }

  function handleRemoveSkill(idx: number) {
    setSkills(skills.filter((_, i) => i !== idx));
  }

   async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      const formData = new FormData(formRef.current!);

      const technician: TechnicianToSkillsType = {
        technicianId: formData.get("technicianId") as string,
        technicianName: formData.get("technicianName") as string,
        skills,
      };

      try {
        if (existing) {
          await updateTechnician(existing.technicianId, technician);
          setMessage({ type: "success", text: "Technician updated successfully!" });
        } else {
          await addTechnician(technician);
          setMessage({ type: "success", text: "Technician created successfully!" });
          formRef.current?.reset();
        }
        setTimeout(() => {
          setMessage(null);
          onSaved();
        }, 1500);
      } catch (err) {
        setMessage({ type: "error", text: "Something went wrong. Please try again." });
      }
    });
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-center">
        {existing ? "Edit Technician" : "Add New Technician"}
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
        {/* Technician Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Technician Name</label>
          <input
            type="text"
            name="technicianName"
            defaultValue={existing?.technicianName ?? ""}
            className="w-full border rounded p-2"
            required
            placeholder="John Doe"
          />
        </div>
        {/* Technician ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Service Titan Technician ID</label>
          <input
            type="text"
            name="technicianId"
            defaultValue={existing?.technicianId ?? ""}
            className="w-full border rounded p-2"
            required
            placeholder="e.g. 78123456"
          />
        </div>
        {/* Skills Tag Input */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {skills.map((skill, idx) => (
              <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                {skill}
                <button
                  type="button"
                  className="ml-1 text-xs text-red-500 hover:text-red-700"
                  onClick={() => handleRemoveSkill(idx)}
                  aria-label={`Remove ${skill}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={handleAddSkill}
              className="border rounded p-2 flex-grow"
              placeholder="e.g. Plumber"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 whitespace-nowrap flex-shrink-0"
            >
              Add skill
            </button>
          </div>
        </div>
        <div className="col-span-2 flex justify-center mt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-gray-800 to-gray-700 text-white py-2 rounded-md font-medium shadow-md hover:from-gray-900 hover:to-gray-800 transition disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving..." : existing ? "Update technician" : "Add technician"}
          </button>
        </div>
      </form>
    </div>
  );
}
