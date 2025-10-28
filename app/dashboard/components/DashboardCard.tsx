import React from "react";

type IconsData = {
  plusIconTitle?: string;
  editIconTitle?: string;
  removeIconTitle?: string;
};

export type FormComponentProps<T = unknown> = {
  existing?: T;
  onSaved: () => void;
};

type DashboardCardProps = {
  backgroundEnabled?: boolean;
  ViewAllEnable?: boolean;
  viewAllLabel?: string;
  onViewAll?: () => void;
  iconsData?: IconsData;
  listView: React.ComponentType;
  title?: string;
  actionLabel?: string;
  onAction?: () => void;
  showHeader?: boolean;
  showViewAllLink?: boolean;
  modalContent?: React.ReactNode; // NUEVO
};

export function DashboardCard({
  backgroundEnabled = true,
  ViewAllEnable = true,
  viewAllLabel = "SHOW ALL",
  onViewAll,
  iconsData,
  listView: ListViewComponent,
  title,
  actionLabel,
  onAction,
  showHeader = false,
  showViewAllLink = false,
  modalContent,
}: DashboardCardProps) {
  return (
    <div className={`${backgroundEnabled ? "bg-white p-6 rounded-lg shadow" : ""}`}>
      {showHeader && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-row items-center gap-4">
            {title && <h2 className="text-2xl font-bold">{title}</h2>}
            {showViewAllLink && onViewAll && (
              <button
                type="button"
                className="px-2 py-0 rounded transition h-6 flex items-center"
                style={{ backgroundColor: "transparent" }}
                onClick={onViewAll}
                title={viewAllLabel}
                onMouseOver={e => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f3f4f6";
                }}
                onMouseOut={e => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                }}
              >
                <span className="text-xs font-semibold text-blue-600">SHOW ALL</span>
              </button>
            )}
          </div>
          {actionLabel && onAction && (
            <button
              type="button"
              className="bg-blue-600 text-white px-4 py-2 rounded font-semibold shadow hover:bg-blue-700 transition flex items-center"
              onClick={onAction}
              title={iconsData?.plusIconTitle || actionLabel}
            >
              {actionLabel}
            </button>
          )}
        </div>
      )}
      <div className="mt-4">
        <ListViewComponent />
      </div>
      {ViewAllEnable && onViewAll && !showHeader && (
        <div className="flex justify-center items-center h-6">
          <button
            type="button"
            className="px-2 py-0 rounded transition h-6 flex items-center"
            style={{ backgroundColor: "transparent" }}
            onClick={onViewAll}
            title={viewAllLabel}
            onMouseOver={e => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f3f4f6";
            }}
            onMouseOut={e => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
            }}
          >
            <span className="text-xs font-semibold text-blue-600">{viewAllLabel}</span>
          </button>
        </div>
      )}
      {modalContent}
    </div>
  );
}