import AdminSidebar from "./AdminSidebar";
import { ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex">
      <AdminSidebar />

      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
