"use client";

import { memo, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { DashboardCard } from "../components/DashboardCard";
import DashboardLayout from "../components/DashboardLayout";
import { ServiceToJobTypesListView } from "./components/ServiceToJobTypesListView";

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

export default function BookingsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Service Offered</h1>
        </div>
        <ServicesCard />
        {/* <div className="bg-white rounded-lg shadow p-6"> */}
          {/* <ServiceToJobTypesListView  */}
            {/* limit={10} */}
          {/* /> */}
        {/* </div> */}
      </div>
    </DashboardLayout>
  );
}