"use client";

import { useTransition, useOptimistic } from "react";
import { updateUser } from "@/app/actions/user";

export function RenameUser({ id, initialName }: { id: string; initialName: string }) {
  const [pending, startTransition] = useTransition();
  const [optimisticName, setOptimisticName] = useOptimistic(initialName);

  async function onRename(name: string) {
    setOptimisticName(name); // optimistic UI
    const res = await updateUser({ id, name });
    if (res?.ok !== true) {
      // rollback or show error
      setOptimisticName(initialName);
      alert("Rename failed");
    }
  }

  return (
    <div className="flex gap-2 items-center">
      <input
        defaultValue={initialName}
        className="border p-2 rounded"
        onBlur={(e) => startTransition(() => onRename(e.currentTarget.value))}
      />
      <span className="text-sm text-neutral-500">{pending ? "Saving..." : optimisticName}</span>
    </div>
  );
}
