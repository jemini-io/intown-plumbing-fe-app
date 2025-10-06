"use client";

import { useSession } from "next-auth/react";
import DashboardLayout from "../components/DashboardLayout";
import { BookingsListView } from "./components/BookingsListView";

export default function BookingsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Bookings</h1>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <BookingsListView 
            showHeader={false}
            canEdit={isAdmin} 
            canDelete={isAdmin}
            limit={10}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}