"use client";

import AdminLayout from "../components/AdminLayout";

export default function DashboardPage() {
  return (
    <AdminLayout>
      <div className="bg-gray-100 min-h-screen p-8 space-y-8 rounded-lg">
        {/* Top heading */}
        <h1 className="text-3xl font-bold mb-8">Intown Plumbing App Dashboard</h1>

        {/* Grid section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Column 1: 2 cards */}
          <div className="flex flex-col gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold">Service Titan Business and Analytics</h2>
              <p className="mt-2 text-gray-600">Data metrics and analytics here...</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold">Service Offered</h2>
              <p className="mt-2 text-gray-600">List of services offered...</p>
            </div>
          </div>

          {/* Column 2: 3 cards */}
          <div className="flex flex-col gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold">Stripe</h2>
              <p className="mt-2 text-gray-600">Payments overview...</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold">Technician Overview</h2>
              <p className="mt-2 text-gray-600">Technician stats here...</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold">Appointments and Links</h2>
              <p className="mt-2 text-gray-600">Upcoming appointments and useful links...</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
