"use client";

import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { getUsers } from "./actions";
import { UserForm } from "./user-form";
import { User } from "./types" 

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);

  // Refresh users list
  async function refresh() {
    const all = await getUsers();
    setUsers(all);
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <AdminLayout>
      <h3 className="text-xl font-bold">Users</h3>

      {/* Form to add new user */}
      <UserForm onSaved={refresh} />

      {/* Existing users */}
      <div className="space-y-2 mt-4">
        {users.map((user) => (
          <UserForm key={user.id} existing={user} onSaved={refresh} />
        ))}
      </div>
    </AdminLayout>
  );
}
