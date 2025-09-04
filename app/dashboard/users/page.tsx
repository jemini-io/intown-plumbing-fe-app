"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
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
    <DashboardLayout>
      <div className="min-h-screen p-8 space-y-8">
        <h3 className="text-3xl font-bold mb-8">Users</h3>

        {/* Form to add new user */}
        <UserForm onSaved={refresh} />

        {/* Existing users */}
        <div className="space-y-2 mt-4">
          {users.map((user) => (
            <UserForm key={user.id} existing={user} onSaved={refresh} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
