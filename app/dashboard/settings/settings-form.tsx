"use client";

import { useTransition, useState, useRef } from "react";
import { updateSetting } from "./actions";
import { isJson } from "@/lib/utils/isJson";
import ReactJsonView, { InteractionProps } from "react-json-view";

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
  const [rows, setRows] = useState(Math.max(2, existing.value.split("\n").length));

  function handleValueChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    setRows(Math.max(2, e.target.value.split("\n").length));
  }

  function handleJsonEdit(edit: InteractionProps) {
    setValue(JSON.stringify(edit.updated_src, null, 2));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      const formData = new FormData(formRef.current!);
      const value = formData.get("value") as string;

      try {
        await updateSetting(existing.id!, { key: existing.key, value });
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

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-center">
        Edit Setting
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
        {/* Key (read-only) */}
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
        {/* Value (editable) */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
          {isJson(value) ? (
            <div
              className="w-full"
              style={{
                minHeight: 400,
                maxHeight: 600,
                height: "60vh",
                overflow: "auto",
              }}
            >
              <ReactJsonView
                src={JSON.parse(value)}
                onEdit={handleJsonEdit}
                onAdd={handleJsonEdit}
                onDelete={handleJsonEdit}
                theme="monokai"
                name={false}
                collapsed={false}
                enableClipboard={false}
                displayDataTypes={false}
                style={{ fontSize: "0.85rem", padding: "8px", borderRadius: "6px" }}
              />
            </div>
          ) : (
            <textarea
              name="value"
              value={value}
              onChange={handleValueChange}
              className="w-full border rounded p-2"
              required
              rows={rows}
              style={{ resize: "none" }}
            />
          )}
          {isJson(value) && (
            <input type="hidden" name="value" value={value} />
          )}
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
