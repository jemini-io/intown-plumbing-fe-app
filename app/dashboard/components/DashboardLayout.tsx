import DashboardSidebar from "./DashboardSidebar";
import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <div className="w-20 shrink-0" />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
