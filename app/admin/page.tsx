"use client";

import AdminLayout from "./components/AdminLayout";


export default function AdminPage() {
  return (
    <AdminLayout>
        <h2 className="text-lg font-bold">Welcome to the Admin Panel</h2>
        <p>Select an option from the menu to admin the app managable stuff.</p>
    </AdminLayout>
  );
}
