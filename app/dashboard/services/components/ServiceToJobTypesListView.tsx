import React, { useEffect, useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ServiceToJobType } from "@/lib/types/serviceToJobType";
import { Setting } from "@/lib/types/setting";
import { getServiceToJobsTypeSetting, updateService, deleteService } from "../actions";
import { ServiceToJobTypesForm } from "./ServiceToJobTypesForm";
import { DeleteConfirmModal } from "@/app/components/DeleteConfirmModal";

export interface ServiceToJobTypesListViewProps {
  limit?: number;
}

export function ServiceToJobTypesListView(props: ServiceToJobTypesListViewProps) {
  const [serviceToJobsTypeSetting, setServiceToJobsTypeSetting] = useState<Setting | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceToJobType | undefined>(undefined);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<ServiceToJobType | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [services, setServices] = useState<ServiceToJobType[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function refresh() {
    const s = await getServiceToJobsTypeSetting();
    setServiceToJobsTypeSetting(s);
  }

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!serviceToJobsTypeSetting?.value) {
      setServices([]);
      return;
    }
    try {
      const parsed: ServiceToJobType[] = JSON.parse(serviceToJobsTypeSetting.value);
      setServices(
        parsed.map(s => ({
          ...s,
          enabled: s.enabled !== false // default true if missing (backward compatibility)
        }))
      );
    } catch {
      setServices([]);
    }
  }, [serviceToJobsTypeSetting?.value]);

  function handleAdd() {
    setSelectedService(undefined);
    setModalOpen(true);
  }

  function handleEdit(service: ServiceToJobType) {
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
      deleteService(String(serviceToDelete.serviceTitanId)).then(() => {
        setDeleting(false);
        refresh();
        setConfirmOpen(false);
        setServiceToDelete(null);
      });
    }
  };

  const servicesToRender = props.limit ? services.slice(0, props.limit) : services;

  async function handleToggleEnabled(svc: ServiceToJobType) {
    const id = String(svc.serviceTitanId);
    const next = !svc.enabled;
    setUpdatingId(id);
    // Optimistic update
    setServices(prev =>
      prev.map(item =>
        String(item.serviceTitanId) === id ? { ...item, enabled: next } : item
      )
    );
    try {
      const updatedList = await updateService(id, { enabled: next });
      // Sync with persisted result (normalize)
      const normalized = updatedList.map(s => ({
        ...s,
        enabled: s.enabled !== false
      }));
      setServices(normalized);
      setServiceToJobsTypeSetting(prev =>
        prev ? { ...prev, value: JSON.stringify(updatedList) } : prev
      );
    } catch {
      await refresh(); // revert
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-semibold">Services Offered</h2>
        <button
          className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition"
          title="Add new service"
          onClick={handleAdd}
        >
          <PlusIcon className="h-6 w-6" />
        </button>
      </div>
      {/* Header */}
      <div className="grid grid-cols-12 px-2 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 border-b">
        <div className="col-span-3">Name</div>
        <div className="col-span-5">Description</div>
        <div className="col-span-2 text-center">Enabled</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>
      <ul>
        {servicesToRender?.map(service => (
          <li
            key={service.serviceTitanId}
            className="grid grid-cols-12 items-start px-2 py-3 border-b last:border-b-0 hover:bg-blue-50"
          >
            <div className="col-span-3 pr-2">
              <span className="font-medium">{service.displayName}</span>
            </div>
            <div className="col-span-5 pr-2">
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {service.description}
              </p>
            </div>
            <div className="col-span-2 flex items-center justify-center">
              <button
                type="button"
                role="switch"
                aria-checked={service.enabled}
                onClick={() => handleToggleEnabled(service)}
                disabled={updatingId === String(service.serviceTitanId)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  service.enabled ? "bg-green-500" : "bg-gray-300"
                } ${
                  updatingId === String(service.serviceTitanId)
                    ? "opacity-60 cursor-wait"
                    : "cursor-pointer"
                }`}
                title={service.enabled ? "Disable service" : "Enable service"}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                    service.enabled ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <div className="col-span-2 flex items-center justify-end gap-1">
              <button
                className="text-blue-500 hover:text-blue-700 p-1"
                title="Edit"
                onClick={() => handleEdit(service)}
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                className="text-red-500 hover:text-red-700 p-1"
                title="Delete"
                onClick={() => handleDeleteService(service)}
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
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
    </>
  );
}
