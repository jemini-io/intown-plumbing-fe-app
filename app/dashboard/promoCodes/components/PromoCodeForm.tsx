"use client";

import { useEffect, useState, useRef, useTransition, useCallback } from "react";
import { PromoCode, PromoCodeType } from "@/lib/types/promoCode";
import { FormComponentProps } from "@/app/dashboard/components/DashboardCard";
import { findPromoCodeByCode } from "../actions";
import Image from "next/image";
import { PhotoIcon, TrashIcon } from "@heroicons/react/24/outline";

type PromoCodeFormProps = FormComponentProps & {
  existing?: PromoCode;
};

export function PromoCodeForm({ existing, onSaved }: PromoCodeFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  const [code, setCode] = useState<string>(existing?.code ?? "");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  
  // Helper function to format percentage without trailing zeros
  const formatPercentage = (value: number): string => {
    // Round to avoid floating point precision issues
    const rounded = Math.round(value * 100) / 100;
    // Use parseFloat to remove trailing zeros, then convert to string
    return String(parseFloat(rounded.toFixed(2)));
  };

  // Calculate initial value for existing promo code
  const getInitialValue = useCallback((): string => {
    if (!existing) return "";
    if (existing.type === "PERCENT") {
      const percentOff = (1 - existing.value) * 100;
      return formatPercentage(percentOff);
    } else {
      const dollars = existing.value / 100;
      return dollars.toFixed(2);
    }
  }, [existing]);
  
  const [value, setValue] = useState<string>(getInitialValue());
  
  const [enabled, setEnabled] = useState<boolean>(existing?.enabled ?? true);
  const [type, setType] = useState<PromoCodeType>(existing?.type ?? "PERCENT");
  const [hasUsageLimit, setHasUsageLimit] = useState<boolean>(existing?.usageLimit !== null && existing?.usageLimit !== undefined);
  const [hasMinPurchase, setHasMinPurchase] = useState<boolean>(existing?.minPurchase !== null && existing?.minPurchase !== undefined);
  const [hasMaxDiscount, setHasMaxDiscount] = useState<boolean>(existing?.maxDiscount !== null && existing?.maxDiscount !== undefined);
  const [hasStartDate, setHasStartDate] = useState<boolean>(existing?.startsAt !== null && existing?.startsAt !== undefined);
  const [hasEndDate, setHasEndDate] = useState<boolean>(existing?.expiresAt !== null && existing?.expiresAt !== undefined);

  // Image state
  const [imagePreview, setImagePreview] = useState<string | null>(existing?.image?.url ?? null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  useEffect(() => {
    setCode(existing?.code ?? "");
    setCodeError(null);
    setEnabled(existing?.enabled ?? true);
    setType(existing?.type ?? "PERCENT");
    setValue(getInitialValue());
    setHasUsageLimit(existing?.usageLimit !== null && existing?.usageLimit !== undefined);
    setHasMinPurchase(existing?.minPurchase !== null && existing?.minPurchase !== undefined);
    setHasMaxDiscount(existing?.maxDiscount !== null && existing?.maxDiscount !== undefined);
    setHasStartDate(existing?.startsAt !== null && existing?.startsAt !== undefined);
    setHasEndDate(existing?.expiresAt !== null && existing?.expiresAt !== undefined);
    setImagePreview(existing?.image?.url ?? null);
    setImageFile(null);
    setRemoveImage(false);
  }, [existing, getInitialValue]);

  // Validate code uniqueness when it changes
  useEffect(() => {
    if (!code.trim()) {
      setCodeError(null);
      return;
    }

    const normalizedCode = code.trim().toUpperCase();
    
    // If editing and code hasn't changed, no need to check
    if (existing && existing.code.toUpperCase() === normalizedCode) {
      setCodeError(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsCheckingCode(true);
      try {
        const existingPromoCode = await findPromoCodeByCode(normalizedCode);
        if (existingPromoCode) {
          setCodeError("This promo code already exists");
        } else {
          setCodeError(null);
        }
      } catch {
        setCodeError(null);
      } finally {
        setIsCheckingCode(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [code, existing]);

  // Update image preview when file changes
  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setImagePreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  // Format date for datetime-local input
  const formatDateForInput = (date: Date | null | undefined): string => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  };

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
      setRemoveImage(false);
    }
  }

  function handleRemoveImage() {
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      const formData = new FormData(formRef.current!);

      // Parse value based on type (use state value)
      let numericValue: number;
      if (type === "PERCENT") {
        // Convert percentage to decimal (e.g., 100% off = 0.0, 50% off = 0.5)
        const percentOff = parseFloat(value) || 0;
        numericValue = 1 - (percentOff / 100); // 100% off = 0.0
      } else {
        // Amount in dollars, convert to cents
        const dollars = parseFloat(value) || 0;
        numericValue = dollars * 100;
      }

      // Set form data values
      formData.set("code", code.trim().toUpperCase());
      formData.set("type", type);
      formData.set("value", numericValue.toString());
      formData.set("enabled", enabled ? "true" : "false");
      
      if (!hasUsageLimit) formData.delete("usageLimit");
      if (!hasMinPurchase) formData.delete("minPurchase");
      if (!hasMaxDiscount) formData.delete("maxDiscount");
      if (!hasStartDate) formData.delete("startsAt");
      if (!hasEndDate) formData.delete("expiresAt");

      if (imageFile) {
        formData.set("image", imageFile);
      }
      if (removeImage) {
        formData.set("removeImage", "true");
      }

      try {
        let response;
        if (existing) {
          formData.set("id", existing.id);
          response = await fetch("/api/promoCodes/update", {
            method: "POST",
            body: formData,
          });
        } else {
          response = await fetch("/api/promoCodes/create", {
            method: "POST",
            body: formData,
          });
        }

        const result = await response.json();
        if (response.ok) {
          setMessage({
            type: "success",
            text: existing ? "Promo code updated successfully!" : "Promo code created successfully!",
          });
          if (!existing) {
            formRef.current?.reset();
            setCode("");
            setCodeError(null);
            setValue("");
            setEnabled(true);
            setType("PERCENT");
            setHasUsageLimit(false);
            setHasMinPurchase(false);
            setHasMaxDiscount(false);
            setHasStartDate(false);
            setHasEndDate(false);
            setImagePreview(null);
            setImageFile(null);
            setRemoveImage(false);
          }
          setTimeout(() => {
            setMessage(null);
            onSaved();
          }, 800);
        } else {
          setMessage({ type: "error", text: result.error || "Something went wrong. Please try again." });
        }
      } catch (err) {
        console.error("PromoCodeForm error:", err);
        setMessage({ type: "error", text: "Something went wrong. Please try again." });
      }
    });
  }

  // Validate if form has minimum required fields
  const isFormValid = (): boolean => {
    const codeValid = code.trim().length > 0 && !codeError && !isCheckingCode;
    const typeValid = type === "PERCENT" || type === "AMOUNT";
    const valueValid = value.trim().length > 0 && parseFloat(value) >= 0;
    
    return codeValid && typeValid && valueValid;
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-center dark:text-white">
        {existing ? "Edit Promo Code" : "Add New Promo Code"}
      </h2>
      {message && (
        <div
          className={`mb-4 text-center text-base font-medium transition-all ${
            message.type === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="grid grid-cols-2 gap-4 items-start"
      >
        {/* Image Upload */}
        <div className="col-span-2 flex flex-col items-center gap-2 mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Promo Image (optional)
          </label>
          <div className="relative">
            {imagePreview ? (
              <div className="relative">
                <Image
                  src={imagePreview}
                  alt="Promo code image"
                  width={120}
                  height={120}
                  className="rounded-lg object-cover border-2 border-gray-200 dark:border-gray-600"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                  title="Remove image"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="w-[120px] h-[120px] rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                <PhotoIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
              </div>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-700 dark:file:text-gray-300"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            This image will be shown when the promo code is applied
          </p>
        </div>

        {/* Row: Code + Type + Value + Enabled */}
        <div className="col-span-2 grid grid-cols-4 gap-3">
          {/* Code */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Code</label>
            <input
              type="text"
              name="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className={`w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2 uppercase ${
                codeError ? "border-red-500 dark:border-red-500" : ""
              }`}
              required
              placeholder="e.g. THANKSGIVING"
            />
            {isCheckingCode && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Checking...</p>
            )}
            {codeError && !isCheckingCode && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{codeError}</p>
            )}
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as PromoCodeType)}
              className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2"
            >
              <option value="PERCENT">% Off</option>
              <option value="AMOUNT">$ Off</option>
            </select>
          </div>

          {/* Value */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {type === "PERCENT" ? "%" : "$"}
            </label>
            <input
              type="number"
              name="value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              step={type === "PERCENT" ? "0.01" : "0.01"}
              min="0"
              max={type === "PERCENT" ? "100" : undefined}
              className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2"
              required
              placeholder={type === "PERCENT" ? "100" : "5.00"}
            />
          </div>
        </div>

        {/* Row: Enabled + Usage count + Description */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enabled</span>
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={() => setEnabled(v => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              enabled ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white dark:bg-gray-200 shadow transition ${
                enabled ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>
          {existing && (
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
              Used: {existing.usageCount}×
            </span>
          )}
        </div>

        {/* Description */}
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
          <input
            type="text"
            name="description"
            defaultValue={existing?.description ?? ""}
            className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-2"
            placeholder="e.g. Holiday special discount"
          />
        </div>

        {/* Row: Usage Limit + Min Purchase + Max Discount */}
        <div className="col-span-2 grid grid-cols-3 gap-3">
          {/* Usage Limit */}
          <div className="border dark:border-gray-600 rounded p-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <input
                type="checkbox"
                checked={hasUsageLimit}
                onChange={(e) => setHasUsageLimit(e.target.checked)}
                className="h-4 w-4 rounded dark:bg-gray-600"
              />
              Usage Limit
            </label>
            {hasUsageLimit && (
              <input
                type="number"
                name="usageLimit"
                min="1"
                defaultValue={existing?.usageLimit ?? ""}
                className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-1.5 text-sm"
                placeholder="100"
              />
            )}
          </div>

          {/* Min Purchase */}
          <div className="border dark:border-gray-600 rounded p-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <input
                type="checkbox"
                checked={hasMinPurchase}
                onChange={(e) => setHasMinPurchase(e.target.checked)}
                className="h-4 w-4 rounded dark:bg-gray-600"
              />
              Min Purchase
            </label>
            {hasMinPurchase && (
              <input
                type="number"
                name="minPurchase"
                step="0.01"
                min="0"
                defaultValue={existing?.minPurchase ?? ""}
                className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-1.5 text-sm"
                placeholder="$25"
              />
            )}
          </div>

          {/* Max Discount */}
          <div className="border dark:border-gray-600 rounded p-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <input
                type="checkbox"
                checked={hasMaxDiscount}
                onChange={(e) => setHasMaxDiscount(e.target.checked)}
                className="h-4 w-4 rounded dark:bg-gray-600"
              />
              Max Discount
            </label>
            {hasMaxDiscount && (
              <input
                type="number"
                name="maxDiscount"
                step="0.01"
                min="0"
                defaultValue={existing?.maxDiscount ?? ""}
                className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-1.5 text-sm"
                placeholder="$50"
              />
            )}
          </div>
        </div>

        {/* Row: Start Date + End Date */}
        <div className="col-span-2 grid grid-cols-2 gap-3">
          {/* Start Date */}
          <div className="border dark:border-gray-600 rounded p-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <input
                type="checkbox"
                checked={hasStartDate}
                onChange={(e) => setHasStartDate(e.target.checked)}
                className="h-4 w-4 rounded dark:bg-gray-600"
              />
              Start Date
            </label>
            {hasStartDate && (
              <input
                type="datetime-local"
                name="startsAt"
                defaultValue={formatDateForInput(existing?.startsAt)}
                className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-1.5 text-sm"
              />
            )}
          </div>

          {/* End Date */}
          <div className="border dark:border-gray-600 rounded p-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <input
                type="checkbox"
                checked={hasEndDate}
                onChange={(e) => setHasEndDate(e.target.checked)}
                className="h-4 w-4 rounded dark:bg-gray-600"
              />
              Expiration
            </label>
            {hasEndDate && (
              <input
                type="datetime-local"
                name="expiresAt"
                defaultValue={formatDateForInput(existing?.expiresAt)}
                className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded p-1.5 text-sm"
              />
            )}
          </div>
        </div>

        <div className="col-span-2 flex justify-center mt-2">
          <button
            type="submit"
            disabled={isPending || !isFormValid()}
            className="w-full bg-blue-600 dark:bg-white hover:bg-blue-700 dark:hover:bg-gray-200 text-white dark:text-gray-900 py-2 rounded-md font-medium shadow-md transition disabled:bg-blue-300 dark:disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving..." : existing ? "Update Promo Code" : "Add Promo Code"}
          </button>
        </div>
      </form>
    </div>
  );
}
