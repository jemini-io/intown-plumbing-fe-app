import React, { useEffect, useState } from "react";
import { Skill } from "@/lib/types/skill";
import { getAllSkills, updateSkill, deleteSkill, unlinkServiceFromSkill, unlinkTechnicianFromSkill } from "../actions";
import { SkillForm } from "./SkillForm";
import SkillCard from "./SkillCard";
import { DeleteConfirmModal } from "@/app/components/DeleteConfirmModal";
import { SpinnerOverlay } from "@/app/dashboard/components/Spinner";
export interface SkillCardsPanelProps {
  limit?: number;
}

export function SkillCardsPanel(props: SkillCardsPanelProps) {
  const [allSkills, setAllSkills] = useState<Skill[] | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | undefined>(undefined);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<Skill | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [unlinkModalOpen, setUnlinkModalOpen] = useState(false);
  const [unlinkType, setUnlinkType] = useState<"service" | "technician" | null>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [selectedAssocId, setSelectedAssocId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function refresh() {
    const skills: Skill[] = await getAllSkills();
    setAllSkills(skills);
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleEdit(skill: Skill) {
    setSelectedSkill(skill);
    setFormModalOpen(true);
  }

  function handleDeleteSkill(skill: Skill) {
    setSkillToDelete(skill);
    setConfirmOpen(true);
  }

  const confirmDelete = () => {
    if (skillToDelete) {
      setDeleting(true);
      deleteSkill(String(skillToDelete.id)).then(() => {
        setDeleting(false);
        refresh();
        setConfirmOpen(false);
        setSkillToDelete(null);
      });
    }
  };

  const handleUnlinkRequest = (type: "service" | "technician", skillId: string, assocId: string) => {
    setUnlinkType(type);
    setSelectedSkillId(skillId);
    setSelectedAssocId(assocId);
    setUnlinkModalOpen(true);
  };

  const handleConfirmUnlink = async () => {
    if (!selectedSkillId || !selectedAssocId || !unlinkType) return;
    setLoading(true);
    if (unlinkType === "service") {
      await unlinkServiceFromSkill(selectedSkillId, selectedAssocId);
    } else {
      await unlinkTechnicianFromSkill(selectedSkillId, selectedAssocId);
    }
    setLoading(false);
    setUnlinkModalOpen(false);
    setSelectedSkillId(null);
    setSelectedAssocId(null);
    setUnlinkType(null);
    refresh(); // Refresca la lista
  };

  const skillsToRender = props.limit
    ? (allSkills ?? []).slice(0, props.limit)
    : (allSkills ?? []);

  async function handleToggleEnabled(skill: Skill) {
    const id = String(skill.id);
    const nextEnabled = !skill.enabled;
    setUpdatingId(id);
    setAllSkills(prev =>
      prev
        ? prev.map(item =>
            String(item.id) === id
              ? { ...item, enabled: nextEnabled }
              : item
          )
        : prev
    );
    try {
      await updateSkill(id, { enabled: nextEnabled });
      await refresh();
    } catch {
      await refresh();
    } finally {
      setUpdatingId(null);
    }
  }

  // Determine spinner message (after optimistic update, enabled already reflects target state)
  const updatingSkill = updatingId && allSkills
    ? allSkills.find(s => String(s.id) === String(updatingId))
    : null;
  const isEnabling = updatingSkill?.enabled === true;
  const updatingMessage = isEnabling ? "Enabling skill…" : "Disabling skill…";

  return (
    <>
      {updatingId && <SpinnerOverlay message={updatingMessage} />}
      <div className="space-y-2 mt-2">
        {skillsToRender?.map(skill => (
          <SkillCard
            key={skill.id}
            skill={skill}
            onToggleEnabled={handleToggleEnabled}
            onEdit={handleEdit}
            onRemove={handleDeleteSkill}
            onUnlinkService={(skillId, serviceId) => handleUnlinkRequest("service", skillId, serviceId)}
            onUnlinkTechnician={(skillId, technicianId) => handleUnlinkRequest("technician", skillId, technicianId)}
          />
        ))}
      </div>
      {formModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 w-[700px] overflow-auto relative" style={{ minWidth: 400, maxHeight: "90vh" }}>
            <button
              onClick={() => setFormModalOpen(false)}
              className="absolute top-2 right-2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl font-bold"
            >
              ×
            </button>
            <SkillForm
              existing={selectedSkill}
              onSaved={async () => {
                setFormModalOpen(false);
                await refresh();
              }}
            />
          </div>
        </div>
      )}
      {confirmOpen && skillToDelete && (
        <DeleteConfirmModal
          open={confirmOpen}
          title="Confirm Deletion"
          message={`Are you sure you want to delete the skill "${skillToDelete.name}"? This action cannot be undone.`}
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
        message={
          unlinkType === "service"
            ? "Are you sure you want to unlink this service from the skill?"
            : "Are you sure you want to unlink this technician from the skill?"
        }
        onCancel={() => setUnlinkModalOpen(false)}
        onConfirm={handleConfirmUnlink}
        loading={loading}
        confirmLabel="Unlink"
        loadingLabel="Unlinking..."
      />
    </>
  );
}
