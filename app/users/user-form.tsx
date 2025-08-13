"use client";

import { useActionState, useTransition } from "react";
import type { safeCreateUser } from "../actions/safe-user";

type UsersFormProps = { action: typeof safeCreateUser };

export default function UsersForm({ action }: UsersFormProps) {
  const [pending, startTransition] = useTransition();
  const [result, formAction] = useActionState(action as any, null);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        // optional: convert to object so we can pass to action
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const payload = { email: fd.get("email"), name: fd.get("name") };
        startTransition(async () => {
          await action(payload);
          e.currentTarget.reset();
        });
      }}
      className="flex gap-2 items-end"
    >
      <div>
        <label className="block text-sm">Email</label>
        <input name="email" type="email" className="border p-2 rounded" required />
      </div>
      <div>
        <label className="block text-sm">Name</label>
        <input name="name" className="border p-2 rounded" required />
      </div>
      <button disabled={pending} className="border px-3 py-2 rounded">
        {pending ? "Saving..." : "Create"}
      </button>

      {result?.ok === false && (
        <p className="text-red-600 text-sm">
          {Object.values(result.error.fieldErrors ?? {}).flat().join(", ") || "Invalid input"}
        </p>
      )}
    </form>
  );
}
