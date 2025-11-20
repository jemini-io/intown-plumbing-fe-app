"use client";

import { memo, useState, useCallback } from "react";
// import { useSession } from "next-auth/react";
import { DashboardCard } from "../components/DashboardCard";
import DashboardLayout from "../components/DashboardLayout";
import { ServiceToJobTypesCardsPanel } from "./components/ServiceToJobTypesCardsPanel";
import { ServiceToJobTypesForm } from "./components/ServiceToJobTypesForm";

const ServicesCard = memo(function ServicesCard() {
  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedService] = useState(undefined);

  const toggle = useCallback(() => setExpanded(e => !e), []);
  const openModal = useCallback(() => setShowModal(true), []);
  const closeModal = useCallback(() => setShowModal(false), []);

  const ServiceCardsPanel = useCallback(
    () => <ServiceToJobTypesCardsPanel limit={expanded ? undefined : 5} />,
    [expanded]
  );

  return (
    <DashboardCard
      backgroundEnabled={false}
      ViewAllEnable={false}
      viewAllLabel={expanded ? "Collapse" : "View All Services"}
      onViewAll={toggle}
      iconsData={{ plusIconTitle: "Add Service" }}
      listView={ServiceCardsPanel}
      showHeader={true}
      title="Services"
      showViewAllLink={true}
      actionLabel="Add Service"
      onAction={openModal}
      modalContent={
        showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 w-[700px] overflow-auto relative" style={{ minWidth: 400, maxHeight: "90vh" }}>
              <button
                onClick={closeModal}
                className="absolute top-2 right-2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl font-bold"
              >
                ×
              </button>
              <ServiceToJobTypesForm
                existing={selectedService}
                onSaved={() => {
                  closeModal();
                  // if needed, refresh the list or provide feedback
                }}
              />
            </div>
          </div>
        )
      }
    />
  );
});

export default function ServicesPage() {
  // const { data: session } = useSession();
  // const isAdmin = session?.user?.role === "ADMIN";

  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        <ServicesCard />
      </div>
    </DashboardLayout>
  );
}