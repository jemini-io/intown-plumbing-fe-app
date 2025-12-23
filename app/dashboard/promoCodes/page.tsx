"use client";

import { memo, useState, useCallback } from "react";
import { DashboardCard } from "../components/DashboardCard";
import DashboardLayout from "../components/DashboardLayout";
import { PromoCodeCardsPanel } from "./components/PromoCodeCardsPanel";
import { PromoCodeForm } from "./components/PromoCodeForm";

const PromoCodesCard = memo(function PromoCodesCard() {
  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedPromoCode] = useState(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  const toggle = useCallback(() => setExpanded(e => !e), []);
  const openModal = useCallback(() => setShowModal(true), []);
  const closeModal = useCallback(() => setShowModal(false), []);

  const PromoCodeCardsPanelMemo = useCallback(
    () => <PromoCodeCardsPanel key={refreshKey} limit={expanded ? undefined : 10} />,
    [expanded, refreshKey]
  );

  return (
    <DashboardCard
      backgroundEnabled={false}
      ViewAllEnable={false}
      viewAllLabel={expanded ? "Collapse" : "View All Promo Codes"}
      onViewAll={toggle}
      iconsData={{ plusIconTitle: "Add Promo Code" }}
      listView={PromoCodeCardsPanelMemo}
      showHeader={true}
      title="Promo Codes"
      showViewAllLink={true}
      actionLabel="Add Promo Code"
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
              <PromoCodeForm
                existing={selectedPromoCode}
                onSaved={() => {
                  closeModal();
                  setRefreshKey(k => k + 1);
                }}
              />
            </div>
          </div>
        )
      }
    />
  );
});

export default function PromoCodesPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        <PromoCodesCard />
      </div>
    </DashboardLayout>
  );
}

