"use client";

import DashboardLayout from "./components/DashboardLayout";
import { DashboardCard } from "./components/DashboardCard";
import { ServiceToJobTypesListView } from "./services/components";
import { TechnicianToSkillsListView } from "./technicians/components";
import { BookingsListView } from "./bookings/components/BookingsListView";

const BookingsListViewWrapper = () => (
  <BookingsListView showHeader={true} canEdit={false} canDelete={false} />
);

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="bg-gray-100 min-h-screen p-8 space-y-8 rounded-lg">
        <h1 className="text-3xl font-bold mb-8">Intown Plumbing App Dashboard</h1>

        {/* Grid section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-6">
              <DashboardCard
                viewAllLabel="View All Services"
                onViewAll={() => {}}
                iconsData={{ plusIconTitle: "Add Service" }}
                listView={ServiceToJobTypesListView}
              />
            </div>
            <div className="flex flex-col gap-6">
              <DashboardCard
                viewAllLabel="View All Bookings"
                onViewAll={() => {}}
                iconsData={{ plusIconTitle: "Add Booking" }}
                listView={BookingsListViewWrapper}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-6">
              <DashboardCard
                viewAllLabel="View All Technicians"
                onViewAll={() => {}}
                iconsData={{ plusIconTitle: "Add Technician" }}
                listView={TechnicianToSkillsListView}
              />
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
