"use client";

import { useEffect, useRef, useState } from "react";
import { getCustomersForDropdown } from "@/app/dashboard/customers/actions";
import { getServicesForDropdown } from "@/app/dashboard/services/actions";
import { getTechniciansForDropdown } from "@/app/dashboard/technicians/actions";

type AsyncState<T> = {
  data: T;
  isLoading: boolean;
  error: unknown | null;
};

// Simple module-level cache with TTL
type CacheEntry = { data: unknown[]; updatedAt: number };
const DROPDOWN_CACHE: Record<string, CacheEntry> = {};
const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Private generic hook to DRY dropdown fetching logic
function useDropdown<TServer, TView>(
  cacheKey: string,
  fetchFn: () => Promise<TServer[]>,
  mapFn: (item: TServer) => TView,
  ttlMs: number = DEFAULT_TTL_MS
): AsyncState<TView[]> {
  const [state, setState] = useState<AsyncState<TView[]>>({ data: [], isLoading: true, error: null });
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const now = Date.now();
    const cached = DROPDOWN_CACHE[cacheKey];

    // If we have fresh cache, serve immediately and refresh in background (SWR-like)
    if (cached && now - cached.updatedAt < ttlMs) {
      const mapped = (cached.data as TServer[]).map(mapFn);
      setState({ data: mapped, isLoading: false, error: null });
      // Background refresh
      (async () => {
        try {
          const fresh = await fetchFn();
          if (!mountedRef.current) return;
          DROPDOWN_CACHE[cacheKey] = { data: fresh as unknown as unknown[], updatedAt: Date.now() };
          const mappedFresh = fresh.map(mapFn);
          setState({ data: mappedFresh, isLoading: false, error: null });
        } catch {
          // keep cached data; do not flip to loading/error
        }
      })();
    } else {
      // No cache or stale -> fetch and cache
      (async () => {
        try {
          const raw = await fetchFn();
          if (!mountedRef.current) return;
          DROPDOWN_CACHE[cacheKey] = { data: raw as unknown as unknown[], updatedAt: Date.now() };
          const mapped = Array.isArray(raw) ? raw.map(mapFn) : [];
          setState({ data: mapped, isLoading: false, error: null });
        } catch (err) {
          if (!mountedRef.current) return;
          setState(prev => ({ ...prev, isLoading: false, error: err }));
        }
      })();
    }
    return () => {
      mountedRef.current = false;
    };
  }, [cacheKey, fetchFn, mapFn, ttlMs]);

  return state;
}

export function useCustomersDropdown(): AsyncState<{ id: string; name: string }[]> {
  return useDropdown(
    "customers",
    () => getCustomersForDropdown(),
    (c: { id: string; name: string }) => ({ id: c.id, name: c.name })
  );
}

export function useServicesDropdown(): AsyncState<{ id: string; displayName: string }[]> {
  return useDropdown(
    "services",
    () => getServicesForDropdown(),
    (s: { id: string; displayName: string }) => ({ id: s.id, displayName: s.displayName })
  );
}

export function useTechniciansDropdown(): AsyncState<{ id: string; technicianName: string }[]> {
  return useDropdown(
    "technicians",
    () => getTechniciansForDropdown(),
    (t: { id: string; technicianName: string }) => ({ id: t.id, technicianName: t.technicianName })
  );
}
