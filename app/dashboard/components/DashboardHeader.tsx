"use client";

import { type ReactNode, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { BookingsForm } from "../bookings/components/BookingsForm";
import { useDashboardRefresh } from "../contexts/DashboardContext";
import { ComingSoonModal } from "@/app/components/ComingSoonModal";

export interface DashboardHeaderPanelProps {
  title: string;
  content: ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  linkText?: string;
  onLinkClick?: () => void;
}

export function DashboardHeaderPanel({ title, content, icon: Icon, linkText, onLinkClick }: DashboardHeaderPanelProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex gap-2 mb-2">
        <Icon className="h-5 w-5 text-gray-600 flex-shrink-0 self-center -mt-2" />
        <h3 className="text-sm font-medium text-gray-600 leading-none flex items-center">{title}</h3>
      </div>
      <div className="flex items-baseline gap-3">
        <div className="text-4xl font-semibold text-gray-900">{content}</div>
        {linkText && (
          <span
            onClick={onLinkClick}
            className="text-blue-600 uppercase font-semibold text-sm hover:text-blue-800 transition cursor-pointer"
          >
            {linkText}
          </span>
        )}
      </div>
    </div>
  );
}

export function DashboardHeaderTop() {
  const [modalOpen, setModalOpen] = useState(false);
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dashboardRefresh = useDashboardRefresh();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleBookingSaved = async () => {
    handleCloseModal();
    if (dashboardRefresh) {
      await dashboardRefresh();
    }
  };

  const modalContent = modalOpen ? (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-[700px] overflow-auto relative" style={{ minWidth: 400, maxHeight: "90vh" }}>
        <button
          onClick={handleCloseModal}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
        >
          ×
        </button>
        <BookingsForm
          onSaved={handleBookingSaved}
        />
      </div>
    </div>
  ) : null;


  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Dashboard</h1>
          {/* Time Range Selector Stub */}
          <div className="flex items-center gap-2 px-3 py-2">
            <button
              type="button"
              onClick={() => setComingSoonOpen(true)}
              className="text-gray-600 hover:text-gray-900 transition"
              aria-label="Previous period"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="px-3 text-gray-700 font-medium">Last Month</span>
            <button
              type="button"
              onClick={() => setComingSoonOpen(true)}
              className="text-gray-600 hover:text-gray-900 transition"
              aria-label="Next period"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        {/* New Booking Button */}
        <button
          type="button"
          onClick={handleOpenModal}
          className="bg-blue-600 text-white px-4 py-2 rounded font-semibold shadow hover:bg-blue-700 transition flex items-center gap-2"
        >
          <svg 
            className="w-4 h-4 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 4v16m8-8H4" 
            />
          </svg>
          New Booking
        </button>
      </div>
      {mounted && createPortal(modalContent, document.body)}
      {mounted && createPortal(
        <ComingSoonModal
          open={comingSoonOpen}
          onClose={() => setComingSoonOpen(false)}
        />,
        document.body
      )}
    </>
  );
}

