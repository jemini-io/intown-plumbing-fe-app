"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { getUsers, deleteUser } from "./actions";
import { UserForm } from "./user-form";
import { User } from "./types";
import { PencilIcon, TrashIcon, PlusIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-lg p-8 min-w-[350px] relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Refresh users list
  async function refresh() {
    const all = await getUsers();
    setUsers(all);
    setSelectedUser(null);
    setModalOpen(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleAddNew() {
    setSelectedUser(null);
    setModalOpen(true);
  }

  function handleEditUser(user: User) {
    setSelectedUser(user);
    setModalOpen(true);
  }

  function handleDeleteUser(user: User) {
    if (user.email === "admin@example.com") return;
    if (!confirm(`Are you sure you want to delete "${user.name || user.email}"?`)) return;
    deleteUser(String(user.id)).then(() => refresh());
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-3xl font-bold">Users</h3>
          <button
            onClick={handleAddNew}
            className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition"
            title="Add new user"
          >
            <PlusIcon className="h-6 w-6" />
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
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-blue-50">
                  <td className="pl-2 pr-1 py-2 w-12">
                    {user.image?.url ? (
                      <Image
                        src={user.image.url}
                        alt={user.name || "User"}
                        width={45}
                        height={45}
                        className="rounded-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full flex items-center justify-center">
                        <UserCircleIcon className="text-gray-700" />
                      </div>
                    )}
                  </td>
                  <td className="py-2 pl-0">{user.name}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">{user.role}</td>
                  <td className="px-4 py-2 h-[50px]">
                    <div className="flex items-center gap-2 h-full">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded transition"
                        title="Edit user"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      {user.email !== "admin@example.com" && (
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-800 p-1 rounded transition"
                          title="Delete user"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <UserForm existing={selectedUser ?? undefined} onSaved={refresh} />
        </Modal>
      </div>
    </DashboardLayout>
  );
}
