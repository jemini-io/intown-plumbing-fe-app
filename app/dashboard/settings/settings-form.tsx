"use client";

import { useTransition, useState, useRef } from "react";
import { updateSetting } from "./actions";
import { isJson } from "@/lib/utils/isJson";
import { JsonTreeEditor } from "@/app/dashboard/components/JsonTreeEditor";

type Setting = {
  id?: number;
  key: string;
  value: string;
};

type SettingsFormProps = {
  existing: Setting;
  onSaved: () => void;
};

export function SettingsForm({ existing, onSaved }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [value, setValue] = useState(existing.value);
  const [isRawEditing, setIsRawEditing] = useState(false);

  function handleValueChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
  }

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
      const newValue = formData.get("value") as string;
      try {
        await updateSetting(existing.id!, { key: existing.key, value: newValue });
        setMessage({ type: "success", text: "Setting updated successfully!" });
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
      <h2 className="text-xl font-semibold mb-4 text-center">Edit Setting</h2>

      {message && (
        <div
          className={`mb-4 text-center text-base font-medium ${
            message.type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message.text}
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 items-start">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
            <input
              type="text"
              name="key"
              value={existing.key}
              readOnly
              className="w-full border rounded p-2 bg-gray-100 text-gray-500 cursor-not-allowed"
            />
        </div>

        <div className="col-span-2">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">
              Value
            </label>
            {!!jsonObj && (
              <button
                type="button"
                onClick={toggleMode}
                className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 transition"
              >
                {isRawEditing ? "Edit as JSON" : "Edit as raw text"}
              </button>
            )}
          </div>

          <div
            className="w-full text-neutral-100 text-sm"
            style={{
              minHeight: 400,
              maxHeight: 600,
              height: "60vh",
            }}
          >
            {jsonObj && !isRawEditing ? (
              <>
                <JsonTreeEditor
                  value={jsonObj}
                  onChange={(updated) => {
                    try {
                      setValue(JSON.stringify(updated, null, 2));
                    } catch { /* ignore */ }
                  }}
                />
                <input type="hidden" name="value" value={value} />
              </>
            ) : (
              <textarea
                name="value"
                value={value}
                onChange={handleValueChange}
                className="w-full h-full border rounded p-2 font-mono text-xs leading-5 bg-neutral-900 text-neutral-100"
                style={{ resize: "none", minHeight: "100%" }}
                spellCheck={false}
                required
              />
            )}
          </div>
        </div>

        <div className="col-span-2 flex justify-center mt-2">
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-gray-800 to-gray-700 text-white py-2 rounded-md font-medium shadow-md hover:from-gray-900 hover:to-gray-800 transition disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving..." : "Update"}
          </button>
        </div>
      </form>
    </div>
  );
}
