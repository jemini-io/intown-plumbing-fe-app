"use client";

import AdminHeader from "./components/AdminHeader";

export default function AdminPage() {
  return (
    <div className="space-y-6 pt-20">
      <AdminHeader />
      <div className="p-4">
        <h2 className="text-lg font-bold">Welcome to the Admin Dashboard</h2>
        <p>Select an option from the menu to manage your application.</p>
      </div>
    </div>
  );
}
