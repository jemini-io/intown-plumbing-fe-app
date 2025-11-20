"use client";

import { useTransition, useState, useRef } from "react";
import { createAppSetting, updateAppSetting } from "../actions";
import { isJson } from "@/lib/utils/isJson";
import { JsonTreeEditor } from "@/app/dashboard/components/JsonTreeEditor";

// Virtual setting keys that should have readonly 'id' fields
const VIRTUAL_SETTING_KEYS = ['serviceToJobTypes', 'quoteSkills', 'technicianToSkills'] as const;

type Setting = {
  id?: number;
  key: string;
  value: string;
};

type JSONSettingFormProps = {
  existing?: Setting;
  onSaved: () => void;
};

export function JSONSettingForm({ existing, onSaved }: JSONSettingFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [value, setValue] = useState(existing?.value ?? "[]");
  const [key, setKey] = useState(existing?.key ?? "");
  const [isRawEditing, setIsRawEditing] = useState(false);

  type JSONValue =
    | string
    | number
    | boolean
    | null
    | { [k: string]: JSONValue }
    | JSONValue[];

  function parsedValue(): JSONValue | null {
    if (!isJson(value)) return null;
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === "object") return parsed as JSONValue;
      return null;
    } catch {
      return null;
    }
  }

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

  const jsonObj = parsedValue();
  const showJsonEditor = jsonObj && !isRawEditing;

  function toggleMode() {
    setIsRawEditing(prev => {
      const next = !prev;
      if (next && jsonObj) {
        try {
          setValue(JSON.stringify(JSON.parse(value), null, 2));
        } catch {
          /* ignore */
        }
      }
      return next;
    });
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-center dark:text-white">
        {existing ? "Edit Setting" : "Add New Setting (JSON)"}
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
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Value</label>
            {showJsonEditor && (
              <button
                type="button"
                onClick={toggleMode}
                className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 dark:text-gray-300 transition"
              >
                Edit as raw text
              </button>
            )}
            {isRawEditing && jsonObj && (
              <button
                type="button"
                onClick={toggleMode}
                className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 dark:text-gray-300 transition"
              >
                Edit as JSON
              </button>
            )}
          </div>

          {showJsonEditor ? (
            <div
              className="w-full text-sm dark:text-gray-100"
              style={{
                minHeight: 400,
                maxHeight: 600,
                height: "60vh",
              }}
            >
              <JsonTreeEditor
                value={jsonObj}
                onChange={(updated) => {
                  try {
                    setValue(JSON.stringify(updated, null, 2));
                  } catch { /* ignore */ }
                }}
                readonlyFields={
                  VIRTUAL_SETTING_KEYS.includes(existing?.key as typeof VIRTUAL_SETTING_KEYS[number])
                    ? ['id', 'serviceTitanId', 'technicianId']
                    : []
                }
                readonlyObjects={VIRTUAL_SETTING_KEYS.includes(existing?.key as typeof VIRTUAL_SETTING_KEYS[number]) ? ['skills', 'serviceToJobTypes', 'technicians'] : []}
              />
              <input type="hidden" name="value" value={value} />
            </div>
          ) : (
            <textarea
              name="value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full border rounded p-2 font-mono text-xs leading-5 bg-neutral-900 dark:bg-gray-800 text-neutral-100 dark:text-gray-100 border-gray-700 dark:border-gray-600"
              style={{ resize: "none", minHeight: 400, maxHeight: 600, height: "60vh" }}
              spellCheck={false}
              required
            />
          )}
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

