import React, { useState } from "react";

type IconsData = {
  plusIconTitle?: string;
  editIconTitle?: string;
  removeIconTitle?: string;
};

export type FormComponentProps = {
  existing?: unknown;
  onSaved: () => void;
};

type DashboardCardProps = {
  viewAllLabel?: string;
  onViewAll?: () => void;
  iconsData?: IconsData;
  listView: React.ComponentType;
  form: React.ComponentType<FormComponentProps>;
};

// function Modal({
//   open,
//   onClose,
//   children,
// }: {
//   open: boolean;
//   onClose: () => void;
//   children: React.ReactNode;
// }) {
//   if (!open) return null;
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
//       <div className="bg-white rounded-xl shadow-lg p-8 min-w-[350px] relative">
//         <button
//           onClick={onClose}
//           className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
//         >
//           ×
//         </button>
//         {children}
//       </div>
//     </div>
//   );
// }

export function DashboardCard({
  viewAllLabel = "View All",
  onViewAll,
  iconsData = {},
  listView: ListViewComponent,
}: DashboardCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      {/* <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-semibold">{cardTitle}</h2>
        <button
          className="p-2 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition"
          title={iconsData.plusIconTitle || `Add new ${cardTitle}`}
          onClick={handleAdd}
        >
          <PlusIcon className="h-6 w-6" />
        </button> 
      </div> */}
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