import DashboardSidebar from "./DashboardSidebar";
import { ReactNode } from "react";

interface DashboardSidebar {
  children: ReactNode;
}

export default function AdminLayout({ children }: DashboardSidebar) {
  return (
    <div className="flex">
      <DashboardSidebar />

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
