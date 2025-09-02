"use client";

import { useTransition, useState, useRef } from "react";
import { createUser, updateUser, deleteUser } from "./actions";

type User = {
  id?: number;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
};

type UserFormProps = {
  existing?: User;
  onSaved: () => void;
};

export function UserForm({ existing, onSaved }: UserFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const isProtectedAdmin = existing?.email === "admin@example.com";

  // Handle form submit for create/update
  async function handleSubmit(formData: FormData) {
    const email = formData.get("email") as string;
    const name = formData.get("name") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as "USER" | "ADMIN";

    try {
      if (existing?.id) {
        await updateUser(existing.id, { email, name, role, password: password || undefined });
        setMessage({ type: "success", text: "User updated successfully!" });
      } else {
        await createUser({ email, name, role, password });
        setMessage({ type: "success", text: "User created successfully!" });
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
    if (!confirm(`Are you sure you want to delete the user "${existing!.name} (${existing!.email})"?`)) {
      return;
    }

    try {
      await deleteUser(existing!.id!);
      setMessage({ type: "success", text: "User deleted successfully!" });
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
        className="flex flex-col sm:flex-row gap-2 items-center"
      >
        <input
          type="email"
          name="email"
          placeholder="Email"
          defaultValue={existing?.email ?? ""}
          className={`border p-1 ${
            isProtectedAdmin ? "bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none focus:ring-0 hover:border-gray-300" : ""
          }`}
          required
          disabled={isProtectedAdmin}
        />
        <input
          type="text"
          name="name"
          placeholder="Name"
          defaultValue={existing?.name ?? ""}
          className={`border p-1 ${
            isProtectedAdmin ? "bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none focus:ring-0 hover:border-gray-300" : ""
          }`}
          required
          disabled={isProtectedAdmin}
        />
        <input
          type="password"
          name="password"
          placeholder={existing ? "New password (optional)" : "Password"}
          className="border p-1"
          {...(existing ? {} : { required: true })}
        />
        <select
          name="role"
          defaultValue={existing?.role ?? "USER"}
          className={`border p-1 ${
            isProtectedAdmin ? "bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none focus:ring-0 hover:border-gray-300" : ""
          }`}
          disabled={isProtectedAdmin}
        >
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>

        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 text-white px-2 py-1 rounded"
        >
          {isPending ? "Saving..." : existing ? "Update" : "Add"}
        </button>

        {existing?.id && !isProtectedAdmin && (
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
