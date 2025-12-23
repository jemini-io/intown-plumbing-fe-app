"use client";

import { memo, useState, useCallback } from "react";
import { DashboardCard } from "../components/DashboardCard";
import DashboardLayout from "../components/DashboardLayout";
import { TechnicianToSkillsListView } from "./components/TechnicianToSkillsListView";

const TechniciansCard = memo(function TechniciansCard() {
  const [expanded, setExpanded] = useState(false);
  const toggle = useCallback(() => setExpanded(e => !e), []);
  const ListView = useCallback(
    () => <TechnicianToSkillsListView limit={expanded ? undefined : 5} />,
    [expanded]
  );
  return (
    <DashboardCard
      viewAllLabel={expanded ? "Collapse" : "View All Technicians"}
      onViewAll={toggle}
      iconsData={{ plusIconTitle: "Add Service" }}
      listView={ListView}
    />
  );
});

export default function TechniciansPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold dark:text-white">Technicians</h1>
        </div>
          <TechniciansCard />
      </div>
    </DashboardLayout>
  );
}