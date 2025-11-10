"use client";

import React from "react";

export function SpinnerOverlay({ message }: { message: string }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3">
        <svg
          className="animate-spin h-10 w-10 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        <span className="text-white text-sm">{message}</span>
      </div>
    </div>
  );
}


