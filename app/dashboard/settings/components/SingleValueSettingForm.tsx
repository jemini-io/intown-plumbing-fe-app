"use client";

import { useTransition, useState, useRef } from "react";
import { createAppSetting, updateAppSetting } from "../actions";

type Setting = {
  id?: number;
  key: string;
  value: string;
};

type SingleValueSettingFormProps = {
  existing?: Setting;
  onSaved: () => void;
};

export function SingleValueSettingForm({ existing, onSaved }: SingleValueSettingFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [value, setValue] = useState(existing?.value ?? "");
  const [key, setKey] = useState(existing?.key ?? "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      const formData = new FormData(formRef.current!);
      const newKey = formData.get("key") as string;
      const newValue = formData.get("value") as string;
      try {
        if (existing) {
          await updateAppSetting(existing.id!, { key: existing.key, value: newValue });
          setMessage({ type: "success", text: "Setting updated successfully!" });
        } else {
          await createAppSetting({ key: newKey, value: newValue });
          setMessage({ type: "success", text: "Setting created successfully!" });
        }
        setTimeout(() => {
          setMessage(null);
          onSaved();
        }, 1500);
      } catch {
        setMessage({ type: "error", text: "Something went wrong. Please try again." });
        setTimeout(() => setMessage(null), 2000);
      }
    });
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-center dark:text-white">
        {existing ? "Edit Setting" : "Add New Setting"}
      </h2>

      {message && (
        <div
          className={`mb-4 text-center text-base font-medium ${
            message.type === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 items-start">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Key</label>
          <input
            type="text"
            name="key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            readOnly={!!existing}
            className={existing ? "w-full border rounded p-2 bg-gray-100 dark:bg-gray-700 dark:border-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed" : "w-full border rounded p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"}
            required
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Value</label>
          <input
            type="text"
            name="value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full border rounded p-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>

        <div className="col-span-2 flex justify-center mt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-blue-600 dark:bg-white hover:bg-blue-700 dark:hover:bg-gray-200 text-white dark:text-gray-900 py-2 rounded-md font-medium shadow-md transition disabled:bg-blue-300 dark:disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving..." : existing ? "Update" : "Add"}
          </button>
        </div>
      </form>
    </div>
  );
}

