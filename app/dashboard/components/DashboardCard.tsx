import React from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

type IconsData = {
  plusIconTitle?: string;
  editIconTitle?: string;
  removeIconTitle?: string;
};

export type DashboardCardObject = {
  name: string;
  description?: string;
};

type DashboardCardProps = {
  cardTitle: string;
  objects: Array<DashboardCardObject>;
  onAdd?: () => void;
  onEdit?: (object: DashboardCardObject) => void;
  onRemove?: (object: DashboardCardObject) => void;
  viewAllLabel?: string;
  onViewAll?: () => void;
  iconsData?: IconsData;
};

export function DashboardCard({
  cardTitle,
  objects,
  onAdd,
  onEdit,
  onRemove,
  viewAllLabel = "View All",
  onViewAll,
  iconsData = {},
}: DashboardCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-semibold">{cardTitle}</h2>
        <button
          className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition"
          title={iconsData.plusIconTitle || `Add new ${cardTitle}`}
          onClick={onAdd}
        >
          <PlusIcon className="h-6 w-6" />
        </button>
      </div>
      <div className="mt-4">
        <ul className="divide-y divide-gray-200">
          {objects.map((object, idx) => (
            <li key={idx} className="flex items-center justify-between p-2 hover:bg-blue-50">
              <div>
                <span className="font-medium">{object.name}</span>
                {object.description && (
                  <p className="text-sm text-gray-500">{object.description.split('\n').map((line, idx) => (
                    <React.Fragment key={idx}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  className="text-blue-500 hover:underline font-medium px-1"
                  onClick={() => onEdit?.(object)}
                  title={iconsData.editIconTitle || `Edit ${cardTitle}`}
                >
                  <PencilIcon className="h-4 w-4 inline-block" />
                </button>
                <button
                  className="text-red-500 hover:underline font-medium px-1"
                  onClick={() => onRemove?.(object)}
                  title={iconsData.removeIconTitle || `Remove ${cardTitle}`}
                >
                  <TrashIcon className="h-4 w-4 inline-block" />
                </button>
              </div>
            </li>
          ))}
        </ul>
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