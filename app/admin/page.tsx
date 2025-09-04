"use client";

import AdminLayout from "./components/AdminLayout";


export default function AdminPage() {
  return (
    <AdminLayout>
      <div className="min-h-screen  p-8 space-y-8">
        <h2 className="text-3xl font-bold mb-8">Welcome to the Admin Panel</h2>
        <p>Select an option to admin some app managable stuff.</p>
      </div>
    </AdminLayout>
  );
}
