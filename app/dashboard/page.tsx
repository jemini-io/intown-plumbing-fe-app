"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "./components/DashboardLayout";
import { DashboardCard, DashboardCardObject } from "./components/DashboardCard";
import { ServiceToJobType } from "@/lib/types/serviceToJobType";
import { TechnicianToSkillsType } from "@/lib/types/technicianToSkillsType";
import { getServiceToJobTypes, getTechniciansToSkills } from "./actions";

// const fakeServices = [
//   { name: "Leak Repair", description: "Fixing leaks in pipes and fixtures" },
//   { name: "Drain Cleaning", description: "Clearing clogged drains and sewers" },
//   { name: "Water Heater Installation", description: "Installing and repairing water heaters" },
//   { name: "Pipe Replacement", description: "Replacing old or damaged pipes" },
//   { name: "Emergency Plumbing", description: "24/7 emergency plumbing services" },
// ];
// const services = fakeServices.slice(0, 3); // Show only 3 for brevity

// const fakeTechnicians = [
//   { name: "John Smith", role: "Plumber" },
//   { name: "Anderson Smith", role: "Technician" },
//   { name: "Jason Smith", role: "Supervisor" },
// ];

// const technicians = fakeTechnicians.slice(0, 3); // Show only 3 for brevity


export default function DashboardPage() {
  const [services, setServices] = useState<ServiceToJobType[]>([]);
  const [technicians, setTechnicians] = useState<TechnicianToSkillsType[]>([]);
  
  useEffect(() => {
    async function fetchData() {
      const fetchedServices = await getServiceToJobTypes();
      setServices(fetchedServices);

      const fetchedTechnicians = await getTechniciansToSkills();
      setTechnicians(fetchedTechnicians);
    }
    fetchData();
  }, []);
  
  return (
    <DashboardLayout>
      <div className="bg-gray-100 min-h-screen p-8 space-y-8 rounded-lg">
        <h1 className="text-3xl font-bold mb-8">Intown Plumbing App Dashboard</h1>

        {/* Grid section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Column 1: 2 cards */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-6">
              <DashboardCard
                cardTitle="Service Offered"
                objects={services.map(s => ({
                  name: s.displayName,
                  description: s.description,
                })) as DashboardCardObject[]}
                onAdd={() => {/* handle add service */}}
                onEdit={(service) => {/* handle edit service */}}
                onRemove={(service) => {/* handle remove service */}}
                viewAllLabel="View All Services"
                onViewAll={() => {/* handle view all services */}}
                iconsData={{
                  plusIconTitle: "Add new service",
                  editIconTitle: "Edit service",
                  removeIconTitle: "Remove service",
                }}
              />
            </div>
          </div>

          {/* Column 2: 3 cards */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-6">
              <DashboardCard
                cardTitle="Technicians"
                objects={technicians.map(t => ({
                  name: t.technicianName,
                  description: t.skills.join("\n"),
                })) as DashboardCardObject[]}
                onAdd={() => {/* handle add technician */}}
                onEdit={(tech) => {/* handle edit technician */}}
                onRemove={(tech) => {/* handle remove technician */}}
                viewAllLabel="View All Technicians"
                onViewAll={() => {/* handle view all technicians */}}
                iconsData={{
                  plusIconTitle: "Add new technician",
                  editIconTitle: "Edit technician",
                  removeIconTitle: "Remove technician",
                }}
              />
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
