import React, { useEffect, useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { UserPlusIcon } from "@heroicons/react/24/solid";
import { TechnicianToSkillsType } from "@/lib/types/technicianToSkillsType";
import { Setting } from "@/lib/types/setting";
import { getTechnicianToSkillsSetting, updateTechnician, deleteTechnician } from "../actions";
import { TechnicianToSkillsForm } from "./TechnicianToSkillsForm";
import { DeleteConfirmModal } from "@/app/components/DeleteConfirmModal";

export interface TechnicianToSkillsListViewProps {
  limit?: number;
}

export function TechnicianToSkillsListView(props: TechnicianToSkillsListViewProps) {
  const [technicianSetting, setTechnicianSetting] = useState<Setting | null>(null);
  const [techs, setTechs] = useState<TechnicianToSkillsType[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState<TechnicianToSkillsType | undefined>(undefined);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [technicianToDelete, setTechnicianToDelete] = useState<TechnicianToSkillsType | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | number | null>(null);

  async function refresh() {
    const s = await getTechnicianToSkillsSetting();
    setTechnicianSetting(s);
  }

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!technicianSetting?.value) return;
    try {
      const parsed: TechnicianToSkillsType[] = JSON.parse(technicianSetting.value);
      setTechs(parsed.map(t => ({
        technicianId: String(t.technicianId),
        technicianName: t.technicianName,
        skills: t.skills,
        enabled: t.enabled
      })));
    } catch {
      /* ignore */
    }
  }, [technicianSetting?.value]);

  function handleAdd() {
    setSelectedTechnician(undefined);
    setModalOpen(true);
  }

  function handleEdit(technician: TechnicianToSkillsType) {
    setSelectedTechnician(technician);
    setModalOpen(true);
  }

  function handleDeleteTechnician(technician: TechnicianToSkillsType) {
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
  };

  const techniciansToRender = props.limit ? techs.slice(0, props.limit) : techs;

  async function handleToggleEnabled(t: TechnicianToSkillsType) {
    const id = String(t.technicianId);
    const nextEnabled = !t.enabled;
    setUpdatingId(id);

    // Optimistic update
    setTechs(prev =>
      prev.map(item =>
        String(item.technicianId) === id
          ? { ...item, enabled: nextEnabled }
          : item
      )
    );

    try {
      const serverList = await updateTechnician(id, { enabled: nextEnabled });
      setTechs(serverList.map(u => ({
        technicianId: String(u.technicianId),
        technicianName: u.technicianName,
        skills: u.skills,
        enabled: u.enabled
      })));
      setTechnicianSetting(prev =>
        prev ? { ...prev, value: JSON.stringify(serverList) } : prev
      );
    } catch {
      await refresh(); // revert
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Technicians</h2>
        <button
          className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition"
          title="Add new technician"
          onClick={handleAdd}
        >
          <UserPlusIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Header row */}
      <div className="grid grid-cols-12 px-2 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 border-b">
        <div className="col-span-3">Name</div>
        <div className="col-span-6">Skills</div>
        <div className="col-span-2 text-center">Enabled</div>
        <div className="col-span-1 text-right">Actions</div>
      </div>

      <ul>
        {techniciansToRender.map(technician => (
          <li
            key={technician.technicianId}
            className="grid grid-cols-12 items-start px-2 py-3 border-b last:border-b-0 hover:bg-blue-50"
          >
            <div className="col-span-3 pr-2">
              <span className="font-medium">{technician.technicianName}</span>
            </div>
            <div className="col-span-6 pr-2">
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {technician.skills.length > 0
                  ? technician.skills.join("\n")
                  : "No skills assigned"}
              </p>
            </div>
            <div className="col-span-2 flex items-center justify-center">
              <button
                type="button"
                onClick={() => handleToggleEnabled(technician)}
                disabled={updatingId === technician.technicianId}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  technician.enabled ? "bg-green-500" : "bg-gray-300"
                } ${updatingId === technician.technicianId ? "opacity-60 cursor-wait" : "cursor-pointer"}`}
                title={technician.enabled ? "Disable technician" : "Enable technician"}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
                    technician.enabled ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <div className="col-span-1 flex items-center justify-end gap-1">
              <button
                className="text-blue-500 hover:text-blue-700 p-1"
                title="Edit"
                onClick={() => handleEdit(technician)}
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                className="text-red-500 hover:text-red-700 p-1"
                title="Delete"
                onClick={() => handleDeleteTechnician(technician)}
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
