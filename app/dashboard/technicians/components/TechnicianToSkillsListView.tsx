import React, { useEffect, useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { TechnicianToSkillsType } from "@/lib/types/technicianToSkillsType";
import { Setting } from "@/lib/types/setting";
import { getTechnicianToSkillsSetting, deleteTechnician } from "../actions";
import { TechnicianToSkillsForm } from "./TechnicianToSkillsForm";
import { DeleteConfirmModal } from "@/app/components/DeleteConfirmModal";

export function TechnicianToSkillsListView() {
  const [TechnicianToSkillsSetting, setTechnicianToSkillsSetting] = useState<Setting | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState<TechnicianToSkillsType | undefined>(undefined);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [technicianToDelete, setTechnicianToDelete] = useState<TechnicianToSkillsType | null>(null);
  const [deleting, setDeleting] = useState(false);


  async function refresh() {
    const s = await getTechnicianToSkillsSetting();
    setTechnicianToSkillsSetting(s);
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleAdd() {
    setSelectedTechnician(undefined);
    setModalOpen(true);
  }

  function handleEdit(technician: TechnicianToSkillsType) {
    setSelectedTechnician(technician);
    setModalOpen(true);
  }

  function handleDeleteTechnician(technician: TechnicianToSkillsType) {
    // if (!confirm(`Are you sure you want to delete "${technician.technicianName}"?`)) return;
    // deleteTechnician(String(technician.technicianId)).then(() => refresh());
    setTechnicianToDelete(technician);
    setConfirmOpen(true);
  }

  const confirmDelete = () => {
    if (technicianToDelete) {
      setDeleting(true);
      deleteTechnician(String(technicianToDelete.technicianId)).then(() => {
        setDeleting(false);
        refresh();
        setConfirmOpen(false);
        setTechnicianToDelete(null);
      });
    }
  }

  const technicians: TechnicianToSkillsType[] = TechnicianToSkillsSetting?.value
    ? JSON.parse(TechnicianToSkillsSetting.value)
    : [];

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-semibold">Technicians</h2>
        <button
          className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition"
          title="Add new technician"
          onClick={handleAdd}
        >
          <PlusIcon className="h-6 w-6" />
        </button>
      </div>
      <ul className="divide-y divide-gray-200">
        {technicians.map((technician, idx) => (
          <li key={idx} className="flex items-start justify-between p-2 hover:bg-blue-50">
            <div className="w-32">
              <span className="font-medium">{technician.technicianName}</span>
            </div>
            <div className="flex-1 mx-4">
              <p className="text-sm text-gray-500 text-left">
                {technician.skills && technician.skills.length > 0
                  ? technician.skills.map((skill, i) => (
                      <span key={i}>
                        {skill}
                        {i < technician.skills.length - 1 && <br />}
                      </span>
                    ))
                  : "No skills assigned"}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                className="text-blue-500 hover:underline font-medium px-1"
                onClick={() => handleEdit(technician)}
              >
                <PencilIcon className="h-4 w-4 inline-block" />
              </button>
              <button
                className="text-red-500 hover:underline font-medium px-1"
                onClick={() => handleDeleteTechnician?.(technician)}
              >
                <TrashIcon className="h-4 w-4 inline-block" />
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
            <TechnicianToSkillsForm
              existing={selectedTechnician}
              onSaved={async () => {
                setModalOpen(false);
                await refresh();
              }}
            />
          </div>
        </div>
      )}
      {confirmOpen && technicianToDelete && (
        <DeleteConfirmModal
          open={confirmOpen}
          title="Confirm Deletion"
          message={`Are you sure you want to delete the technician "${technicianToDelete.technicianName}"? This action cannot be undone.`}
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