import React from "react";

type DeleteConfirmModalProps = {
  open: boolean;
  title?: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
};

export function DeleteConfirmModal({
  open,
  title = "Confirm Deletion",
  message,
  onCancel,
  onConfirm,
  loading = false,
}: DeleteConfirmModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-[400px] text-center relative">
        <button
          onClick={onCancel}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
          disabled={loading}
        >
          ×
        </button>
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 transition text-gray-700"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 transition text-white flex items-center justify-center"
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
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
