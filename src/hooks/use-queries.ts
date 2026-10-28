"use client";

import useSWR from "swr";
import { SurpriseBag, Store, Order } from "@/types/domain";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${res.status}`);
  }
  const json = await res.json();
  return json.data;
};

export function useBags(storeId?: string) {
  const query = storeId ? `?storeId=${encodeURIComponent(storeId)}` : "";
  const { data, error, isLoading, mutate } = useSWR<SurpriseBag[]>(
    `/api/bags${query}`,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 4000,
    }
  );

  return {
    bags: data || [],
    isLoading,
    isError: Boolean(error),
    error,
    mutate,
  };
}

export function useStores() {
  const { data, error, isLoading, mutate } = useSWR<Store[]>(
    "/api/stores",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );

  return {
    stores: data || [],
    isLoading,
    isError: Boolean(error),
    error,
    mutate,
  };
}

export function useOrders(filter?: { buyerId?: string; storeId?: string }) {
  const params = new URLSearchParams();
  if (filter?.buyerId) params.set("buyerId", filter.buyerId);
  if (filter?.storeId) params.set("storeId", filter.storeId);
  const query = params.toString() ? `?${params.toString()}` : "";

  const { data, error, isLoading, mutate } = useSWR<Order[]>(
    `/api/orders${query}`,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  return {
    orders: data || [],
    isLoading,
    isError: Boolean(error),
    error,
    mutate,
  };
}

export function useLocations() {
  const { data, error, isLoading } = useSWR<string[]>(
    "/api/locations",
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    locations: data || [
      "Semua Lokasi",
      "Tuparev",
      "Kartini",
      "Siliwangi",
      "Kesambi",
      "Harjamukti",
      "Kedawung",
    ],
    isLoading,
    isError: Boolean(error),
  };
}

export function useAuditLogs(filter?: { action?: string; role?: string }) {
  const params = new URLSearchParams();
  if (filter?.action) params.set("action", filter.action);
  if (filter?.role) params.set("role", filter.role);
  const query = params.toString() ? `?${params.toString()}` : "";

  const { data, error, isLoading, mutate } = useSWR(
    `/api/admin/audit-logs${query}`,
    fetcher,
    {
      revalidateOnFocus: true,
      dedupingInterval: 3000,
    }
  );

  return {
    logs: (data || []) as any[],
    isLoading,
    isError: Boolean(error),
    error,
    mutate,
  };
}
