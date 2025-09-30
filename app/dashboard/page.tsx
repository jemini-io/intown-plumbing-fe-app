"use client";

import { memo, useState, useCallback } from "react";
import DashboardLayout from "./components/DashboardLayout";
import { DashboardCard } from "./components/DashboardCard";
import { ServiceToJobTypesListView } from "./services/components";
import { TechnicianToSkillsListView } from "./technicians/components";
import { BookingsListView } from "./bookings/components/BookingsListView";

// Optional: if DashboardCard not already memoized and you want to reduce renders,
// you can wrap it in React.memo at its definition file instead.

const ServicesCard = memo(function ServicesCard() {
  const [expanded, setExpanded] = useState(false);
  const toggle = useCallback(() => setExpanded(e => !e), []);
  const ListView = useCallback(
    () => <ServiceToJobTypesListView limit={expanded ? undefined : 3} />,
    [expanded]
  );
  return (
    <DashboardCard
      viewAllLabel={expanded ? "Collapse" : "View All Services"}
      onViewAll={toggle}
      iconsData={{ plusIconTitle: "Add Service" }}
      listView={ListView}
    />
  );
});

const TechniciansCard = memo(function TechniciansCard() {
  const [expanded, setExpanded] = useState(false);
  const toggle = useCallback(() => setExpanded(e => !e), []);
  const ListView = useCallback(
    () => <TechnicianToSkillsListView limit={expanded ? undefined : 3} />,
    [expanded]
  );
  return (
    <DashboardCard
      viewAllLabel={expanded ? "Collapse" : "View All Technicians"}
      onViewAll={toggle}
      iconsData={{ plusIconTitle: "Add Technician" }}
      listView={ListView}
    />
  );
});

const BookingsCard = memo(function BookingsCard() {
  const [expanded, setExpanded] = useState(false);
  const toggle = useCallback(() => setExpanded(e => !e), []);
  const ListView = useCallback(
    () => (
      <div className="overflow-x-hidden">
        <BookingsListView
          showHeader
          canEdit={false}
          canDelete={false}
          limit={expanded ? undefined : 3}
        />
      </div>
    ),
    [expanded]
  );
  return (
    <DashboardCard
      viewAllLabel={expanded ? "Collapse" : "View All Bookings"}
      onViewAll={toggle}
      iconsData={{ plusIconTitle: "Add Booking" }}
      listView={ListView}
    />
  );
});

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="bg-gray-100 min-h-screen p-8 space-y-8 rounded-lg">
        <h1 className="text-3xl font-bold mb-8">Intown Plumbing App Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col gap-6">
            <ServicesCard />
          </div>
          <div className="flex flex-col gap-6">
            <TechniciansCard />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <BookingsCard />
        </div>
      </div>
    </DashboardLayout>
  );
}
