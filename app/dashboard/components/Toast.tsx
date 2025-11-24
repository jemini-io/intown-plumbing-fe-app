"use client";

import React, { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

type ToastProps = {
  message: string;
  onUndo?: () => void;
  onClose: () => void;
  duration?: number; // Duration in milliseconds, 0 = no auto-close
};

export function Toast({ message, onUndo, onClose, duration = 5000 }: ToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className="transform transition-all duration-300 ease-out translate-y-0 opacity-100">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 min-w-[300px] max-w-[400px] flex items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-gray-900 dark:text-white">{message}</p>
        </div>
        <div className="flex items-center gap-2">
          {onUndo && (
            <button
              onClick={() => {
                onUndo();
                onClose();
              }}
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Undo
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

