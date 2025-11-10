"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { getUsers, deleteUser } from "./actions";
import { User } from "./types";
import {  UserCircleIcon } from "@heroicons/react/24/outline";
import { UserPlusIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { SpinnerOverlay } from "@/app/dashboard/components/Spinner";
import { DisableConfirmModal } from "@/app/components/DisableConfirmModal";
import { DeleteConfirmModal } from "@/app/components/DeleteConfirmModal";
import { UserForm } from "./user-form";
import { useSession, signOut } from "next-auth/react";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [confirmDisableOpen, setConfirmDisableOpen] = useState(false);
  const [userToDisableConfirm, setUserToDisableConfirm] = useState<User | null>(null);
  const { data: session, update } = useSession();

  const sessionUserId = session?.user?.id ?? null;
  const isCurrentUser = (u: User) => String(u.id) === String(sessionUserId);

  // Refresh users list
  async function refresh() {
    const all = await getUsers();
    setUsers(all);
    setSelectedUser(undefined);
    setModalOpen(false);
  }

  async function handleToggleEnabled(u: User) {
     const nextEnabled = !u.enabled;

     if (nextEnabled === false && isCurrentUser(u)) {
       setUserToDisableConfirm(u);
       setConfirmDisableOpen(true);
       return;
     }

     // Optimistic update
     setUsers(prev => 
      prev.map(p => p.id === u.id 
        ? { ...p, enabled: nextEnabled } 
        : p
      )
    );

     try {
       await performToggleEnabled(u, nextEnabled);
     } catch {
       // revert optimistic change
       setUsers(prev => prev.map(p => p.id === u.id ? { ...p, enabled: u.enabled } : p));
     } finally {
       setUpdatingId(null);
     }
   }

  // Extracted network/update logic so it can be called from the modal confirm too
  async function performToggleEnabled(u: User, nextEnabled: boolean) {
    const id = String(u.id);
    setUpdatingId(id);
    // form data (only append optional fields if present)
    const formData = new FormData();
    formData.append("id", id);
    // Append optional fields only when present to avoid sending nulls
    if (typeof u.name === "string" && u.name.length > 0) formData.append("name", u.name);
    if (typeof u.email === "string" && u.email.length > 0) formData.append("email", u.email);
    if (typeof u.role === "string" && u.role.length > 0) formData.append("role", u.role);
    formData.append("enabled", nextEnabled ? "true" : "false");

    try {
      const res = await fetch("/api/users/update", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Failed to update");

      if (isCurrentUser(u)) {
        await update();
      }

      await refresh();
    } catch (e) {
      // revert optimistic change
      setUsers(prev => prev.map(p => p.id === u.id ? { ...p, enabled: u.enabled } : p));
      throw e;
    } finally {
      setUpdatingId(null);
    }
  }

  // Confirm disable modal handlers
  async function handleConfirmDisable() {
    await performToggleEnabled(userToDisableConfirm!, false);
    await signOut({ callbackUrl: "/login" });
    return;
  }

  function handleCancelDisable() {
    setConfirmDisableOpen(false);
    setUserToDisableConfirm(null);
  }


  useEffect(() => {
    refresh();
  }, []);

  function handleAddNew() {
    setSelectedUser(undefined);
    setModalOpen(true);
  }

  function handleEditUser(user: User) {
    setSelectedUser(user);
    setModalOpen(true);
  }

  function handleDeleteUser(user: User) {
    setUserToDelete(user);
    setConfirmOpen(true);
  }

  function confirmDeleteUser() {
    if (userToDelete) {
      setDeleting(true);
      deleteUser(String(userToDelete.id)).then(() => {
        setDeleting(false);
        refresh();
        setConfirmOpen(false);
        setUserToDelete(null);
      });
    }
  }

  // Get the user being updated to determine message
  // Note: After optimistic update, enabled state is already toggled
  const updatingUser = updatingId 
    ? users.find(u => String(u.id) === String(updatingId))
    : null;
  // If enabled is true after toggle, we were enabling (going from false to true)
  // If enabled is false after toggle, we were disabling (going from true to false)
  const isEnabling = updatingUser?.enabled === true;
  const updatingMessage = isEnabling ? "Enabling user…" : "Disabling user…";

  return (
    <DashboardLayout>
      <div className="min-h-screen p-8" aria-busy={Boolean(updatingId)}>
        {/* Blocking overlay shown while a toggle/update is in progress */}
        {updatingId && <SpinnerOverlay message={updatingMessage} />}
         <div className="flex items-center justify-between mb-8">
           <h3 className="text-3xl font-bold">Users</h3>
           <button
             onClick={handleAddNew}
             className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition"
             title="Add new user"
             disabled={Boolean(updatingId)}
           >
             <UserPlusIcon className="h-6 w-6" />
           </button>
         </div>

        <div className="bg-white rounded-xl shadow p-6">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Image</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-left">Enabled</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: User) => (
                <tr key={user.id} className="border-b hover:bg-blue-50">
                  <td className="pl-2 pr-1 py-2 w-12">
                    {user.image?.url ? (
                      <Image
                        src={user.image.url}
                        alt={user.name || "User"}
                        width={40}
                        height={40}
                        className="rounded-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full flex items-center justify-center">
                        <UserCircleIcon className="text-gray-700 h-7 w-7" />
                      </div>
                    )}
                  </td>
                  <td className="py-2 pl-0">{user.name}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{user.role}</td>
                  <td className="px-4 py-2 text-center">
                    {(() => {
                      const isAdmin = user.email === "admin@example.com";
                      const isBusy = updatingId === String(user.id);
                      const colorClass = user.enabled ? "bg-green-500" : "bg-gray-300";
                      // For admin keep the green but attenuated (opacity), remove grayscale so color remains visible
                      const stateClass = isAdmin
                        ? "opacity-60 cursor-not-allowed"
                        : isBusy
                        ? "opacity-60 cursor-wait"
                        : "cursor-pointer";

                      return (
                        <button
                          type="button"
                          onClick={() => handleToggleEnabled(user)}
                          disabled={isAdmin || isBusy}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${colorClass} ${stateClass}`}
                          title={user.enabled ? "Disable user" : "Enable user"}
                          aria-disabled={isAdmin || isBusy}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${user.enabled ? "translate-x-5" : "translate-x-1"}`}
                          />
                        </button>
                      );
                    })()}
                  </td>
                  <td className="px-4 py-2 h-[50px]">
                    <div className="flex items-center gap-2 h-full">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded transition"
                        title="Edit user"
                      >
                        <span className="text-xs font-semibold text-blue-600">EDIT</span>
                      </button>
                      {user.email !== "admin@example.com" && (
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-800 p-1 rounded transition"
                          title="Delete user"
                        >
                          <span className="text-xs font-semibold text-red-600 hover:text-red-800">REMOVE</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 w-[700px] overflow-auto relative" style={{ minWidth: 400, maxHeight: "90vh" }}>
              <button
                onClick={() => setModalOpen(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
              >
                ×
              </button>
              <UserForm
                existing={selectedUser}
                onSaved={async () => {
                  setModalOpen(false);
                  await refresh();
                }}
              />
            </div>
          </div>
        )}
        {confirmOpen && userToDelete && (
          <DeleteConfirmModal
            open={confirmOpen}
            title="Confirm Deletion"
            message={`Are you sure you want to delete the user "${userToDelete.name}"? This action cannot be undone.`}
            onCancel={() => {
              if (!deleting) setConfirmOpen(false);
            }}
            onConfirm={confirmDeleteUser}
            loading={deleting}
          />
        )}
        {/* Modal shown when the signed-in user attempts to disable their own account */}
        {confirmDisableOpen && userToDisableConfirm && (
          <DisableConfirmModal
            open={confirmDisableOpen}
            title="Disable your own account?"
            message={`Disabling your own account will sign you out immediately. Are you sure you want to continue?`}
            onCancel={handleCancelDisable}
            onConfirm={handleConfirmDisable}
            loading={Boolean(updatingId)}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
