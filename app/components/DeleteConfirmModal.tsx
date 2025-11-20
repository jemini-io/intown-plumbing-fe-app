import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type DeleteConfirmModalProps = {
  open: boolean;
  title?: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
  confirmLabel?: string;
  loadingLabel?: string;
};

export function DeleteConfirmModal({
  open,
  title = "Confirm Deletion",
  message,
  onCancel,
  onConfirm,
  loading = false,
  confirmLabel = "Delete",
  loadingLabel = "Deleting...",
}: DeleteConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !mounted) return null;
  
  return createPortal(
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-30 dark:bg-black dark:bg-opacity-60 flex items-center justify-center" style={{ zIndex: 9999 }}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 w-[400px] text-center relative">
        <button
          onClick={onCancel}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 text-xl font-bold"
          disabled={loading}
        >
          ×
        </button>
        <h3 className="text-lg font-semibold mb-4 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition text-gray-700 dark:text-gray-300"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 transition text-white flex items-center justify-center"
            disabled={loading}
          >
            {loading && (
              <svg
                className="animate-spin h-4 w-4 mr-2 text-white"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            )}
            {loading ? loadingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
