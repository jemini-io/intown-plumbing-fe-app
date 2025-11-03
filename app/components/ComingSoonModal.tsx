import React from "react";

type ComingSoonModalProps = {
  open: boolean;
  onClose: () => void;
};

export function ComingSoonModal({
  open,
  onClose,
}: ComingSoonModalProps) {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-[600px] overflow-auto relative" style={{ minWidth: 400, maxHeight: "90vh" }}>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
        >
          ×
        </button>
        <div className="flex flex-col items-center justify-center py-8">
          <span className="text-5xl mb-4">🚧</span>
          <h1 className="text-3xl font-bold mb-2 text-gray-800">Coming Soon!</h1>
        </div>
      </div>
    </div>
  );
}

