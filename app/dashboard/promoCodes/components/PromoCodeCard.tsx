"use client";

import { PromoCode } from "@/lib/types/promoCode";
import { PencilIcon, TrashIcon, TicketIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

interface PromoCodeCardProps {
  promoCode: PromoCode;
  onToggleEnabled: (promoCode: PromoCode) => void;
  onEdit: (promoCode: PromoCode) => void;
  onRemove: (promoCode: PromoCode) => void;
}

export default function PromoCodeCard({
  promoCode,
  onToggleEnabled,
  onEdit,
  onRemove,
}: PromoCodeCardProps) {
  // Helper function to format percentage without trailing zeros
  const formatPercentage = (value: number): string => {
    // Round to avoid floating point precision issues
    const rounded = Math.round(value * 100) / 100;
    // Use parseFloat to remove trailing zeros, then convert to string
    return String(parseFloat(rounded.toFixed(2)));
  };

  // Format the discount value for display
  const getDiscountDisplay = (): string => {
    if (promoCode.type === "PERCENT") {
      const percentOff = (1 - promoCode.value) * 100;
      return `${formatPercentage(percentOff)}% off`;
    } else {
      const dollars = promoCode.value / 100;
      return `$${dollars.toFixed(2)} off`;
    }
  };

  // Format date for display
  const formatDate = (date: Date | null | undefined): string => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Check if promo code is expired
  const isExpired = promoCode.expiresAt && new Date(promoCode.expiresAt) < new Date();
  
  // Check if promo code hasn't started yet
  const notStarted = promoCode.startsAt && new Date(promoCode.startsAt) > new Date();

  // Check if usage limit reached
  const usageLimitReached = promoCode.usageLimit !== null && promoCode.usageLimit !== undefined && promoCode.usageCount >= promoCode.usageLimit;

  // Extract values with proper narrowing
  const minPurchase = promoCode.minPurchase;
  const maxDiscount = promoCode.maxDiscount;

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border transition-all ${
        promoCode.enabled && !isExpired && !notStarted && !usageLimitReached
          ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700"
          : "bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-600 opacity-70 hover:bg-blue-50 dark:hover:bg-gray-700"
      }`}
    >
      {/* Image */}
      <div className="flex-shrink-0 self-stretch">
        {promoCode.image?.url ? (
          <div className="relative h-full min-h-[80px] aspect-[4/3]">
            <Image
              src={promoCode.image.url}
              alt={promoCode.code}
              fill
              className="rounded-lg object-cover border border-gray-200 dark:border-gray-600"
            />
          </div>
        ) : (
          <div className="h-full min-h-[80px] aspect-[4/3] rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center border border-gray-200 dark:border-gray-600">
            <TicketIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          </div>
        )}
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-mono font-bold text-lg dark:text-white">
            {promoCode.code}
          </span>
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              promoCode.type === "PERCENT"
                ? "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
            }`}
          >
            {getDiscountDisplay()}
          </span>
          {isExpired && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
              Expired
            </span>
          )}
          {notStarted && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
              Not Started
            </span>
          )}
          {usageLimitReached && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
              Limit Reached
            </span>
          )}
        </div>
        
        {promoCode.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {promoCode.description}
          </p>
        )}
        
        <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span>
            Used: <strong>{promoCode.usageCount}</strong>
            {promoCode.usageLimit !== null && promoCode.usageLimit !== undefined && ` / ${promoCode.usageLimit}`}
          </span>
          {minPurchase != null && (
            <span>Min: ${minPurchase.toFixed(2)}</span>
          )}
          {maxDiscount != null && (
            <span>Max: ${maxDiscount.toFixed(2)}</span>
          )}
          {promoCode.startsAt && (
            <span>Starts: {formatDate(promoCode.startsAt)}</span>
          )}
          {promoCode.expiresAt && (
            <span>Expires: {formatDate(promoCode.expiresAt)}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Enabled toggle */}
        <button
          type="button"
          role="switch"
          aria-checked={promoCode.enabled}
          onClick={() => onToggleEnabled(promoCode)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
            promoCode.enabled ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
          }`}
          title={promoCode.enabled ? "Disable" : "Enable"}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white dark:bg-gray-200 shadow transition ${
              promoCode.enabled ? "translate-x-5" : "translate-x-1"
            }`}
          />
        </button>

        {/* Edit button */}
        <button
          onClick={() => onEdit(promoCode)}
          className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition"
          title="Edit"
        >
          <PencilIcon className="h-5 w-5" />
        </button>

        {/* Delete button */}
        <button
          onClick={() => onRemove(promoCode)}
          className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition"
          title="Delete"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

