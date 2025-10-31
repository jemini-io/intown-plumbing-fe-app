"use client";

import { memo, useState, useCallback } from "react";
import { DashboardCard } from "../components/DashboardCard";
import DashboardLayout from "../components/DashboardLayout";
import { SkillCardsPanel } from "./components/SkillCardsPanel";
import { SkillForm } from "./components/SkillForm";

const SkillsCard = memo(function SkillsCard() {
  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedSkill] = useState(undefined);

  const toggle = useCallback(() => setExpanded(e => !e), []);
  const openModal = useCallback(() => setShowModal(true), []);
  const closeModal = useCallback(() => setShowModal(false), []);

  const SkillCardsPanelMemo = useCallback(
    () => <SkillCardsPanel limit={expanded ? undefined : 5} />,
    [expanded]
  );

  return (
    <DashboardCard
      backgroundEnabled={false}
      ViewAllEnable={false}
      viewAllLabel={expanded ? "Collapse" : "View All Skills"}
      onViewAll={toggle}
      iconsData={{ plusIconTitle: "Add Skill" }}
      listView={SkillCardsPanelMemo}
      showHeader={true}
      title="Skills"
      showViewAllLink={true}
      actionLabel="Add Skill"
      onAction={openModal}
      modalContent={
        showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 w-[700px] overflow-auto relative" style={{ minWidth: 400, maxHeight: "90vh" }}>
              <button
                onClick={closeModal}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
              >
                ×
              </button>
              <SkillForm
                existing={selectedSkill}
                onSaved={() => {
                  closeModal();
                  // Si necesitas, refresca la lista o muestra feedback
                }}
              />
            </div>
          </div>
        )
      }
    />
  );
});

export default function SkillsPage() {
  return (
    <DashboardLayout>
      <div className="min-h-screen p-8">
        <SkillsCard />
      </div>
    </DashboardLayout>
  );
}