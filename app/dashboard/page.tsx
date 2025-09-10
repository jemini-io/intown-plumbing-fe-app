"use client";

import DashboardLayout from "./components/DashboardLayout";
import { DashboardCard } from "./components/DashboardCard";
import { ServiceToJobTypesForm, ServiceToJobTypesListView } from "./services/components";
import { TechnicianToSkillsForm, TechnicianToSkillsListView } from "./technicians/components";


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
                cardTitle="Services Offered"
                viewAllLabel="View All Services"
                onViewAll={() => {}}
                iconsData={{
                  plusIconTitle: "Add Service",
                }}
                listView={ServiceToJobTypesListView}
                form={ServiceToJobTypesForm}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-6">
              <DashboardCard
                cardTitle="Technicians"
                viewAllLabel="View All Technicians"
                onViewAll={() => {}}
                iconsData={{
                  plusIconTitle: "Add Technician",
                }}
                listView={TechnicianToSkillsListView}
                form={TechnicianToSkillsForm}
              />
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
