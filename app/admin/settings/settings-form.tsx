"use client";

import { useTransition, useState, useRef } from "react";
import { createSetting, updateSetting, deleteSetting } from "./actions";

type Setting = {
  id?: number;
  key: string;
  value: string;
};

type SettingsFormProps = {
  existing?: Setting;
  onSaved: () => void;
};

export function SettingsForm({ existing, onSaved }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    const key = formData.get("key") as string;
    const value = formData.get("value") as string;

    try {
      if (existing?.id) {
        await updateSetting(existing.id, { key, value });
        setMessage({ type: "success", text: "Setting updated successfully!" });
      } else {
        await createSetting({ key, value });
        setMessage({ type: "success", text: "Setting created successfully!" });
        formRef.current?.reset(); 
      }
      await onSaved();
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  }

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete the setting "${existing!.key}"?`)) {
      return;
    }

    try {
      await deleteSetting(existing!.id!);
      setMessage({ type: "success", text: "Setting deleted successfully!" });
      await onSaved();
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Delete failed. Please try again." });
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  }

  return (
    <div className="space-y-1">
      <form
        ref={formRef}
        action={(formData) =>
          startTransition(async () => {
            await handleSubmit(formData);
          })
        }
        className="flex gap-2 items-center"
      >
        <input
          type="text"
          name="key"
          placeholder="Key"
          defaultValue={existing?.key ?? ""}
          className={`border p-1 ${
            existing?.id ? "bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none focus:ring-0 hover:border-gray-300" : ""
          }`}
          required
          readOnly={!!existing?.id}
        />
        <input
          type="text"
          name="value"
          placeholder="Value"
          defaultValue={existing?.value ?? ""}
          className="border p-1"
          required
        />
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 text-white px-2 py-1 rounded"
        >
          {isPending ? "Saving..." : existing ? "Update" : "Add"}
        </button>

        {existing?.id && (
          <button
            type="button"
            onClick={() => startTransition(handleDelete)}
            disabled={isPending}
            className="bg-red-600 text-white px-2 py-1 rounded"
          >
            {isPending ? "Deleting..." : "Delete"}
          </button>
        )}
      </form>

      {message && (
        <p
          className={`text-sm ${
            message.type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
