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
    <div className="fixed inset-0 bg-black bg-opacity-30 dark:bg-black dark:bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 w-[600px] overflow-auto relative" style={{ minWidth: 400, maxHeight: "90vh" }}>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300 text-xl font-bold"
        >
          ×
        </button>
        <div className="flex flex-col items-center justify-center py-8">
          <span className="text-5xl mb-4">🚧</span>
          <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">Coming Soon!</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">Thanks for checking out the app! It&apos;s still a work in progress, please check back later when we&apos;ve finished this feature!</p>
        </div>
      </div>
    </div>
  );
}

