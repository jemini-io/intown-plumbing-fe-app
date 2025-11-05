"use client";

import { useTransition, useState, useRef, useEffect } from "react";
import { User } from "./types";
import Image from "next/image";
import { UserCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import PasswordInput from "@/components/PasswordInput";
import { useSession, signOut } from "next-auth/react";
import { DisableConfirmModal } from "@/app/components/DisableConfirmModal";


type UserFormProps = {
  existing?: User;
  onSaved: () => void;
  title?: string;
};

export function UserForm({ existing, onSaved, title }: UserFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    existing?.image?.url ?? null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [password, setPassword] = useState<string>("");
  const [removeImage, setRemoveImage] = useState(false);
  const [enabled, setEnabled] = useState<boolean>(existing ? (existing.enabled ?? true) : true);
  const [confirmDisableOpen, setConfirmDisableOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { data: session, update } = useSession();
 const isCurrentUser = !!existing && !!session?.user?.id && String(existing.id) === String(session.user.id);

  // Only show the enabled pill to admins editing other users (not for self-edit)
  const isCurrentUserAnAdmin = session?.user?.role === "ADMIN";
  // const isSelf = !!existing && String(session?.user?.id) === String(existing.id);
  const isProtectedAdmin = existing?.email === "admin@example.com";
  const adminStateClass = isProtectedAdmin ? "opacity-60 cursor-not-allowed" : "";

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

      if (imageFile) {
        formData.set("image", imageFile);
      }
      if (removeImage) {
        formData.set("removeImage", "true");
      }
      if (password) {
        formData.set("password", password);
      }

      try {
        let response;
        if (existing?.id) {
          formData.set("id", existing.id);
          response = await fetch("/api/users/update", {
            method: "POST",
            body: formData,
          });
        } else {
          response = await fetch("/api/users/create", {
            method: "POST",
            body: formData,
          });
        }

        const result = await response.json();
        if (response.ok) {
          setMessage({
            type: "success",
            text: existing ? "User updated successfully!" : "User created successfully!",
          });
          if (!existing) {
            formRef.current?.reset();
            setImagePreview(null);
            setImageFile(null);
          }

          const isCurrentUser = existing?.id && session?.user?.id && String(existing.id) === String(session.user.id);
          const nextEnabled = formData.get("enabled") === "true";

          if (isCurrentUser && nextEnabled === false) {
            await signOut({ callbackUrl: "/login" });
            return;
          }

          if (isCurrentUser) {
            try { await update(); } catch {} finally {};
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

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-center">
        {title ?? (existing ? `Edit user ${existing.name}` : "Add new user")}
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
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            name="name"
            defaultValue={existing?.name ?? ""}
            className="w-full border rounded p-2"
            required
          />
        </div>
        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            name="role"
            defaultValue={existing?.role ?? "USER"}
            className="w-full border rounded p-2"
            required
            disabled={isProtectedAdmin || !isCurrentUserAnAdmin}
          >
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
          {(isProtectedAdmin || !isCurrentUserAnAdmin) && (
            <input
              type="hidden"
              name="role"
              value={existing?.role ?? "USER"}
            />
          )}
        </div>
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            defaultValue={existing?.email ?? ""}
            className="w-full border rounded p-2"
            required
            disabled={isProtectedAdmin}
          />
          {isProtectedAdmin && (
            <input
              type="hidden"
              name="email"
              value={existing?.email ?? ""}
            />
          )}
        </div>
        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!existing}
            placeholder={existing ? "Leave blank to keep current password" : "••••••••"}
          />
        </div>

        {isCurrentUserAnAdmin && !isCurrentUser&& (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Enabled</span>
            <button
              type="button"
              name="enabled"
              role="switch"
              aria-checked={enabled}
              aria-disabled={isProtectedAdmin}
              onClick={() => setEnabled(v => !v)}
              disabled={isProtectedAdmin}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${enabled ? "bg-green-500" : "bg-gray-300"} ${adminStateClass}`}
              title={isProtectedAdmin ? "Protected admin — not editable" : enabled ? "Disable user" : "Enable user"}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${enabled ? "translate-x-5" : "translate-x-1"}`}
              />
            </button>
          </div>
        )}

        {/* For self-editing user show pill but intercept disable to ask confirmation */}
        {isCurrentUserAnAdmin && isCurrentUser && (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Enabled</span>
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              aria-disabled={isProtectedAdmin}
              onClick={() => {
                const next = !enabled;
                if (next === false && !isProtectedAdmin) {
                  // show warning modal and do not toggle immediately
                  setConfirmDisableOpen(true);
                  return;
                }
                if (!isProtectedAdmin) setEnabled(next);
              }}
              disabled={isProtectedAdmin}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${enabled ? "bg-green-500" : "bg-gray-300"} ${adminStateClass}`}
              title={isProtectedAdmin ? "Protected admin — not editable" : enabled ? "Disable user" : "Enable user"}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${enabled ? "translate-x-5" : "translate-x-1"}`}
              />
            </button>
          </div>
        )}

        <input type="hidden" name="enabled" value={enabled === true ? "true" : "false"} />

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
        </div>
        {/* Pic Preview | Upload input */}
        <div className="col-span-2 flex items-center gap-6">
          {/* Preview */}
          <div className="relative">
            {imagePreview ? (
              <>
                <Image
                  src={imagePreview}
                  alt="User image"
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
            {isPending ? "Saving..." : existing ? "Update" : "Add"}
          </button>
        </div>
      </form>
      {/* Modal shown when the signed-in user attempts to disable their own account */}
      {confirmDisableOpen && (
        <DisableConfirmModal
          open={confirmDisableOpen}
          title="Disable your own account?"
          message="Disabling your own account here will sign you out when you save changes. Are you sure you want to continue?"
          onCancel={() => {
            setConfirmDisableOpen(false);
            // ensure pill stays enabled when cancelling
            setEnabled(true);
          }}
          onConfirm={() => {
            setConfirmDisableOpen(false);
            setEnabled(false);
          }}
          loading={false}
        />
      )}
    </div>
  );
}
