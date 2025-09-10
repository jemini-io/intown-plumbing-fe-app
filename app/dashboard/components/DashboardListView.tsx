import React from "react";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { DashboardCardObject } from "./DashboardCard";

type IconsData = {
  editIconTitle?: string;
  removeIconTitle?: string;
};

type DashboardListViewProps = {
  objects: DashboardCardObject[];
  cardTitle: string;
  iconsData?: IconsData;
  onEdit: (object: DashboardCardObject) => void;
  onRemove?: (object: DashboardCardObject) => void;
};

export function DashboardListView({
  objects,
  cardTitle,
  iconsData = {},
  onEdit,
  onRemove,
}: DashboardListViewProps) {
  return (
    <ul className="divide-y divide-gray-200">
      {objects.map((object, idx) => (
        <li key={idx} className="flex items-center justify-between p-2 hover:bg-blue-50">
          <div>
            <span className="font-medium">{object.name}</span>
            {object.description && (
              <p className="text-sm text-gray-500">
                {object.description.split('\n').map((line, idx) => (
                  <React.Fragment key={idx}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              className="text-blue-500 hover:underline font-medium px-1"
              onClick={() => onEdit(object)}
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
  );
}