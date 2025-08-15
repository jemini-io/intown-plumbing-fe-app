"use client";

import { useTransition, useState } from "react";
import { createSetting, updateSetting, deleteSetting } from "./actions";

export function SettingsForm({ existing }: { existing?: { id: number; key: string; value: unknown } }) {
  const [pending, start] = useTransition();
  const [key, setKey] = useState(existing?.key ?? "");
  const [value, setValue] = useState(
    existing ? JSON.stringify(existing.value, null, 2) : "{\n  \"example\": true\n}"
  );
  const isEdit = !!existing;

  async function onSubmit() {
    start(async () => {
      const payload = isEdit ? { id: existing!.id, value } : { key, value };
      const res = isEdit ? await updateSetting(payload) : await createSetting(payload);
      if (res?.ok !== true) {
        alert("Validation failed");
      } else if (!isEdit) {
        setKey("");
      }
    });
  }

  return (
    <div className="border rounded p-3 space-y-2">
      {!isEdit && (
        <div className="space-y-1">
          <label className="text-sm">Key</label>
          <input
            value={key}
            onChange={e => setKey(e.target.value)}
            className="border rounded p-2 w-full font-mono"
            placeholder="site.name"
          />
        </div>
      )}
      <div className="space-y-1">
        <label className="text-sm">Value (JSON)</label>
        <textarea
          value={value}
          onChange={e => setValue(e.target.value)}
          className="border rounded p-2 w-full font-mono min-h-28"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={onSubmit}
          disabled={pending}
          className="px-3 py-2 border rounded"
        >
          {pending ? "Saving…" : isEdit ? "Update" : "Create"}
        </button>

        {isEdit && (
          <button
            onClick={() => start(async () => { await deleteSetting(existing!.id); })}
            disabled={pending}
            className="px-3 py-2 border rounded"
          >
            {pending ? "…" : "Delete"}
          </button>
        )}
      </div>
    </div>
  );
}
