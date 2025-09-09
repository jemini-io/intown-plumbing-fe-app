"use client";

import { get } from "http";
import DashboardLayout from "./components/DashboardLayout";



const fakeTechnicians = [
  { name: "John Smith", role: "Plumber" },
  { name: "Anderson Smith", role: "Technician" },
  { name: "Jason Smith", role: "Supervisor" },
];

const technicians = fakeTechnicians.slice(0, 3); // Show only 3 for brevity
// const technicians = getTechnicians(); // Assume this fetches the actual list of technicians


export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="bg-gray-100 min-h-screen p-8 space-y-8 rounded-lg">
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
              
              {/* Reduced list of 3 technicians */}
              <div className="mt-4">
                <ul className="divide-y divide-gray-200">
                  {technicians.map((tech, idx) => (
                    <li key={idx} className="py-2 flex items-center gap-3">
                      <span className="font-medium">{tech.name}</span>
                      <span className="text-xs text-gray-500">{tech.role}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Button to view all technicians */}
              <div className="mt-4">
                <button className="text-blue-500 hover:underline font-medium">
                  View All Technicians
                </button>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold">Appointments and Links</h2>
              <p className="mt-2 text-gray-600">Upcoming appointments and useful links...</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

