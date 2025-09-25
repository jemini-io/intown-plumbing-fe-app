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
  viewAllLabel?: string;
  onViewAll?: () => void;
  iconsData?: IconsData;
  listView: React.ComponentType;
};

export function DashboardCard({
  viewAllLabel = "View All",
  onViewAll,
  listView: ListViewComponent,
}: DashboardCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="mt-4">
        <ListViewComponent />
      </div>
      <div className="mt-4">
        <button
          className="text-blue-500 hover:underline font-medium"
          onClick={onViewAll}
        >
          {viewAllLabel}
        </button>
      </div>
    </div>
  );
}