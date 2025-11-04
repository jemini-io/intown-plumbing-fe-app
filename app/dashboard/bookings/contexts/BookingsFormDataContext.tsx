"use client";

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { getCustomersForDropdown } from "@/app/dashboard/customers/actions";
import { getServicesForDropdown } from "@/app/dashboard/services/actions";
import { getTechniciansForDropdown } from "@/app/dashboard/technicians/actions";

type CustomersItem = { id: string; name: string };
type ServicesItem = { id: string; displayName: string; enabled?: boolean };
type TechniciansItem = { id: string; technicianName: string; enabled?: boolean };

type BookingsFormDataContextType = {
  customers: CustomersItem[];
  services: ServicesItem[];
  technicians: TechniciansItem[];
  loaded: boolean;
  load: () => Promise<void>;
};

const Ctx = createContext<BookingsFormDataContextType | null>(null);

export function useBookingsFormData() {
  return useContext(Ctx);
}

export function BookingsFormDataProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomers] = useState<CustomersItem[]>([]);
  const [services, setServices] = useState<ServicesItem[]>([]);
  const [technicians, setTechnicians] = useState<TechniciansItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const loadingRef = useRef<Promise<void> | null>(null);

  const load = useCallback(async () => {
    if (loaded) return;
    if (loadingRef.current) return loadingRef.current;
    const promise = (async () => {
      const [c, s, t] = await Promise.all([
        getCustomersForDropdown(),
        getServicesForDropdown(),
        getTechniciansForDropdown(),
      ]);
      setCustomers(c);
      setServices(s);
      setTechnicians(t);
      setLoaded(true);
    })();
    loadingRef.current = promise;
    await promise;
  }, [loaded]);

  const value = useMemo(
    () => ({ customers, services, technicians, loaded, load }),
    [customers, services, technicians, loaded, load]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}


