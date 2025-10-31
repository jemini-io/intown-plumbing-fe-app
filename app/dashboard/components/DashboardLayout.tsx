import DashboardSidebar from "./DashboardSidebar";
import { ReactNode, useState, useEffect } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar-collapsed");
    if (stored) setCollapsed(stored === "true");
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem("sidebar-collapsed", String(collapsed));
    }
  }, [collapsed, loading]);

  const sidebarWidth = collapsed ? 80 : 288;

  if (loading) return null;

  return (
    <>
      <DashboardSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <main
        className="transition-all duration-200 bg-gray-100"
        style={{ marginLeft: sidebarWidth }}
      >
        {children}
      </main>
    </>
  );
}
