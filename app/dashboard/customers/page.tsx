"use client";

import { memo, useState, useCallback } from "react";
import { DashboardCard } from "../components/DashboardCard";
import DashboardLayout from "../components/DashboardLayout";
import { CustomerListView } from "./components/CustomerListView";

const CustomersCard = memo(function CustomersCard() {
  const [expanded, setExpanded] = useState(false);
  const toggle = useCallback(() => setExpanded(e => !e), []);
  const ListView = useCallback(
    () => <CustomerListView limit={expanded ? undefined : 5} />,
    [expanded]
  );
  return (
    <DashboardCard
      viewAllLabel={expanded ? "Collapse" : "View All Customers"}
      onViewAll={toggle}
      iconsData={{ plusIconTitle: "Add Customer" }}
      listView={ListView}
    />
  );
});

export default function CustomersPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold dark:text-white">Customers</h1>
        </div>
        <CustomersCard />
      </div>
    </DashboardLayout>
  );
}