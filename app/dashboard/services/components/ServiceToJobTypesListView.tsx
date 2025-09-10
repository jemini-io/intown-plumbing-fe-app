import React, { useEffect, useState } from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { ServiceToJobType } from "@/lib/types/serviceToJobType";
import { Setting } from "@/lib/types/setting";
import { getServiceToJobsTypeSetting, deleteService } from "../actions";
import { ServiceToJobTypesForm } from "./ServiceToJobTypesForm";

export function ServiceToJobTypesListView() {
  const [serviceToJobsTypeSetting, setServiceToJobsTypeSetting] = useState<Setting | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceToJobType | null>(null);

  async function refresh() {
    const s = await getServiceToJobsTypeSetting();
    setServiceToJobsTypeSetting(s);
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleEdit(service: ServiceToJobType) {
    setSelectedService(service);
    setModalOpen(true);
  }

  function handleDeleteService(service: ServiceToJobType) {
    if (!confirm(`Are you sure you want to delete "${service.displayName}"?`)) return;
    deleteService(String(service.serviceTitanId)).then(() => refresh());
  }

  const services: ServiceToJobType[] = serviceToJobsTypeSetting?.value
    ? JSON.parse(serviceToJobsTypeSetting.value)
    : [];

  return (
    <>
      <ul className="divide-y divide-gray-200">
        {services?.map((service, idx) => (
          <li key={idx} className="flex items-center justify-between p-2 hover:bg-blue-50">
            <div>
              <span className="font-medium">{service.displayName}</span>
              <p className="text-sm text-gray-500">{service.description}</p>
            </div>
            <div className="flex gap-2">
              <button
                className="text-blue-500 hover:underline font-medium px-1"
                onClick={() => handleEdit(service)}
              >
                <PencilIcon
                  title={`Edit "${service.displayName}" service`}
                  className="h-4 w-4 inline-block"
                />
              </button>
              <button
                className="text-red-500 hover:underline font-medium px-1"
                onClick={() => handleDeleteService?.(service)}
              >
                <TrashIcon
                  title={`Remove "${service.displayName}" service`}
                  className="h-4 w-4 inline-block"
                />
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
    </>
  );
}