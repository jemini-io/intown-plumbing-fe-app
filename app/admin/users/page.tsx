"use client";

import { useEffect, useState } from "react";
import AdminHeader from "../components/AdminHeader";
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
    <div className="space-y-6 pt-20">
      <AdminHeader />

      <div className="p-4">
        <h3 className="text-xl font-bold">Users</h3>

        {/* Form to add new user */}
        <UserForm onSaved={refresh} />

        {/* Existing users */}
        <div className="space-y-2 mt-4">
          {users.map((user) => (
            <UserForm key={user.id} existing={user} onSaved={refresh} />
          ))}
        </div>
      </div>
    </div>
  );
}
