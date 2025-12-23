"use client";

import { createContext, useContext, ReactNode } from "react";

interface DashboardContextType {
  refresh: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ 
  children, 
  refresh 
}: { 
  children: ReactNode;
  refresh: () => Promise<void>;
}) {
  return (
    <DashboardContext.Provider value={{ refresh }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboardRefresh() {
  const context = useContext(DashboardContext);
  if (!context) {
    return undefined;
  }
  return context.refresh;
}

