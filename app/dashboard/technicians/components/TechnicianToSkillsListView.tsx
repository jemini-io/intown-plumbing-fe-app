import React, { useEffect, useState } from "react";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { UserPlusIcon } from "@heroicons/react/24/solid";
import { enumToStatus, TechnicianToSkills } from "@/lib/types/technicianToSkills";
import { getAllTechnicians, deleteTechnician } from "../actions";
import { TechnicianToSkillsForm } from "./TechnicianToSkillsForm";
import { DeleteConfirmModal } from "@/app/components/DeleteConfirmModal";
import Image from "next/image";
import { SpinnerOverlay } from "@/app/dashboard/components/Spinner";
import { formatStatus } from "../utils/formatStatus";

export interface TechnicianToSkillsListViewProps {
  limit?: number;
  showImage?: boolean;
  showStatus?: boolean;
  showSkills?: boolean;
  showEnabled?: boolean;
  showActions?: boolean;
}

export function TechnicianToSkillsListView({
  limit,
  showImage = true,
  showStatus = true,
  showSkills = true,
  showEnabled = true,
  showActions = true,
}: TechnicianToSkillsListViewProps) {

  const [allTechnicians, setAllTechnicians] = useState<TechnicianToSkills[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState<TechnicianToSkills | undefined>(undefined);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [technicianToDelete, setTechnicianToDelete] = useState<TechnicianToSkills | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | number | null>(null);

  async function refresh() {
    const technicians: TechnicianToSkills[] = await getAllTechnicians();
    setAllTechnicians(technicians);
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleAdd() {
    setSelectedTechnician(undefined);
    setModalOpen(true);
  }

  function handleEdit(technician: TechnicianToSkills) {
    setSelectedTechnician(technician);
    setModalOpen(true);
  }

  function handleDeleteTechnician(technician: TechnicianToSkills) {
    setTechnicianToDelete(technician);
    setConfirmOpen(true);
  }

  const confirmDelete = () => {
    if (technicianToDelete) {
      setDeleting(true);
      deleteTechnician(String(technicianToDelete.id)).then(() => {
        setDeleting(false);
        refresh();
        setConfirmOpen(false);
        setTechnicianToDelete(null);
      });
    }
  };

  const techniciansToRender = limit ? allTechnicians.slice(0, limit) : allTechnicians;

  async function performToggleEnabled(t: TechnicianToSkills, nextEnabled: boolean) {
    setUpdatingId(t.id);
    const formData = new FormData();
    formData.append("id", String(t.id));
    formData.append("technicianId", String(t.technicianId));
    formData.append("technicianName", t.technicianName);
    formData.append("enabled", nextEnabled ? "true" : "false");
    formData.append("status", t.status);
    if (Array.isArray(t.skills) && t.skills.length > 0) {
      formData.append("skillIds", t.skills.map(s => s.id).join(","));
    }

    try {
      const res = await fetch("/api/technicians/update", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Failed to update");
      await refresh();
    } catch (e) {
      // revert optimistic change
      setAllTechnicians(prev =>
        prev.map(item =>
          String(item.id) === String(t.id)
            ? { ...item, enabled: t.enabled }
            : item
        )
      );
      throw e;
    } finally {
      setUpdatingId(null);
    }
  }

  // Toggle handler
  async function handleToggleEnabled(t: TechnicianToSkills) {
    const nextEnabled = !t.enabled;

    // Optimistic update
    setAllTechnicians(prev =>
      prev.map(item =>
        String(item.id) === String(t.id)
          ? { ...item, enabled: nextEnabled }
          : item
      )
    );

    try {
      await performToggleEnabled(t, nextEnabled);
    } catch {
      await refresh();
    }
  }

  // Configuración de columnas
  const columnsConfig = [
    showImage ? "48px" : null,                // IMAGE ancho fijo
    "1fr",                                   // NAME flexible
    showStatus ? "minmax(80px, max-content)" : null, // STATUS mínimo
    showSkills ? "0.35fr" : null,                // SKILLS flexible
    showEnabled ? "minmax(50px, max-content)" : null, // ENABLED mínimo
    showActions ? "100px" : null,             // ACTIONS ancho fijo
  ].filter(Boolean);

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: columnsConfig.join(" "),
    gap: "2.5rem", // más espacio entre columnas
    alignItems: "center",
  };

  // Get the technician being updated to determine message
  // Note: After optimistic update, enabled state is already toggled
  const updatingTechnician = updatingId 
    ? allTechnicians.find(t => String(t.id) === String(updatingId))
    : null;
  // If enabled is true after toggle, we were enabling (going from false to true)
  // If enabled is false after toggle, we were disabling (going from true to false)
  const isEnabling = updatingTechnician?.enabled === true;
  const updatingMessage = isEnabling ? "Enabling technician…" : "Disabling technician…";

  return (
    <>
      {/* Blocking overlay shown while a toggle/update is in progress */}
      {updatingId && <SpinnerOverlay message={updatingMessage} />}
      <div className="flex items-center justify-between mb-6" aria-busy={Boolean(updatingId)}>
        <h2 className="text-xl font-semibold dark:text-white">Technicians</h2>
        <button
          className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition"
          title="Add new technician"
          onClick={handleAdd}
        >
          <UserPlusIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Header row */}
      <div style={gridStyle} className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
        {showImage && <div className="text-left">Image</div>}
        <div className="text-left">Name</div>
        {showStatus && <div className="text-center">Status</div>}
        {showSkills && <div className="text-center">Skills</div>}
        {showEnabled && <div className="text-center">Enabled</div>}
        {showActions && <div className="text-center">Actions</div>}
      </div>

      <ul>
        {techniciansToRender.map(technician => (
          <li
            key={technician.technicianId}
            style={gridStyle}
            className="px-2 py-3 border-b dark:border-gray-700 last:border-b-0 hover:bg-blue-50 dark:hover:bg-gray-700"
          >
            {showImage && (
              <div className="flex items-center justify-start">
                {technician.image?.url ? (
                  <Image
                    src={technician.image.url}
                    alt={technician.technicianName}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full flex items-center justify-center">
                    <UserCircleIcon className="text-gray-700 dark:text-gray-400 h-7 w-7" />
                  </div>
                )}
              </div>
            )}
            <div
              className="flex text-left"
              style={{
                wordBreak: "break-word",
                whiteSpace: "normal",
                overflowWrap: "anywhere",
              }}
            >
              <span className="font-medium dark:text-white">{technician.technicianName}</span>
            </div>
            {showStatus && (
              <div className="flex">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {formatStatus(enumToStatus(technician.status))}
                </span>
              </div>
            )}
            {showSkills && (
              <div className="flex">
                <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                  {Array.isArray(technician.skills) && technician.skills.length > 0
                    ? technician.skills.map(skill =>
                        typeof skill === "string"
                          ? skill
                          : skill.name || "Unnamed skill"
                      ).join("\n")
                    : "No skills assigned"}
                </p>
              </div>
            )}
            {showEnabled && (
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => handleToggleEnabled(technician)}
                  disabled={updatingId === technician.id}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    technician.enabled ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                  } ${updatingId === technician.id ? "opacity-60 cursor-wait" : "cursor-pointer"}`}
                  title={technician.enabled ? "Disable technician" : "Enable technician"}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white dark:bg-gray-200 shadow transition ${
                      technician.enabled ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            )}
            {showActions && (
              <div className="flex items-center justify-end gap-1 text-right pl-2">
                <button
                  className="px-1 py-0 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition h-6 flex items-center"
                  title="Edit"
                  onClick={() => handleEdit(technician)}
                >
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">EDIT</span>
                </button>
                <button
                  className="px-1 py-0 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition h-6 flex items-center"
                  title="Remove"
                  onClick={() => handleDeleteTechnician(technician)}
                >
                  <span className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">REMOVE</span>
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 w-[700px] overflow-auto relative" style={{ minWidth: 400, maxHeight: "90vh" }}>
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-2 right-2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl font-bold"
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
