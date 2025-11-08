import React, { useRef, useEffect, useState } from "react";

type ErrorModalProps = {
  open: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  secondaryAction?: {
    label: string;
    onClick: () => void;
    processing?: boolean;
    processingLabel?: string;
  };
};

export function ErrorModal({
  open,
  title = "Error",
  message = "An error occurred.",
  onClose,
  secondaryAction,
}: ErrorModalProps) {
  const buttonsContainerRef = useRef<HTMLDivElement>(null);
  const [modalMinWidth, setModalMinWidth] = useState(400);

  useEffect(() => {
    if (buttonsContainerRef.current && open) {
      const width = buttonsContainerRef.current.offsetWidth;
      setModalMinWidth(Math.max(400, width));
    }
  }, [open, secondaryAction?.processing, secondaryAction?.processingLabel, secondaryAction?.label]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-8 text-center relative" style={{ display: 'inline-block', maxWidth: '90vw', minWidth: `${modalMinWidth}px` }}>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
          disabled={secondaryAction?.processing}
        >
          ×
        </button>
        <h3 className="text-lg font-semibold mb-6 whitespace-nowrap">{title}</h3>
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
          <p className="text-sm text-red-700 break-words">{message}</p>
        </div>
        <div ref={buttonsContainerRef} className={`flex justify-center items-center ${secondaryAction ? 'gap-4' : ''}`} style={{ width: 'max-content', minWidth: '400px', margin: '0 auto' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 transition text-gray-700 whitespace-nowrap flex-shrink-0"
            disabled={secondaryAction?.processing}
          >
            Close
          </button>
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 transition text-white flex items-center justify-center whitespace-nowrap"
              disabled={secondaryAction.processing}
            >
              {secondaryAction.processing && (
                <svg
                  className="animate-spin h-4 w-4 mr-2 text-white flex-shrink-0"
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
              {secondaryAction.processing ? (secondaryAction.processingLabel || "Processing...") : secondaryAction.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

