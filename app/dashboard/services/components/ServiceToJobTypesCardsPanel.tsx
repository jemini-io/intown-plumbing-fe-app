import React, { useEffect, useState } from "react";
import { ServiceToJobType } from "@/lib/types/serviceToJobType";
import { getAllServiceToJobTypes, updateService, deleteService, unlinkSkillFromService } from "../actions";
import { ServiceToJobTypesForm } from "./ServiceToJobTypesForm";
import ServiceToJobTypesCard from "./ServiceToJobTypesCard";
import { DeleteConfirmModal } from "@/app/components/DeleteConfirmModal";

export interface ServiceToJobTypesCardPanelProps {
  limit?: number;
}

export function ServiceToJobTypesCardsPanel(props: ServiceToJobTypesCardPanelProps) {
  const [allServiceToJobTypes, setAllServiceToJobTypes] = useState<ServiceToJobType[] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceToJobType | undefined>(undefined);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<ServiceToJobType | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Unlink modal state
  const [unlinkModalOpen, setUnlinkModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [unlinkLoading, setUnlinkLoading] = useState(false);

  async function refresh() {
    const services: ServiceToJobType[] = await getAllServiceToJobTypes();
    setAllServiceToJobTypes(services);
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleEditService(service: ServiceToJobType) {
    setSelectedService(service);
    setModalOpen(true);
  }

  function handleDeleteService(service: ServiceToJobType) {
    setServiceToDelete(service);
    setConfirmOpen(true);
  }

  const confirmDelete = () => {
    if (serviceToDelete) {
      setDeleting(true);
      deleteService(String(serviceToDelete.id)).then(() => {
        setDeleting(false);
        refresh();
        setConfirmOpen(false);
        setServiceToDelete(null);
      });
    }
  };

  // Unlink logic
  function handleUnlinkSkillRequest(serviceId: string, skillId: string) {
    setSelectedServiceId(serviceId);
    setSelectedSkillId(skillId);
    setUnlinkModalOpen(true);
  }

  async function handleConfirmUnlinkSkill() {
    if (!selectedServiceId || !selectedSkillId) return;
    setUnlinkLoading(true);
    await unlinkSkillFromService(selectedServiceId, selectedSkillId);
    setUnlinkLoading(false);
    setUnlinkModalOpen(false);
    setSelectedServiceId(null);
    setSelectedSkillId(null);
    refresh();
  }

  const servicesToRender = props.limit
    ? (allServiceToJobTypes ?? []).slice(0, props.limit)
    : (allServiceToJobTypes ?? []);

  async function handleToggleEnabled(service: ServiceToJobType) {
    const id = String(service.id);
    const nextEnabled = !service.enabled;

    // Optimistic update
    setAllServiceToJobTypes(prev =>
      prev
        ? prev.map(item =>
            String(item.id) === id
              ? { ...item, enabled: nextEnabled }
              : item
          )
        : prev
    );
    try {
      await updateService(id, { enabled: nextEnabled, skillIds: service.skills?.map(s => s.id) ?? [] });
      await refresh();
    } catch {
      await refresh();
    }
  }

  return (
    <>
      <div className="space-y-2 mt-2">
        {servicesToRender?.map(service => (
          <ServiceToJobTypesCard
            key={service.id}
            service={service}
            onToggleEnabled={handleToggleEnabled}
            onEdit={handleEditService}
            onRemove={handleDeleteService}
            onUnlinkSkill={handleUnlinkSkillRequest}
          />
        ))}
      </div>
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-[700px] overflow-auto relative" style={{ minWidth: 400, maxHeight: "90vh" }}>
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
            >
              ×
            </button>
            <ServiceToJobTypesForm
              existing={selectedService}
              onSaved={async () => {
                setModalOpen(false);
                await refresh();
              }}
            />
          </div>
        </div>
      )}
      {confirmOpen && serviceToDelete && (
        <DeleteConfirmModal
          open={confirmOpen}
          title="Confirm Deletion"
          message={`Are you sure you want to delete the service "${serviceToDelete.displayName}"? This action cannot be undone.`}
          onCancel={() => {
            if (!deleting) setConfirmOpen(false);
          }}
          onConfirm={confirmDelete}
          loading={deleting}
        />
      )}
      <DeleteConfirmModal
        open={unlinkModalOpen}
        title="Confirm Unlink"
        message="Are you sure you want to unlink this skill from the service?"
        onCancel={() => setUnlinkModalOpen(false)}
        onConfirm={handleConfirmUnlinkSkill}
        loading={unlinkLoading}
        confirmLabel="Unlink"
        loadingLabel="Unlinking..."
      />
    </>
  );
}
