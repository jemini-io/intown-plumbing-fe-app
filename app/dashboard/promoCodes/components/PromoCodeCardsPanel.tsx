"use client";

import React, { useEffect, useState } from "react";
import { PromoCode } from "@/lib/types/promoCode";
import { getAllPromoCodes, updatePromoCode, deletePromoCode } from "../actions";
import { PromoCodeForm } from "./PromoCodeForm";
import PromoCodeCard from "./PromoCodeCard";
import { DeleteConfirmModal } from "@/app/components/DeleteConfirmModal";
import { SpinnerOverlay } from "@/app/dashboard/components/Spinner";

export interface PromoCodeCardsPanelProps {
  limit?: number;
}

export function PromoCodeCardsPanel(props: PromoCodeCardsPanelProps) {
  const [allPromoCodes, setAllPromoCodes] = useState<PromoCode[] | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedPromoCode, setSelectedPromoCode] = useState<PromoCode | undefined>(undefined);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [promoCodeToDelete, setPromoCodeToDelete] = useState<PromoCode | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function refresh() {
    const promoCodes: PromoCode[] = await getAllPromoCodes();
    
    // Sort promo codes: first those without dates, then by dates ascending
    const sortedPromoCodes = [...promoCodes].sort((a, b) => {
      // Promo codes without dates come first
      const aHasDates = a.startsAt !== null || a.expiresAt !== null;
      const bHasDates = b.startsAt !== null || b.expiresAt !== null;
      
      if (!aHasDates && bHasDates) return -1;
      if (aHasDates && !bHasDates) return 1;
      
      // If both have dates or both don't have dates, sort by dates
      if (aHasDates && bHasDates) {
        // Use startsAt if available, otherwise expiresAt
        const aDate = a.startsAt ? new Date(a.startsAt).getTime() : (a.expiresAt ? new Date(a.expiresAt).getTime() : 0);
        const bDate = b.startsAt ? new Date(b.startsAt).getTime() : (b.expiresAt ? new Date(b.expiresAt).getTime() : 0);
        return aDate - bDate;
      }
      
      // If neither has dates, maintain original order
      return 0;
    });
    
    setAllPromoCodes(sortedPromoCodes);
  }

  useEffect(() => {
    refresh();
  }, []);

  function handleEdit(promoCode: PromoCode) {
    setSelectedPromoCode(promoCode);
    setFormModalOpen(true);
  }

  function handleDeletePromoCode(promoCode: PromoCode) {
    setPromoCodeToDelete(promoCode);
    setConfirmOpen(true);
  }

  const confirmDelete = () => {
    if (promoCodeToDelete) {
      setDeleting(true);
      deletePromoCode(String(promoCodeToDelete.id)).then(() => {
        setDeleting(false);
        refresh();
        setConfirmOpen(false);
        setPromoCodeToDelete(null);
      });
    }
  };

  const promoCodesToRender = props.limit
    ? (allPromoCodes ?? []).slice(0, props.limit)
    : (allPromoCodes ?? []);

  async function handleToggleEnabled(promoCode: PromoCode) {
    const id = String(promoCode.id);
    const nextEnabled = !promoCode.enabled;
    setUpdatingId(id);
    setAllPromoCodes(prev =>
      prev
        ? prev.map(item =>
            String(item.id) === id
              ? { ...item, enabled: nextEnabled }
              : item
          )
        : prev
    );
    try {
      await updatePromoCode(id, { enabled: nextEnabled });
      await refresh();
    } catch {
      await refresh();
    } finally {
      setUpdatingId(null);
    }
  }

  // Determine spinner message
  const updatingPromoCode = updatingId && allPromoCodes
    ? allPromoCodes.find(p => String(p.id) === String(updatingId))
    : null;
  const isEnabling = updatingPromoCode?.enabled === true;
  const updatingMessage = isEnabling ? "Enabling promo code…" : "Disabling promo code…";

  return (
    <>
      {updatingId && <SpinnerOverlay message={updatingMessage} />}
      <div className="space-y-2 mt-2">
        {allPromoCodes === null ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Loading promo codes...
          </div>
        ) : promoCodesToRender.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No promo codes yet. Click &quot;Add Promo Code&quot; to create one.
          </div>
        ) : (
          promoCodesToRender.map(promoCode => (
            <PromoCodeCard
              key={promoCode.id}
              promoCode={promoCode}
              onToggleEnabled={handleToggleEnabled}
              onEdit={handleEdit}
              onRemove={handleDeletePromoCode}
            />
          ))
        )}
      </div>
      {formModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 w-[700px] overflow-auto relative" style={{ minWidth: 400, maxHeight: "90vh" }}>
            <button
              onClick={() => {
                setFormModalOpen(false);
                setSelectedPromoCode(undefined);
              }}
              className="absolute top-2 right-2 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xl font-bold"
            >
              ×
            </button>
            <PromoCodeForm
              existing={selectedPromoCode}
              onSaved={async () => {
                setFormModalOpen(false);
                setSelectedPromoCode(undefined);
                await refresh();
              }}
            />
          </div>
        </div>
      )}
      {confirmOpen && promoCodeToDelete && (
        <DeleteConfirmModal
          open={confirmOpen}
          title="Confirm Deletion"
          message={`Are you sure you want to delete the promo code "${promoCodeToDelete.code}"? This action cannot be undone.`}
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

