"use client";

import { useTransition, useState, useRef, useEffect } from "react";
import { enumToStatus, TechnicianToSkills } from "@/lib/types/technicianToSkills";
import { Skill } from "@/lib/types/skill";
import { FormComponentProps } from "@/app/dashboard/components/DashboardCard";
import Image from "next/image";
import { UserCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import { TechnicianStatus } from "@/lib/types/technicianToSkills";
import { getAllSkills } from "@/app/dashboard/skills/actions";

type TechnicianFormProps = FormComponentProps & {
  existing?: TechnicianToSkills;
};

export function TechnicianToSkillsForm({ existing, onSaved }: TechnicianFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Skills UI state
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);

  const [enabled, setEnabled] = useState<boolean>(existing ? existing.enabled : true);

  const [imagePreview, setImagePreview] = useState<string | null>(existing?.image?.url ?? null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  const statusOptions: TechnicianStatus[] = [
    "ON JOB",
    "ON ROUTE",
    "FINISHED JOB",
    "AWAITING JOB",
  ];
  const [status, setStatus] = useState<TechnicianStatus>(
    enumToStatus(existing?.status ?? "AWAITING_JOB")
  );

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
        console.error("Failed to load skills", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [existing]);

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      const formData = new FormData(formRef.current!);

      // Technician fields
      formData.set("enabled", enabled ? "true" : "false");
      formData.set("status", status);
      formData.set("skillIds", selectedSkillIds.join(","));

      if (imageFile) {
        formData.set("image", imageFile);
      }
      if (removeImage) {
        formData.set("removeImage", "true");
      }

      try {
        let response;
        if (existing?.id) {
          formData.set("id", existing.id);
          response = await fetch("/api/technicians/update", {
            method: "POST",
            body: formData,
          });
        } else {
          response = await fetch("/api/technicians/create", {
            method: "POST",
            body: formData,
          });
        }

        const result = await response.json();
        if (response.ok) {
          setMessage({
            type: "success",
            text: existing ? "Technician updated successfully!" : "Technician created successfully!",
          });
          if (!existing) {
            formRef.current?.reset();
            setImagePreview(null);
            setImageFile(null);
            setSelectedSkillIds([]);
            setEnabled(true);
            setStatus("AWAITING JOB");
          }
          setTimeout(() => {
            setMessage(null);
            onSaved();
          }, 1500);
        } else {
          setMessage({ type: "error", text: result.error || "Something went wrong. Please try again." });
        }
      } catch {
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
        {/* Enabled + Status */}
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            name="status"
            value={status}
            onChange={e => setStatus(e.target.value as TechnicianStatus)}
            className="w-full border rounded p-2"
            required
          >
            {statusOptions.map(opt => (
              <option key={opt} value={opt}>{opt.replace(/_/g, " ")}</option>
            ))}
          </select>
        </div>
        {/* Associated Skills */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Associated Skills</label>
          {allSkills.length === 0 ? (
            <div className="text-sm text-gray-500">Loading skills...</div>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto border rounded p-2">
              {allSkills.map(skill => (
                <label key={skill.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={skill.id}
                    checked={selectedSkillIds.includes(skill.id)}
                    onChange={() => toggleSkillSelection(skill.id)}
                    className="h-4 w-4 rounded"
                  />
                  <span className="text-sm">{skill.name}</span>
                </label>
              ))}
            </div>
          )}
          <input type="hidden" name="skillIds" value={selectedSkillIds.join(",")} />
        </div>
        {/* Image */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
        </div>
        <div className="col-span-2 flex items-center gap-6">
          {/* Preview */}
          <div className="relative">
            {imagePreview ? (
              <>
                <Image
                  src={imagePreview}
                  alt="Technician image"
                  width={100}
                  height={100}
                  className="rounded-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(null);
                    setImageFile(null);
                    setRemoveImage(true);
                  }}
                  className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow hover:bg-red-100"
                  title="Remove image"
                >
                  <TrashIcon className="h-4 w-4 text-red-600" />
                </button>
              </>
            ) : (
              <div className="h-16 w-16 flex items-center justify-center rounded-full bg-gray-200 border">
                <UserCircleIcon className="h-8 w-8 text-gray-500" />
              </div>
            )}
          </div>
          {/* Upload input */}
          <input
            type="file"
            name="picture"
            accept="image/*"
            onChange={handleImageChange}
            className="block text-sm text-gray-500
              file:mr-2 file:py-1 file:px-2
              file:rounded file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </div>
        <div className="col-span-2 flex justify-center mt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium shadow-md transition disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving..." : existing ? "Update technician" : "Add technician"}
          </button>
        </div>
      </form>
    </div>
  );
}
